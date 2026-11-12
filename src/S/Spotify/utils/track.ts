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

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SPOTIFY_PLAYBACK_POSITION_SELECTOR = "[data-testid='playback-position']"
const SPOTIFY_PLAYBACK_DURATION_SELECTOR = "[data-testid='playback-duration']"

export type PlaybackProgress = {
  currentTime: number
  duration: number
}

const parseClock = (text: string | null | undefined): number | undefined => {
  const match = text?.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/)
  if (!match) return undefined
  const [, hours, minutes, seconds] = match
  return Number(hours ?? 0) * SECONDS_PER_HOUR + Number(minutes) * SECONDS_PER_MINUTE + Number(seconds)
}

export const getPlaybackProgress = (media: HTMLMediaElement | undefined): PlaybackProgress | undefined => {
  if (media && Number.isFinite(media.duration) && media.duration > 0) {
    return { currentTime: media.currentTime, duration: media.duration }
  }

  const currentTime = parseClock(document.querySelector(SPOTIFY_PLAYBACK_POSITION_SELECTOR)?.textContent)
  const duration = parseClock(document.querySelector(SPOTIFY_PLAYBACK_DURATION_SELECTOR)?.textContent)
  if (currentTime === undefined || duration === undefined || duration <= 0 || currentTime > duration) return undefined
  return { currentTime, duration }
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
    "[data-testid='now-playing-widget'] a[href], .now-playing a[href]",
  )
  for (const anchor of anchors) {
    if (anchor.textContent?.trim().toLocaleLowerCase() !== label.toLocaleLowerCase()) continue
    try {
      const url = new URL(anchor.getAttribute("href") ?? "", document.location.href)
      if (url.protocol !== "https:" || url.hostname !== "open.spotify.com" || url.username || url.password) continue
      if (!new RegExp(`^/(?:intl-[a-z]+/)?${kind}/[a-zA-Z0-9]+/?$`).test(url.pathname)) continue
      url.search = ""
      url.hash = ""
      return url.href
    } catch {
      continue
    }
  }
  return undefined
}
