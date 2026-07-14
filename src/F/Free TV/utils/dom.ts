export type FreeTvMode = "live" | "vod" | "browsing" | "hidden"

const LIVE_PLAY_RE = /^\/home\/channels\/\d+\/play/
const VOD_PLAY_RE = /^\/svod\/\d+\/play/
const ADULT_RE = /^\/vod\/adult-section/
const SETTINGS_RE = /^\/settings/

export const getMode = (pathname: string): FreeTvMode => {
  if (ADULT_RE.test(pathname) || SETTINGS_RE.test(pathname)) return "hidden"
  if (LIVE_PLAY_RE.test(pathname)) return "live"
  if (VOD_PLAY_RE.test(pathname)) return "vod"
  return "browsing"
}

export const findVideo = (): HTMLVideoElement | null => document.querySelector("video")

export const isVideoPlaying = (video: HTMLVideoElement | null): boolean =>
  !!video && !video.paused && !video.ended && video.readyState > 2

export const getTitle = (): string | undefined => {
  const mediaTitle = navigator.mediaSession?.metadata?.title
  if (mediaTitle) return mediaTitle.trim()

  const titleMatch = document.title.match(/^(.+?)\s*[|–-]\s*Free\s*TV$/i)
  if (titleMatch?.[1]) return titleMatch[1].trim()

  const heading = document.querySelector("h1")?.textContent?.trim()
  if (heading) return heading

  return undefined
}
