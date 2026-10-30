import { getPlayerName } from "./activity"
import { getMapId, getMapName, matchesWinModal } from "./lang"
import { forgetMenuSelection, getMenuMapId, getRememberedMapId, trackMenuSelection } from "./menu"
import { getSeenResources, lastResource } from "./resources"
import { getLiveStats, resetLiveStats, type LiveStats } from "./stats"

const gamePathPattern = /(?:^|\/)game\/([a-zA-Z0-9]{8,10})(?:\/|$)/
const replayHostPathPattern = /^\/([a-zA-Z0-9]{8,10})\/?$/
const replayViewerHashPattern = /^#replay-viewer=([a-zA-Z0-9]{8,10})$/
const loadedMapPattern = /\/maps\/([^/]+)\/(?:map(?:4x|16x)?\.[^/]+\.bin|manifest\.json)(?:\?|$)/
const heartbeatPattern = /\/api\/singleplayer\/([a-zA-Z0-9]{8,10})\/heartbeat/
const recordPattern = /^https?:\/\/[^/]+\/game\/([a-zA-Z0-9]{8,10})(?:\?|$)/
const lobbyInfoTtlMs = 10_000
const retryDelayMs = 15_000
// A player who never shows a control panel after this long is watching, not playing.
const spectatorGraceMs = 120_000

export type GameKind = "multiplayer" | "singleplayer" | "replay"
export type GamePhase = "lobby" | "live" | "finished"
export type Outcome = "victory" | "defeat" | "cancelled"
export type Tag = "compact" | "crowded" | "randomSpawn" | "hardNations" | "noAlliances" | "noNukes" | "peaceTime" | "waterNukes" | "doomsday"

export type GameInfo = {
  map?: string
  gameType?: string
  gameMode?: string
  rankedType?: string
  difficulty?: string
  teams?: string | number
  tags?: Tag[]
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
  eliminated: boolean
  outcome?: Outcome
  startTimestamp?: number
  stats?: LiveStats
}

// provisional: the kind was a guess (no id or evidence yet) and is resolved again on the next tick.
type Session = {
  kind: GameKind
  gameId?: string
  startedAt: number
  provisional: boolean
  sawPanel: boolean
  outcome?: Outcome
}
type Cached<T> = {
  id: string
  at: number
  value: T
}
type Resolved = {
  kind: GameKind
  gameId?: string
  certain: boolean
  recordUrl?: string
}

let session: Session | undefined
let cachedInfo: Cached<GameInfo> | undefined
let cachedRecord: Cached<GameInfo> | undefined
let failed:
  | {
      id: string
      at: number
    }
  | undefined
let spectatingGameId = new URLSearchParams(window.location.search).has("spectate")
  ? window.location.pathname.match(gamePathPattern)?.[1]
  : undefined

const now = (): number => Date.now()

const getPathGameId = (): string | undefined => window.location.pathname.match(gamePathPattern)?.[1]

const getReplayId = (): string | undefined => {
  const fromHash = window.location.hash.match(replayViewerHashPattern)?.[1]

  if (fromHash) return fromHash
  if (window.location.hostname.startsWith("replay.")) return window.location.pathname.match(replayHostPathPattern)?.[1]

  return undefined
}

export const isInGame = (): boolean => document.body.classList.contains("in-game")

export const getMapDisplayName = (mapId: string | undefined, apiName?: string): string | undefined => {
  if (apiName) return apiName
  if (!mapId) return undefined

  return (
    getMapName(mapId) ??
    mapId
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  )
}

const getGameEndpoint = (gameId: string): string => {
  const encodedGameId = encodeURIComponent(gameId)
  const resources = getSeenResources().map((entry) => entry.name).reverse()

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
  difficulty?: unknown
  playerTeams?: unknown
  gameMapSize?: unknown
  maxPlayers?: unknown
  publicGameModifiers?: Record<string, unknown>
}

const str = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined)

const num = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined)

