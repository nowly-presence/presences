import { createMediaTimestamps, PresenceType, type PresenceData, type PresenceInstance, type UpdateDataContext } from "@nowly/sdk"
import { extractLiveCategoryImage, extractLiveCategoryName, extractLiveCategoryPath } from "./category"
import { findPlayingVideo, getVideo, getVideoState } from "./media"
import { extractProfileAvatar, extractProfileInfo } from "./profile"
import { toDiscordImage } from "./proxy"
import {
  extractHandle,
  extractNickname,
  extractPoster,
  extractSingleVideoAuthor,
  extractVideoDescription,
  extractVideoId,
  extractVideoPagePath,
} from "./video"
import type enUS from "../locales/en-US.json"

type TikTokSettings = {
  privacy?: unknown
  showButtons?: unknown
  showProfileUsernames?: unknown
}

const isFeedPath = (pathname: string, lang?: string | null): boolean =>
  pathname === "/following"
  || pathname.includes("foryou")
  || pathname === "/"
  || pathname === ""
  || Boolean(lang && (pathname === `/${lang}` || pathname === `/${lang}/`))

const isEnabled = (value: unknown): boolean => value === true

export const handleUpdate = async (
  presence: PresenceInstance,
  ctx: UpdateDataContext<TikTokSettings>,
): Promise<void> => {
  try {
    const strings = await presence.getStrings<typeof enUS>()
    const { pathname, href } = document.location
    const lang = document.querySelector("html")?.getAttribute("lang")
    const privacy = isEnabled(ctx.settings.privacy)
    const showButtons = ctx.settings.showButtons !== false
    const showProfileUsernames = ctx.settings.showProfileUsernames !== false

    if (isFeedPath(pathname, lang)) {
      const playing = findPlayingVideo()
      const video = playing ? getVideo(playing) : getVideo(null)
      const container = video?.closest("[data-e2e=\"recommend-list-item-container\"]")

      const handle = container ? extractHandle(container) : undefined
      const nickname = container ? extractNickname(container) : undefined
      const videoId = video ? extractVideoId(video) : undefined
      const tiktokURL = handle && videoId ? `https://www.tiktok.com/@${handle}/video/${videoId}` : undefined
      const creatorURL = handle ? `https://www.tiktok.com/@${handle}/` : undefined
      const paused = video?.paused ?? false
      const poster = !privacy ? await toDiscordImage(extractPoster(video)) : undefined

      const data: PresenceData = {
        largeImageKey: poster ?? Assets.Logo,
        smallImageKey: paused ? "pause" : "play",
        smallImageText: paused ? strings.paused : strings.playing,
        type: PresenceType.Watching,
      }

      if (privacy) {
        data.details = strings.browsingFeed
      } else if (nickname && handle) {
        data.details = `${nickname} (@${handle})`
        data.state = extractVideoDescription(container)
      } else if (video) {
        data.details = strings.watchingVideo
      } else {
        data.details = strings.browsingFeed
      }

      if (!privacy && showButtons) {
        const buttons = []
        if (tiktokURL && creatorURL) {
          buttons.push(
            { label: strings.viewTikTok, url: tiktokURL },
            { label: strings.viewProfile, url: creatorURL },
          )
        } else if (creatorURL) {
          buttons.push({ label: strings.viewProfile, url: creatorURL })
        } else if (tiktokURL) {
          buttons.push({ label: strings.viewTikTok, url: tiktokURL })
        }
        if (buttons.length > 0) data.buttons = buttons
      }

      if (video && !paused && video.duration && video.currentTime) {
        Object.assign(data, createMediaTimestamps(video))
      }

      await presence.setActivity(data)
      return
    }

    if (pathname.includes("/video/")) {
      const vidEl = document.querySelector("video")
      const video = getVideoState(vidEl)
      const author = extractSingleVideoAuthor()
      const videoPath = extractVideoPagePath(pathname)
      const handle = author.handle ?? videoPath?.handle
      const poster = !privacy ? await toDiscordImage(extractPoster(vidEl)) : undefined

      const data: PresenceData = {
        largeImageKey: poster ?? Assets.Logo,
        smallImageKey: vidEl?.paused ? "pause" : "play",
        smallImageText: vidEl?.paused ? strings.paused : strings.playing,
        type: PresenceType.Watching,
      }

      if (privacy) {
        data.details = strings.watchingVideo
      } else {
        data.details = author.nickname ? `${author.nickname} (@${handle})` : strings.watchingVideo
        data.state = extractVideoDescription()
      }

      if (!video.paused) {
        Object.assign(data, createMediaTimestamps({
          currentTime: video.currentTime,
          duration: video.duration,
          paused: false,
        }))
      }

      if (!privacy && showButtons && handle) {
        data.buttons = [
          { label: strings.viewTikTok, url: href },
          { label: strings.viewProfile, url: `https://www.tiktok.com/@${handle}` },
        ]
      }

      await presence.setActivity(data)
      return
    }

    const liveCategory = extractLiveCategoryPath(pathname)
    if (liveCategory) {
      const category = extractLiveCategoryName(liveCategory.category)
      const image = !privacy ? await toDiscordImage(extractLiveCategoryImage()) : undefined

      const data: PresenceData = {
        largeImageKey: image ?? Assets.Logo,
        largeImageText: category ?? strings.tiktok,
        smallImageKey: image ? Assets.Logo : undefined,
        smallImageText: image ? strings.tiktok : undefined,
        type: PresenceType.Watching,
        details: privacy
          ? strings.browsingLiveCategories
          : category
            ? presence.formatString(strings.browsingNamed, { name: category })
            : strings.browsingLiveCategory,
      }

      if (!privacy && showButtons) {
        data.buttons = [{ label: strings.viewCategory, url: href.split("?")[0] }]
      }

      await presence.setActivity(data)
      return
    }

    if (pathname === "/live") {
      await presence.setActivity({
        largeImageKey: Assets.Logo,
        type: PresenceType.Watching,
        details: strings.watchingLive,
      })
      return
    }

    if (pathname.includes("/live")) {
      const author = extractSingleVideoAuthor()

      const data: PresenceData = {
        largeImageKey: Assets.Logo,
        type: PresenceType.Watching,
      }

      if (privacy) {
        data.details = strings.watchingLive
      } else if (author.nickname && author.handle) {
        data.details = presence.formatString(strings.watchingLiveNamed, {
          name: `${author.nickname} (@${author.handle})`,
        })
      } else {
        data.details = strings.watchingLive
      }

      if (!privacy && showButtons && author.handle) {
        data.buttons = [
          { label: strings.watchStream, url: href },
          { label: strings.viewProfile, url: `https://www.tiktok.com/@${author.handle}` },
        ]
      }

      await presence.setActivity(data)
      return
    }

    if (pathname.includes("/@")) {
      const { username, displayName, bio } = extractProfileInfo()
      const avatar = !privacy ? await toDiscordImage(extractProfileAvatar()) : undefined

      const data: PresenceData = {
        largeImageKey: avatar ?? Assets.Logo,
        smallImageKey: avatar ? Assets.Logo : undefined,
        smallImageText: avatar ? strings.tiktok : undefined,
        type: PresenceType.Watching,
      }

      if (privacy || !showProfileUsernames) {
        data.details = strings.viewingProfile
      } else if (displayName && username) {
        data.details = `${displayName} (@${username})`
        data.state = bio
      } else if (username) {
        data.details = `@${username}`
        data.state = bio
      } else {
        data.details = strings.viewingProfile
      }

      if (showProfileUsernames && !privacy && showButtons && username) {
        data.buttons = [{ label: strings.viewProfile, url: `https://www.tiktok.com/@${username}` }]
      }

      await presence.setActivity(data)
      return
    }

    if (pathname.includes("/explore")) {
      await presence.setActivity({
        largeImageKey: Assets.Logo,
        type: PresenceType.Watching,
        details: privacy ? strings.browsingExplore : strings.exploring,
      })
      return
    }

    if (pathname.includes("/messages")) {
      await presence.setActivity({
        largeImageKey: Assets.Logo,
        type: PresenceType.Watching,
        details: privacy ? strings.browsingMessages : strings.readingMessages,
      })
      return
    }

    await presence.setActivity({
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
      details: strings.tiktok,
    })
  } catch (err) {
    presence.error(`TikTok presence error: ${err}`)
    await presence.setActivity({
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
      details: strings.tiktok,
    })
  }
}
