const cdnBasePattern = /cdnBase\s*:\s*(["'])(.*?)\1/
const thumbnailCache = new Map<string, string | null>()

export const normalizeMapId = (map: string): string => map.toLowerCase().replace(/[\s.()]+/g, "")

export const getMapThumbnailUrl = (mapId: string): string | undefined => {
  const cached = thumbnailCache.get(mapId)
  if (cached !== undefined) return cached ?? undefined

  const assetKey = `maps/${mapId}/thumbnail.webp`
  for (const script of document.querySelectorAll("script:not([src])")) {
    const content = script.textContent || ""
    if (!content.includes(assetKey)) continue

    const entry = Array.from(content.matchAll(/["']([^"']+)["']\s*:\s*(["'][^"']+["'])/g))
      .find((match) => match[1] === assetKey)
    if (!entry) continue

    const assetPath = entry[2].slice(1, -1)
    const cdnBase = content.match(cdnBasePattern)?.[2] || ""
    const url = `${cdnBase.replace(/\/$/, "")}${assetPath}`
    thumbnailCache.set(mapId, url)
    return url
  }

  // Not cached on a miss: the inline config may not be parsed yet on early ticks.
  return undefined
}

export const getProfileId = (): string | undefined => {
  const href = document.querySelector<HTMLAnchorElement>('a[href^="/player/"]')?.getAttribute("href")
  return href?.match(/^\/player\/([^/?#]+)/)?.[1]
}

let knownPlayerName: string | undefined

export const getPlayerName = (): string | undefined => {
  // The menu (and its username field) is hidden once a game starts but stays in the DOM.
  const value = document.querySelector<HTMLInputElement>("username-input input:not(#clan-tag-manual)")?.value?.trim()
  if (value) knownPlayerName = value
  return knownPlayerName
}

// Menu pages are `.page-content` blocks; the one not hidden is the open page (the lobby list is the default).
export const getVisiblePageId = (): string | undefined => {
  if (window.location.pathname.startsWith("/player/")) return "page-profile"
  return document.querySelector(".page-content:not(.hidden)")?.id || undefined
}
