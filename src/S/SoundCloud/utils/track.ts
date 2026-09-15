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
    playing: navigator.mediaSession.playbackState !== "paused",
  }
}
