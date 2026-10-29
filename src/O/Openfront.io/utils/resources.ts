const interestingPattern =
  /\/maps\/[^/]+\/(?:map(?:4x|16x)?\.[^/]+\.bin|manifest\.json)(?:\?|$)|\/api\/(?:singleplayer|game)\/|\/game\/[a-zA-Z0-9]{8,10}(?:\?|$)|^wss?:\/\//
const maxSeen = 500

export type SeenResource = {
  name: string
  at: number
}

const seen: SeenResource[] = []

const remember = (entry: PerformanceEntry): void => {
  if (!interestingPattern.test(entry.name)) return

  seen.push({
    name: entry.name,
    at: entry.startTime
  })
  if (seen.length > maxSeen) seen.shift()
}

// The browser's own timing buffer holds a few hundred entries and then drops new ones,
// which a long session fills. An observer keeps the few requests that matter.
try {
  new PerformanceObserver((list) => list.getEntries().forEach(remember)).observe({
    type: "resource",
    buffered: true
  })
} catch {
  for (const entry of performance.getEntriesByType("resource")) remember(entry)
}

export const getSeenResources = (): SeenResource[] => seen

export const lastResource = (pattern: RegExp):
  | {
      id: string
      url: string
      at: number
    }
  | undefined => {
  for (let index = seen.length - 1; index >= 0; index--) {
    const id = seen[index].name.match(pattern)?.[1]

    if (id) return {
      id,
      url: seen[index].name,
      at: seen[index].at
    }
  }

  return undefined
}
