const refreshIntervalMs = 15_000
const troopsPattern = /([\d.,]+[KMBT]?)\s*\/\s*([\d.,]+[KMBT]?)/
const percentPattern = /\d+(?:[.,]\d+)?\s*%/

export type LiveStats = {
  rank?: number
  territory?: string
  troops?: string
  gold?: string
}

let cached:
  | {
      at: number
      value: LiveStats | undefined
    }
  | undefined

const isShown = (element: Element): boolean => element.getClientRects().length > 0

// Gold and troops come from the control panel, which exists once and is laid out twice (mobile and desktop).
const readControlPanel = (): Pick<LiveStats, "troops" | "gold"> => {
  const panel = document.querySelector("control-panel")

  if (!panel) return {}

  const goldIcon = Array.from(panel.querySelectorAll('img[src*="GoldCoin"]')).find(isShown)
  const gold = goldIcon?.nextElementSibling?.textContent?.trim()
  const troops = (panel as HTMLElement).innerText.match(troopsPattern)?.[1]
  return {
    gold: gold || undefined,
    troops
  }
}

// Rank and territory come from the leaderboard, which the player may hide: then they are simply left out.
const readLeaderboard = (playerName: string | undefined): Pick<LiveStats, "rank" | "territory"> => {
  if (!playerName) return {}

  const rows = Array.from(document.querySelectorAll<HTMLElement>('player-stats [role="row"].stats-table-row'))
  const own = rows.find((row) => row.innerText.includes(playerName))

  if (!own) return {}

  const rank = Number.parseInt(own.innerText.trim(), 10)
  return {
    rank: Number.isFinite(rank) ? rank : undefined,
    territory: own.innerText.match(percentPattern)?.[0]?.replace(/\s+/g, "")
  }
}

// Read at most every 15 seconds: the activity text only changes that often, which keeps Discord updates sparse.
export const getLiveStats = (playerName: string | undefined): LiveStats | undefined => {
  if (cached && Date.now() - cached.at < refreshIntervalMs) return cached.value

  const value = { ...readControlPanel(), ...readLeaderboard(playerName) }
  // Nothing to show yet (before spawn, leaderboard hidden): look again on the next update.
  if (!Object.values(value).some((entry) => entry !== undefined)) return undefined

  cached = {
    at: Date.now(),
    value
  }
  return value
}

export const resetLiveStats = (): void => {
  cached = undefined
}
