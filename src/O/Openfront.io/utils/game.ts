import { mapNames } from "./maps"

const gamePathPattern = /(?:^|\/)game\/([a-zA-Z0-9]{8,10})(?:\/|$)/
const replayHostPathPattern = /^\/([a-zA-Z0-9]{8,10})\/?$/
const replayViewerHashPattern = /^#replay-viewer=([a-zA-Z0-9]{8,10})$/
const mapResourcePattern = /\/maps\/([^/]+)\/map(?:4x|16x)?\.[^/]+\.bin(?:\?|$)/
const mapThumbnailPattern = /\/maps\/([^/]+)\/thumbnail/
const heartbeatPattern = /\/api\/singleplayer\/([a-zA-Z0-9]{8,10})\/heartbeat/
const recordPattern = /^https?:\/\/[^/]+\/game\/([a-zA-Z0-9]{8,10})(?:\?|$)/
const lobbyInfoTtlMs = 10_000
const retryDelayMs = 15_000

export type GameKind = "multiplayer" | "singleplayer" | "replay"
export type GamePhase = "lobby" | "live" | "finished"

export type GameInfo = {
  map?: string
  gameType?: string
  gameMode?: string
  rankedType?: string
  maxPlayers?: number
  playerCount?: number
  startsAt?: number
}

export type Game = GameInfo & {
  kind: GameKind
  phase: GamePhase
  gameId?: string
  mapId?: string
  hosting: boolean
  spectating: boolean
  startTimestamp?: number
}

// provisional: the kind was a guess (no id or evidence yet) and is resolved again on the next tick.
type Session = { kind: GameKind, gameId?: string, startedAt: number, provisional: boolean }
type Cached<T> = { id: string, at: number, value: T }

let session: Session | undefined
let cachedInfo: Cached<GameInfo> | undefined
let cachedRecord: Cached<GameInfo> | undefined
let failed: { id: string, at: number } | undefined
let spectatingGameId: string | undefined

const now = (): number => Date.now()

const resourceEntries = (): PerformanceResourceTiming[] =>
  performance.getEntriesByType("resource") as PerformanceResourceTiming[]

const lastResource = (pattern: RegExp): { id: string, url: string, at: number } | undefined => {
  const entries = resourceEntries()
  for (let index = entries.length - 1; index >= 0; index--) {
    const id = entries[index].name.match(pattern)?.[1]
    if (id) return { id, url: entries[index].name, at: entries[index].startTime }
  }
  return undefined
}

export const getPathGameId = (): string | undefined => window.location.pathname.match(gamePathPattern)?.[1]

const getReplayId = (): string | undefined => {
  const fromHash = window.location.hash.match(replayViewerHashPattern)?.[1]
  if (fromHash) return fromHash
  if (window.location.hostname.startsWith("replay.")) return window.location.pathname.match(replayHostPathPattern)?.[1]
  return undefined
}

export const isInGame = (): boolean => document.body.classList.contains("in-game")

// The most recently loaded map file is the current one; older games stay in the timing buffer.
export const getLoadedMapId = (): string | undefined => lastResource(mapResourcePattern)?.id

// Lobby modals show the map thumbnail before any map file is downloaded.
const getLobbyMapId = (): string | undefined => {
  for (const modal of ["host-lobby-modal", "join-lobby-modal"]) {
    for (const image of document.querySelectorAll<HTMLImageElement>(`${modal} img[src*="/maps/"]`)) {
      const id = image.getAttribute("src")?.match(mapThumbnailPattern)?.[1]
      if (id) return id
    }
  }
  return undefined
}

