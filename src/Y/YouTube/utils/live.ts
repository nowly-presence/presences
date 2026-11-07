export const isLiveStream = (video: HTMLVideoElement): boolean => {
  if (document.querySelector(".ytp-time-display.ytp-live")) return true
  const badge = document.querySelector<HTMLElement>(".ytp-live-badge")
  if (badge && badge.offsetParent !== null && !badge.hasAttribute("hidden")) return true
  return video.duration === Infinity
}

type WatchSession = { videoId: string; start: number; pausedAt: number | null }

let session: WatchSession | null = null

/**
 * Real viewing time for a live stream, independent of the stream position.
 * The timer starts when the stream is first seen and does not count pauses.
 */
export const getLiveStartTimestamp = (videoId: string, isPlaying: boolean): number | undefined => {
  const now = Date.now()

  if (!session || session.videoId !== videoId) {
    session = { videoId, start: now, pausedAt: isPlaying ? null : now }
  }

  if (!isPlaying) {
    session.pausedAt ??= now
    return undefined
  }

  if (session.pausedAt !== null) {
    session.start += now - session.pausedAt
    session.pausedAt = null
  }

  return Math.floor(session.start / 1000)
}

export const resetLiveSession = (): void => {
  session = null
}
