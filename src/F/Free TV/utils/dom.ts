export type FreeTvMode =
  | "live"
  | "vod"
  | "home"
  | "channels"
  | "vodHub"
  | "tvGuide"
  | "myList"
  | "detail"
  | "hidden"

const LIVE_PLAY_RE = /^\/home\/channels\/\d+\/play/
const VOD_PLAY_RE = /^\/svod\/\d+\/play/
const CHANNELS_RE = /^\/home\/channels\/?$/
const VOD_HUB_RE = /^\/home\/(vod|oqee_cine)/
const TV_GUIDE_RE = /^\/home\/tv_guide/
const MY_LIST_RE = /^\/home\/my_list/
const DETAIL_RE = /^\/(replay\/\d+\/detail|vod\/contents\/\d+)/
const HOME_RE = /^\/home\/?$/
const ADULT_RE = /^\/vod\/adult-section/
const SETTINGS_RE = /^\/settings/

export const getMode = (pathname: string): FreeTvMode => {
  if (ADULT_RE.test(pathname) || SETTINGS_RE.test(pathname)) return "hidden"
  if (LIVE_PLAY_RE.test(pathname)) return "live"
  if (VOD_PLAY_RE.test(pathname)) return "vod"
  if (CHANNELS_RE.test(pathname)) return "channels"
  if (VOD_HUB_RE.test(pathname)) return "vodHub"
  if (TV_GUIDE_RE.test(pathname)) return "tvGuide"
  if (MY_LIST_RE.test(pathname)) return "myList"
  if (DETAIL_RE.test(pathname)) return "detail"
  if (HOME_RE.test(pathname)) return "home"
  return "home"
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