const getTags = (config: Config | undefined): Tag[] => {
  const modifiers = config?.publicGameModifiers ?? {}
  const checks: [boolean, Tag][] = [
    [config?.gameMapSize === "Compact" || modifiers.isCompact === true, "compact"],
    [modifiers.isCrowded === true, "crowded"],
    [modifiers.isRandomSpawn === true, "randomSpawn"],
    [modifiers.isHardNations === true, "hardNations"],
    [modifiers.isAlliancesDisabled === true, "noAlliances"],
    [modifiers.isNukesDisabled === true, "noNukes"],
    [modifiers.isPeaceTime === true, "peaceTime"],
    [modifiers.isWaterNukes === true, "waterNukes"],
    [modifiers.isDoomsdayClock === true, "doomsday"]
  ]
  return checks.filter(([enabled]) => enabled).map(([, tag]) => tag)
}

const fromConfig = (config: Config | undefined): GameInfo => ({
  map: str(config?.gameMap),
  gameType: str(config?.gameType),
  gameMode: str(config?.gameMode),
  rankedType: str(config?.rankedType),
  difficulty: str(config?.difficulty),
  teams: str(config?.playerTeams) ?? num(config?.playerTeams),
  tags: getTags(config),
  maxPlayers: num(config?.maxPlayers)
})

const hasFailed = (id: string): boolean => failed?.id === id && now() - failed.at < retryDelayMs

const fail = (id: string): undefined => {
  failed = {
    id,
    at: now()
  }
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

    const body = (await response.json()) as {
      gameConfig?: Config
      startsAt?: unknown
      clients?: {
        spectator?: boolean
      }[]
    }

    if (typeof body.gameConfig?.gameMap !== "string") {
      log("Game map was not found in the game response")
      return fail(gameId)
    }

    const value: GameInfo = {
      ...fromConfig(body.gameConfig),
      startsAt: num(body.startsAt),
      playerCount: Array.isArray(body.clients) ? body.clients.filter((client) => !client.spectator).length : undefined
    }
    cachedInfo = {
      id: gameId,
      at: now(),
      value
    }
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
    const response = await fetch(url, {
      headers: { Accept: "application/json" }
    })

    if (!response.ok) {
      log(`Replay lookup returned HTTP ${response.status}`)
      return fail(gameId)
    }

    const body = (await response.json()) as {
      info?: {
        config?: Config
        players?: unknown[]
      }
    }
    const value: GameInfo = {
      ...fromConfig(body.info?.config),
      playerCount: Array.isArray(body.info?.players) ? body.info.players.length : undefined
    }
    cachedRecord = {
      id: gameId,
      at: now(),
      value
    }
    failed = undefined
    return value
  } catch (error) {
    log(`Replay lookup failed: ${error instanceof Error ? error.message : "request error"}`)
    return fail(gameId)
  }
}

const resolveKind = async (log: (message: string) => void): Promise<Resolved> => {
  const replayId = getReplayId()
  const record = lastResource(recordPattern)
  const heartbeat = lastResource(heartbeatPattern)
  const pathId = getPathGameId()

  if (replayId) return {
    kind: "replay",
    gameId: replayId,
    certain: true,
    recordUrl: record?.id === replayId ? record.url : undefined
  }

  if (pathId) {
    if (await getLiveInfo(pathId, true, log)) return {
      kind: "multiplayer",
      gameId: pathId,
      certain: true
    }
    // A finished game is gone from its worker: what plays is the archived record.
    if (record?.id === pathId)
      return {
        kind: "replay",
        gameId: pathId,
        certain: true,
        recordUrl: record.url
      }

    return {
      kind: "multiplayer",
      gameId: pathId,
      certain: false
    }
  }

  if (heartbeat && (!record || heartbeat.at > record.at)) return {
    kind: "singleplayer",
    gameId: heartbeat.id,
    certain: true
  }
  if (record) return {
    kind: "replay",
    gameId: record.id,
    certain: true,
    recordUrl: record.url
  }
  // Streamer mode hides the lobby id from the URL: still a server game, just anonymous.
  if (window.location.pathname === "/streamer-mode")
    return {
      kind: "multiplayer",
      certain: true
    }

  return {
    kind: "singleplayer",
    certain: false
  }
}

const isControlPanelShown = (): boolean => {
  const panel = document.querySelector("control-panel > div")
  return panel !== null && !panel.classList.contains("hidden")
}

