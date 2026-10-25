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
    contentUrl: findPlayerLink(title, "song"),
    artistUrl: findPlayerLink(meta.artist.trim(), "artist"),
    playing: navigator.mediaSession.playbackState !== "paused",
  }
}

const findPlayerLink = (label: string, kind: "song" | "artist"): string | undefined => {
  if (!label) return undefined
  const anchors = document.querySelectorAll<HTMLAnchorElement>(
    ".web-chrome-playback-lcd a[href], apple-music-player a[href]",
  )
  for (const anchor of anchors) {
    if (anchor.textContent?.trim().toLocaleLowerCase() !== label.toLocaleLowerCase()) continue
    try {
      const url = new URL(anchor.getAttribute("href") ?? "", document.location.href)
      if (url.protocol !== "https:" || url.hostname !== "music.apple.com" || url.username || url.password) continue
      const validPath = kind === "artist"
        ? /^\/[^/]+\/artist\/[^/]+\/\d+\/?$/.test(url.pathname)
        : /^\/[^/]+\/(song|album)\/[^/]+\/\d+\/?$/.test(url.pathname)
      if (!validPath) continue
      const songId = url.searchParams.get("i")
      if (kind === "song" && url.pathname.includes("/album/") && (!songId || !/^\d+$/.test(songId))) continue
      url.search = ""
      url.hash = ""
      if (kind === "song" && songId && /^\d+$/.test(songId)) url.searchParams.set("i", songId)
      return url.href
    } catch {
      continue
    }
  }
  return undefined
}
