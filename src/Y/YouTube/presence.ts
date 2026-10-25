import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import { Category } from "./utils/categories"
import { findTitle, findUploader, findUploaderUrl } from "./utils/channel"
import { $, findVideo, text } from "./utils/dom"
import type enUS from "./locales/en-US.json"

const presence = new Presence()
let prevPath = ""

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href, search } = document.location

  if (pathname !== prevPath) {
    prevPath = pathname
    await new Promise((r) => setTimeout(r, 800))
  }

  const video = findVideo()
  const videoId = new URLSearchParams(search).get("v")

  if (video && videoId) {
    const isPlaying = !video.paused
    if (ctx.settings.hideOnPause && !isPlaying) {
      presence.clearActivity()
      return
    }

    const title = findTitle()
    const uploader = findUploader(videoId)

    await presence.setActivity({
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: title,
      detailsUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      stateUrl: uploader ? findUploaderUrl() : undefined,
      ...(uploader ? { state: uploader } : {}),
      largeImageKey: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      largeImageText: title,
      ...(ctx.settings.showPlaybackState !== false ? {
        smallImageKey: isPlaying ? "play" : "pause",
        smallImageText: isPlaying ? strings.playing : strings.paused,
      } : {}),
      ...createMediaTimestamps(video),
      type: PresenceType.Watching,
      statusDisplayType: ctx.settings.statusDisplayType === "details" ? 2 : ctx.settings.statusDisplayType === "state" && uploader ? 1 : 0,
      buttons: [{ label: strings.watchVideo, url: href.split("&")[0] }],
    })
    return
  }

  const playablesMatch = pathname.match(/^\/playables\/([^/]+)$/)
  if (playablesMatch) {
    const gameName = text($(".ytMiniAppTopBarViewModelTitle"))
    const gameIcon = $<HTMLMetaElement>("meta[property='og:image']")?.content
      || document.querySelector<HTMLElement>(".miniAppSplashScreenViewModelBackgroundBlur")?.style.backgroundImage?.match(/url\("([^"]+)"\)/)?.[1]

    await presence.setActivity({
      details: gameName || strings.playingGame,
      state: findUploader(),
      largeImageKey: gameIcon || Category.Playables,
      largeImageText: gameName || strings.youtubePlayables,
      startTimestamp: Math.floor(Date.now() / 1000),
      type: PresenceType.Watching,
      buttons: [{ label: strings.playGame, url: href.split("?")[0] }],
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await handleBrowsingActivity(presence, ctx.settings)
})
