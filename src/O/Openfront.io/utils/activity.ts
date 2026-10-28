const cdnBasePattern = /cdnBase\s*:\s*(["'])(.*?)\1/

export const getMapThumbnailUrl = (map: string): string | undefined => {
  const mapId = map.toLowerCase().replace(/[\s.()]+/g, "")
  const assetKey = `maps/${mapId}/thumbnail.webp`

  for (const script of document.querySelectorAll("script:not([src])")) {
    const content = script.textContent || ""
    const entry = Array.from(content.matchAll(/["']([^"']+)["']\s*:\s*(["'][^"']+["'])/g))
      .find((match) => match[1] === assetKey)
    if (!entry) continue

    const assetPath = entry[2].slice(1, -1)
    const cdnBase = content.match(cdnBasePattern)?.[2] || ""
    return `${cdnBase.replace(/\/$/, "")}${assetPath}`
  }

  return undefined
}

export const getProfileId = (): string | undefined => {
  const href = document.querySelector<HTMLAnchorElement>('a[href^="/player/"]')?.getAttribute("href")
  return href?.match(/^\/player\/([^/?#]+)/)?.[1]
}

export const getPlayerName = (): string | undefined => {
  const selectors = ['[data-testid="player-name"]', '[data-testid="username"]', ".player-name", '[class*="username"]']

  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)
    const text = element?.getAttribute("aria-label") || element?.getAttribute("title") || element?.textContent
    if (text?.trim()) return text.trim()
  }

  return undefined
}
