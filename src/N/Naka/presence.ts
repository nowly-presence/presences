import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { formatEpisodeState, getNakaInfo } from "./utils/info"
import {
  cacheVisiblePosters,
  findContentPosterImage,
  findPoster,
  getCachedPoster,
  getContentCacheKey,
  getContentPageType,
  normalizePosterUrl,
} from "./utils/posters"
import type enUS from "./locales/en-US.json"

const presence = new Presence()

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = document.location

  if (pathname.startsWith("/player")) {
    const video = document.querySelector<HTMLVideoElement>("video")
    const nk = getNakaInfo()
    const cacheKey = getContentCacheKey(nk.contentType === "movie" ? "movie" : "tv", nk.id)
    const poster = nk.poster || getCachedPoster(cacheKey) || getCachedPoster(nk.title) || findPoster()
    const title = nk.title || "Naka"
    const state = formatEpisodeState(nk)

    const data: Parameters<typeof presence.setActivity>[0] = {
      details: title,
      state,
      largeImageKey: poster || getCachedPoster(nk.title) || Assets.Logo,
      largeImageText: title,
      type: PresenceType.Watching,
      buttons: [
        {
          label: nk.contentType === "movie" ? "View Movie" : "View Episode",
          url: location.href,
        },
      ],
    }

    if (video && !video.paused && !video.ended) {
      data.smallImageKey = "play"
      data.smallImageText = strings.playing
      Object.assign(data, createMediaTimestamps(video))
    } else {
      data.smallImageKey = "pause"
      data.smallImageText = strings.paused
    }

    await presence.setActivity(data)
    return
  }

  cacheVisiblePosters()

  const contentType = getContentPageType()
  if (contentType) {
    const img = findContentPosterImage()
    const contentId = location.pathname.match(/^\/content\/(?:movie|tv)\/(\d+)/)?.[1]
    const poster = normalizePosterUrl(img?.src) || getCachedPoster(`${contentType}:${contentId}`)
    const title =
      img?.alt.trim() ||
      document.querySelector<HTMLHeadingElement>("h1")?.textContent?.trim() ||
      document.title.replace(/[-|].*$/, "").trim() ||
      "Naka"

    await presence.setActivity({
      details: contentType === "movie" ? "Viewing movie" : "Viewing TV show",
      state: title,
      largeImageKey: poster || Assets.Logo,
      largeImageText: title,
      type: PresenceType.Watching,
      buttons: [
        {
          label: contentType === "movie" ? "View Movie" : "View TV Show",
          url: location.href,
        },
      ],
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: "Browsing Naka",
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
