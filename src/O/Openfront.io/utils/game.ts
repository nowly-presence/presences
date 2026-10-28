const gameIdPattern = /^[a-zA-Z0-9]{8,10}$/
const excludedRoutes = new Set(["player", "privacy", "terms"])
const mapResourcePattern = /\/maps\/([^/]+)\/map(?:4x)?\.[^/]+\.bin(?:\?|$)/
const mapNameSelectors = ['[data-testid="map-name"]', ".map-name", "#map-name", '[class*="mapName"]']

type GameInfo = { map?: string }

let cachedGameId: string | undefined
let cachedGameInfo: GameInfo | undefined
let failedGameId: string | undefined

const getGameId = (): string | undefined => {
  const [firstSegment, ...segments] = window.location.pathname.split("/").filter(Boolean)
  if (firstSegment && excludedRoutes.has(firstSegment)) return undefined
  return segments.find((segment) => gameIdPattern.test(segment))
}

const getText = (selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)
    const text = element?.getAttribute("aria-label") || element?.getAttribute("title") || element?.textContent
    if (text?.trim()) return text.trim()
  }

  return undefined
}

const getLoadedMapName = (): string | undefined => {
  const resource = performance.getEntriesByType("resource").find((entry) => mapResourcePattern.test(entry.name))?.name
  const mapId = resource?.match(mapResourcePattern)?.[1]
  if (!mapId) return undefined
  return mapId.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
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
  if (failedGameId === gameId) return undefined

  try {
    const response = await fetch(getGameEndpoint(gameId))
    if (!response.ok) {
      log(`Game map lookup returned HTTP ${response.status}`)
      failedGameId = gameId
      return undefined
    }

    const info = await response.json() as { gameConfig?: { gameMap?: unknown } }
    if (typeof info.gameConfig?.gameMap !== "string") {
      log("Game map was not found in the game response")
      failedGameId = gameId
      return undefined
    }

    cachedGameId = gameId
    cachedGameInfo = { map: info.gameConfig.gameMap }
    failedGameId = undefined
    return cachedGameInfo
  } catch (error) {
    log(`Game map lookup failed: ${error instanceof Error ? error.message : "request error"}`)
    failedGameId = gameId
    return undefined
  }
}

export const getCurrentGame = async (log: (message: string) => void) => {
  const gameId = getGameId()
  if (!gameId) return undefined

  const gameInfo = await getGameInfo(gameId, log)
  const map = gameInfo?.map || getLoadedMapName() || getText(mapNameSelectors)
  return { gameId, map }
}