export const getMapDisplayName = (mapId: string | undefined, apiName?: string): string | undefined => {
  if (apiName) return apiName
  if (!mapId) return undefined
  return mapNames[mapId] ?? mapId.split(/[-_]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
}

const getGameEndpoint = (gameId: string): string => {
  const encodedGameId = encodeURIComponent(gameId)
  const resources = resourceEntries().map((entry) => entry.name)
  const existsRequest = resources.find((url) => url.includes(`/api/game/${encodedGameId}/exists`))
  if (existsRequest) return existsRequest.replace(/\/exists(?:\?.*)?$/, "")

  const socketResource = resources.find((url) => {
    if (!url.startsWith("ws://") && !url.startsWith("wss://")) return false
    try {
      return /\/w\d+\/?$/.test(new URL(url).pathname)
    } catch {
      return false
    }
  })
  const socket = socketResource ? new URL(socketResource) : undefined
  const routeMatch = window.location.pathname.match(/\/(w\d+)\/game\//)
  const workerPath = socket?.pathname.replace(/\/$/, "") || (routeMatch ? `/${routeMatch[1]}` : "")
  const origin = socket ? `${socket.protocol === "wss:" ? "https:" : "http:"}//${socket.host}` : window.location.origin

  return `${origin}${workerPath}/api/game/${encodedGameId}`
}

type Config = {
  gameMap?: unknown
  gameType?: unknown
  gameMode?: unknown
  rankedType?: unknown
  maxPlayers?: unknown
}

const str = (value: unknown): string | undefined => typeof value === "string" ? value : undefined
const num = (value: unknown): number | undefined => typeof value === "number" && Number.isFinite(value) ? value : undefined

const fromConfig = (config: Config | undefined): GameInfo => ({
  map: str(config?.gameMap),
  gameType: str(config?.gameType),
  gameMode: str(config?.gameMode),
  rankedType: str(config?.rankedType),
  maxPlayers: num(config?.maxPlayers),
})

const hasFailed = (id: string): boolean => failed?.id === id && now() - failed.at < retryDelayMs

const fail = (id: string): undefined => {
  failed = { id, at: now() }
  return undefined
}

// Live lobby / game state from the worker hosting the game. Refreshed while the lobby is open
// (players come and go, the host edits the config), then frozen once the game is running.
const getLiveInfo = async (gameId: string, running: boolean, log: (message: string) => void): Promise<GameInfo | undefined> => {
  if (cachedInfo?.id === gameId && (running || now() - cachedInfo.at < lobbyInfoTtlMs)) return cachedInfo.value
  if (hasFailed(gameId)) return cachedInfo?.id === gameId ? cachedInfo.value : undefined

  try {
    const response = await fetch(getGameEndpoint(gameId))
    if (!response.ok) {
      log(`Game lookup returned HTTP ${response.status}`)
      return fail(gameId)
    }

    const body = await response.json() as {
      gameConfig?: Config
      startsAt?: unknown
      clients?: { spectator?: boolean }[]
    }
    if (typeof body.gameConfig?.gameMap !== "string") {
      log("Game map was not found in the game response")
      return fail(gameId)
    }

    const value: GameInfo = {
      ...fromConfig(body.gameConfig),
      startsAt: num(body.startsAt),
      playerCount: Array.isArray(body.clients) ? body.clients.filter((client) => !client.spectator).length : undefined,
    }
    cachedInfo = { id: gameId, at: now(), value }
    failed = undefined
    return value
  } catch (error) {
    log(`Game lookup failed: ${error instanceof Error ? error.message : "request error"}`)
    return fail(gameId)
  }
}

// Archived game record behind a replay.
const getRecordInfo = async (gameId: string, url: string | undefined, log: (message: string) => void): Promise<GameInfo | undefined> => {
  if (cachedRecord?.id === gameId) return cachedRecord.value
  if (!url || hasFailed(gameId)) return undefined

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } })
    if (!response.ok) {
      log(`Replay lookup returned HTTP ${response.status}`)
      return fail(gameId)
    }

    const body = await response.json() as { info?: { config?: Config, players?: unknown[] } }
    const value: GameInfo = {
      ...fromConfig(body.info?.config),
      playerCount: Array.isArray(body.info?.players) ? body.info.players.length : undefined,
    }
    cachedRecord = { id: gameId, at: now(), value }
    failed = undefined
    return value
  } catch (error) {
    log(`Replay lookup failed: ${error instanceof Error ? error.message : "request error"}`)
    return fail(gameId)
  }
}

