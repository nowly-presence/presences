const cdnBasePattern = /cdnBase\s*:\s*(["'])(.*?)\1/
const publicIdPrefix = "cached_public_id_"
const publicIdPattern = /^[A-Za-z0-9_-]{4,64}$/
const assetCache = new Map<string, string>()

export const normalizeMapId = (map: string): string => map.toLowerCase().replace(/[\s.()]+/g, "")

// Resolves a game asset ("maps/europe/thumbnail.webp") through the asset manifest the page inlines.
// Without an entry the game falls back to the plain path under the CDN base, and so do we.
export const getAssetUrl = (assetKey: string): string | undefined => {
  const cached = assetCache.get(assetKey)

  if (cached) return cached

  for (const script of document.querySelectorAll("script:not([src])")) {
    const content = script.textContent || ""
    const cdnBase = content.match(cdnBasePattern)?.[2]

    if (cdnBase === undefined) continue

    const entry = Array.from(content.matchAll(/["']([^"']+)["']\s*:\s*(["'][^"']+["'])/g)).find((match) => match[1] === assetKey)
    const assetPath = entry ? entry[2].slice(1, -1) : `/${assetKey}`
    // Discord needs an absolute URL; the CDN base is empty when assets are served by the site itself.
    const url = new URL(`${cdnBase.replace(/\/$/, "")}${assetPath}`, window.location.origin).href
    assetCache.set(assetKey, url)
    return url
  }

  // Not cached on a miss: the inline config may not be parsed yet on early ticks.
  return undefined
}

export const getMapThumbnailUrl = (mapId: string): string | undefined => getAssetUrl(`maps/${mapId}/thumbnail.webp`)

// The account button shows the sign-in prompt only while signed out.
const isSignedIn = (): boolean => {
  for (const trigger of document.querySelectorAll("[data-account-trigger]")) {
    if (trigger.querySelector("[data-account-signin-text]")?.classList.contains("hidden")) return true
  }

  return false
}

// The game caches the signed-in account's public id (the one in profile links) in localStorage.
// Several cached ids mean several past accounts: which one is current is unknown, so none is shared.
export const getProfileId = (): string | undefined => {
  if (!isSignedIn()) return undefined

  const ids = new Set<string>()

  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index)
      const value = key?.startsWith(publicIdPrefix) ? localStorage.getItem(key) : null
      if (value && publicIdPattern.test(value)) ids.add(value)
    }
  } catch {
    return undefined
  }

  return ids.size === 1 ? [...ids][0] : undefined
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
