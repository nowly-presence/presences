const cdnBasePattern = /cdnBase\s*:\s*(["'])(.*?)\1/
const assetCache = new Map<string, string>()

export const normalizeMapId = (map: string): string => map.toLowerCase().replace(/[\s.()]+/g, "")

// Resolves a game asset ("maps/europe/thumbnail.webp") through the asset manifest the page inlines.
export const getAssetUrl = (assetKey: string): string | undefined => {
  const cached = assetCache.get(assetKey)
  if (cached) return cached

  for (const script of document.querySelectorAll("script:not([src])")) {
    const content = script.textContent || ""
    if (!content.includes(assetKey)) continue

    const entry = Array.from(content.matchAll(/["']([^"']+)["']\s*:\s*(["'][^"']+["'])/g))
      .find((match) => match[1] === assetKey)
    if (!entry) continue

    const assetPath = entry[2].slice(1, -1)
    const cdnBase = content.match(cdnBasePattern)?.[2] || ""
    const url = `${cdnBase.replace(/\/$/, "")}${assetPath}`
    assetCache.set(assetKey, url)
    return url
  }

  // Not cached on a miss: the inline config may not be parsed yet on early ticks.
  return undefined
}

export const getMapThumbnailUrl = (mapId: string): string | undefined => getAssetUrl(`maps/${mapId}/thumbnail.webp`)

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
