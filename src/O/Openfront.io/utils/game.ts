const gamePathPattern = /(?:^|\/)game\/([a-zA-Z0-9]{8,10})(?:\/|$)/
const mapResourcePattern = /\/maps\/([^/]+)\/map(?:4x)?\.[^/]+\.bin(?:\?|$)/
const retryDelayMs = 15_000
const mapNameSelectors = ['[data-testid="map-name"]', ".map-name", "#map-name", '[class*="mapName"]']

type GameInfo = { map?: string, gameType?: string, gameMode?: string }

let cachedGameId: string | undefined
let cachedGameInfo: GameInfo | undefined
let failedGameId: string | undefined
let failedAt = 0
let spectatingGameId: string | undefined

const getGameId = (): string | undefined => window.location.pathname.match(gamePathPattern)?.[1]

const getText = (selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)
    const text = element?.getAttribute("aria-label") || element?.getAttribute("title") || element?.textContent
    if (text?.trim()) return text.trim()
  }

  return undefined
}

export const getLoadedMapId = (): string | undefined => {
  const resource = performance.getEntriesByType("resource").find((entry) => mapResourcePattern.test(entry.name))?.name
  return resource?.match(mapResourcePattern)?.[1]
}

const getLoadedMapName = (): string | undefined => {
  const mapId = getLoadedMapId()
  if (!mapId) return undefined
  return mapId.split(/[-_]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
}

const getGameEndpoint = (gameId: string): string => {
  const encodedGameId = encodeURIComponent(gameId)
  const resources = performance.getEntriesByType("resource").map((entry) => entry.name)
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

const getGameInfo = async (gameId: string, log: (message: string) => void): Promise<GameInfo | undefined> => {
  if (cachedGameId === gameId && cachedGameInfo) return cachedGameInfo
  if (failedGameId === gameId && Date.now() - failedAt < retryDelayMs) return undefined

  const fail = (): undefined => {
    failedGameId = gameId
    failedAt = Date.now()
    return undefined
  }

  try {
    const response = await fetch(getGameEndpoint(gameId))
    if (!response.ok) {
      log(`Game map lookup returned HTTP ${response.status}`)
      return fail()
    }

    const info = await response.json() as { gameConfig?: { gameMap?: unknown, gameType?: unknown, gameMode?: unknown } }
    if (typeof info.gameConfig?.gameMap !== "string") {
      log("Game map was not found in the game response")
      return fail()
    }

    cachedGameId = gameId
    cachedGameInfo = {
      map: info.gameConfig.gameMap,
      gameType: typeof info.gameConfig.gameType === "string" ? info.gameConfig.gameType : undefined,
      gameMode: typeof info.gameConfig.gameMode === "string" ? info.gameConfig.gameMode : undefined,
    }
    failedGameId = undefined
    return cachedGameInfo
  } catch (error) {
    log(`Game map lookup failed: ${error instanceof Error ? error.message : "request error"}`)
    return fail()
  }
}

const startTimes = new Map<string, number>()

// The in-game timer can be a countdown (timed games), so elapsed time is
// measured from the first tick where the game is on screen.
const getStartTimestamp = (gameId: string): number | undefined => {
  if (!document.body.classList.contains("in-game")) return undefined
  if (!startTimes.has(gameId)) startTimes.set(gameId, Math.floor(Date.now() / 1000))
  return startTimes.get(gameId)
}

export const getCurrentGame = async (log: (message: string) => void) => {
  const gameId = getGameId()
  if (!gameId) return undefined

  // The join flow rewrites ?spectate to ?live, so remember it for this game.
  if (window.location.search.includes("spectate")) spectatingGameId = gameId

  const gameInfo = await getGameInfo(gameId, log)
  const map = gameInfo?.map || getLoadedMapName() || getText(mapNameSelectors)
  return {
    gameId,
    map,
    gameType: gameInfo?.gameType,
    gameMode: gameInfo?.gameMode,
    spectating: spectatingGameId === gameId,
    startTimestamp: getStartTimestamp(gameId),
  }
}
