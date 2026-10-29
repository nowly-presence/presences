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

// og:image reflects the profile picture on user pages - a stable source
// for browsing activity when no track is currently playing.
export const getPageImage = (): string | undefined =>
  toDiscordImage(document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? undefined)

export const getMediaSessionTrack = (fallbackUrl: string): TrackInfo | undefined => {
  const meta = navigator.mediaSession?.metadata
  if (!meta) return undefined

  const title = meta.title.trim()
  if (!title) return undefined

  const artwork = meta.artwork.length ? meta.artwork[meta.artwork.length - 1]?.src : undefined
  const artist = meta.artist.trim()
  return {
    title,
    artist: artist.length >= 2 ? artist : undefined,
    artwork,
    url: fallbackUrl,
    contentUrl: findPlayerLink(title, false),
    artistUrl: findPlayerLink(meta.artist.trim(), true),
    playing: navigator.mediaSession.playbackState !== "paused",
  }
}

const findPlayerLink = (label: string, artist: boolean): string | undefined => {
  if (!label) return undefined
  for (const anchor of document.querySelectorAll<HTMLAnchorElement>(".playbackSoundBadge a[href]")) {
    if (anchor.textContent?.trim().toLocaleLowerCase() !== label.toLocaleLowerCase()) continue
    try {
      const url = new URL(anchor.getAttribute("href") ?? "", document.location.href)
      if (url.protocol !== "https:" || url.hostname !== "soundcloud.com" || url.username || url.password) continue
      if (url.searchParams.has("secret_token")) continue
      if (!(artist ? /^\/[^/]+\/?$/ : /^\/[^/]+\/[^/]+\/?$/).test(url.pathname)) continue
      url.search = ""
      url.hash = ""
      return url.href
    } catch {
      continue
    }
  }
  return undefined
}