// The end-of-game dialog titles are translated by the game; they are matched against its own translations.
const readOutcome = (): Outcome | undefined => {
  const dialog = document.querySelector("win-modal > div:not(.hidden)")
  const title = dialog?.querySelector("h2")?.textContent

  if (!title) return undefined
  if (matchesWinModal(title, ["you_won", "your_team"])) return "victory"
  if (matchesWinModal(title, ["other_won", "other_team", "nation_won"])) return "defeat"
  if (matchesWinModal(title, ["match_cancelled"])) return "cancelled"

  return undefined
}

const getInGame = async (log: (message: string) => void): Promise<Game> => {
  // A new game must not inherit the lobby-phase snapshot of the previous one.
  if (!session) {
    cachedInfo = undefined
    failed = undefined
    resetLiveStats()
  }
  // Decided once per game: the timing buffer can drop old entries mid-game.
  const resolved = !session || session.provisional ? await resolveKind(log) : undefined

  if (resolved) {
    session = {
      kind: resolved.kind,
      gameId: resolved.gameId,
      startedAt: session?.startedAt ?? Math.floor(now() / 1000),
      provisional: !resolved.certain,
      sawPanel: session?.sawPanel ?? false,
      outcome: session?.outcome
    }
  }

  const current = session as Session

  let info: GameInfo | undefined
  if (current.kind === "multiplayer" && current.gameId) info = await getLiveInfo(current.gameId, true, log)

  if (current.kind === "replay" && current.gameId) {
    info = await getRecordInfo(current.gameId, resolved?.recordUrl ?? lastResource(recordPattern)?.url, log)
  }

  const panelShown = isControlPanelShown()
  if (panelShown) current.sawPanel = true
  const outcome = readOutcome()
  if (outcome) current.outcome = outcome

  // Priority: the server's own name for the map, then what the menu showed, then the loaded files.
  const mapId = (info?.map ? getMapId(info.map) : undefined) ?? getRememberedMapId() ?? lastResource(loadedMapPattern)?.id
  const playing = current.kind !== "replay"
  const finished = current.outcome !== undefined || new URLSearchParams(window.location.search).has("replay")
  const watchedFor = now() - current.startedAt * 1000
  const spectating =
    current.kind === "multiplayer" &&
    ((current.gameId !== undefined && spectatingGameId === current.gameId) || (!current.sawPanel && !finished && watchedFor > spectatorGraceMs))

  return {
    ...info,
    kind: current.kind,
    phase: playing && finished ? "finished" : "live",
    gameId: current.gameId,
    mapId,
    map: getMapDisplayName(mapId, info?.map),
    hosting: false,
    spectating,
    eliminated: playing && !finished && current.sawPanel && !panelShown,
    outcome: current.outcome,
    startTimestamp: current.startedAt,
    stats: playing && !finished && !spectating ? getLiveStats(getPlayerName()) : undefined
  }
}

const getLobby = async (pageId: string | undefined, log: (message: string) => void): Promise<Game | undefined> => {
  const hosting = pageId === "page-host-lobby"
  const joining = pageId === "page-join-lobby"

  if (!hosting && !joining) return undefined

  const gameId = getPathGameId()
  const info = gameId ? await getLiveInfo(gameId, false, log) : undefined
  const mapId = (info?.map ? getMapId(info.map) : undefined) ?? getMenuMapId()
  // An open join dialog with no lobby behind it (no game, no map) is only menu browsing.
  if (!gameId && !mapId) return undefined

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
    eliminated: false
  }
}

// `pageId` is the visible page-content id, if any (the lobby modals are pages of the menu).
export const getCurrentGame = async (pageId: string | undefined, log: (message: string) => void): Promise<Game | undefined> => {
  // The join flow rewrites ?spectate to ?live, so remember it for this game.
  const pathId = getPathGameId()
  if (pathId !== spectatingGameId) spectatingGameId = undefined
  if (pathId && new URLSearchParams(window.location.search).has("spectate")) spectatingGameId = pathId

  if (session && pathId && session.gameId !== pathId) {
    session = undefined
    forgetMenuSelection()
  }

  if (isInGame()) return getInGame(log)

  if (session) {
    session = undefined
    forgetMenuSelection()
  }

  trackMenuSelection()
  return getLobby(pageId, log)
}
