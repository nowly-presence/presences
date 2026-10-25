const DISCORD_IMAGE_KEY_MAX_LENGTH = 300

export const toDiscordImage = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl?.startsWith("https://")) return undefined
  return imageUrl.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? imageUrl : undefined
}

export type TrackInfo = {
  title: string
  artist?: string
  artwork?: string
  url: string
  contentUrl?: string
  artistUrl?: string
  playing: boolean
}

export const getMediaElement = (): HTMLMediaElement | undefined => {
  const nodes = document.querySelectorAll<HTMLMediaElement>("audio, video")
  for (const node of nodes) {
    if (!node.paused || node.currentTime > 0) return node
  }
  return nodes[0]
}

export const getMediaSessionTrack = (fallbackUrl: string): TrackInfo | undefined => {
  const meta = navigator.mediaSession?.metadata
  if (!meta) return undefined

  const title = meta.title.trim()
  if (!title) return undefined

  const artwork = meta.artwork.length ? meta.artwork[meta.artwork.length - 1]?.src : undefined
  return {
    title,
    artist: meta.artist.trim() || undefined,
    artwork,
    url: fallbackUrl,
    contentUrl: findPlayerLink(title, "track"),
    artistUrl: findPlayerLink(meta.artist.trim(), "artist"),
    playing: navigator.mediaSession.playbackState !== "paused",
  }
}

const findPlayerLink = (label: string, kind: "track" | "artist"): string | undefined => {
  if (!label) return undefined
  const anchors = document.querySelectorAll<HTMLAnchorElement>(
    "[data-test='player'] a[href], [data-test='footer-player'] a[href], footer a[href]",
  )
  for (const anchor of anchors) {
    if (anchor.textContent?.trim().toLocaleLowerCase() !== label.toLocaleLowerCase()) continue
    try {
      const url = new URL(anchor.getAttribute("href") ?? "", document.location.href)
      if (url.protocol !== "https:" || url.username || url.password) continue
      if (!["listen.tidal.com", "tidal.com"].includes(url.hostname)) continue
      if (!new RegExp(`^/(?:browse/)?${kind}/[0-9]+/?$`).test(url.pathname)) continue
      url.search = ""
      url.hash = ""
      return url.href
    } catch {
      continue
    }
  }
  return undefined
}