type Resolved = { kind: GameKind, gameId?: string, certain: boolean, recordUrl?: string }

const resolveKind = async (log: (message: string) => void): Promise<Resolved> => {
  const replayId = getReplayId()
  const record = lastResource(recordPattern)
  const heartbeat = lastResource(heartbeatPattern)
  const pathId = getPathGameId()

  if (replayId) return { kind: "replay", gameId: replayId, certain: true, recordUrl: record?.id === replayId ? record.url : undefined }

  if (pathId) {
    if (await getLiveInfo(pathId, true, log)) return { kind: "multiplayer", gameId: pathId, certain: true }
    // A finished game is gone from its worker: what plays is the archived record.
    if (record?.id === pathId) return { kind: "replay", gameId: pathId, certain: true, recordUrl: record.url }
    return { kind: "multiplayer", gameId: pathId, certain: false }
  }

  if (heartbeat && (!record || heartbeat.at > record.at)) return { kind: "singleplayer", gameId: heartbeat.id, certain: true }
  if (record) return { kind: "replay", gameId: record.id, certain: true, recordUrl: record.url }
  // Streamer mode hides the lobby id from the URL: still a server game, just anonymous.
  if (window.location.pathname === "/streamer-mode") return { kind: "multiplayer", certain: true }
  return { kind: "singleplayer", certain: false }
}

const getInGame = async (log: (message: string) => void): Promise<Game> => {
  // A new game must not inherit the lobby-phase snapshot of the previous one.
  if (!session) {
    cachedInfo = undefined
    failed = undefined
  }
  // Decided once per game: the timing buffer can drop old entries mid-game.
  const resolved = !session || session.provisional ? await resolveKind(log) : undefined
  if (resolved) {
    session = {
      kind: resolved.kind,
      gameId: resolved.gameId,
      startedAt: session?.startedAt ?? Math.floor(now() / 1000),
      provisional: !resolved.certain,
    }
  }
  const current = session as Session

  let info: GameInfo | undefined
  if (current.kind === "multiplayer" && current.gameId) info = await getLiveInfo(current.gameId, true, log)
  if (current.kind === "replay" && current.gameId) {
    info = await getRecordInfo(current.gameId, resolved?.recordUrl ?? lastResource(recordPattern)?.url, log)
  }

  const mapId = getLoadedMapId()
  return {
    ...info,
    kind: current.kind,
    phase: current.kind !== "replay" && window.location.search.includes("replay") ? "finished" : "live",
    gameId: current.gameId,
    mapId,
    map: getMapDisplayName(mapId, info?.map),
    hosting: false,
    spectating: current.gameId !== undefined && spectatingGameId === current.gameId,
    startTimestamp: current.startedAt,
  }
}

const getLobby = async (pageId: string | undefined, log: (message: string) => void): Promise<Game | undefined> => {
  const hosting = pageId === "page-host-lobby"
  const joining = pageId === "page-join-lobby"
  if (!hosting && !joining) return undefined

  const gameId = getPathGameId()
  const info = gameId ? await getLiveInfo(gameId, false, log) : undefined
  const mapId = getLobbyMapId()

  return {
    gameType: hosting ? "Private" : undefined,
    ...info,
    kind: "multiplayer",
    phase: "lobby",
    gameId,
    mapId,
    map: getMapDisplayName(mapId, info?.map),
    hosting,
    spectating: gameId !== undefined && spectatingGameId === gameId,
  }
}

// `pageId` is the visible page-content id, if any (the lobby modals are pages of the menu).
export const getCurrentGame = async (pageId: string | undefined, log: (message: string) => void): Promise<Game | undefined> => {
  // The join flow rewrites ?spectate to ?live, so remember it for this game.
  const pathId = getPathGameId()
  if (pathId && window.location.search.includes("spectate")) spectatingGameId = pathId

  if (isInGame()) return getInGame(log)

  session = undefined
  return getLobby(pageId, log)
}
