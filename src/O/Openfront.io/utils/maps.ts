import { getAssetUrl } from "./activity"

let mapNames: Record<string, string> | undefined
let loading = false

// Map names come from the game's own translation file, so new maps need no change here.
// The first calls return undefined while the file loads.
const loadMapNames = async (): Promise<void> => {
  const url = getAssetUrl("lang/en.json")
  if (!url) return

  loading = true
  try {
    const response = await fetch(url)
    if (!response.ok) return
    const body = await response.json() as { map?: Record<string, unknown> }
    mapNames = Object.fromEntries(Object.entries(body.map ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
  } catch {
    // Retried on a later tick.
  } finally {
    loading = false
  }
}

export const getMapName = (mapId: string): string | undefined => {
  if (!mapNames && !loading) void loadMapNames()
  return mapNames?.[mapId]
}
