import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { Category } from "./categories"
import { getChannelAvatar, getChannelName, getChannelSubscribers } from "./channel"
import type enUS from "../locales/en-US.json"

type YouTubeBrowsingSettings = {
  showChannels?: unknown
}

export const handleBrowsingActivity = async (
  presence: PresenceInstance,
  settings: YouTubeBrowsingSettings,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, search } = document.location

  if (pathname === "/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ" || pathname === "/@youtubemusic") {
    await presence.setActivity({
      details: strings.browsingYouTubeMusic,
      largeImageKey: Category.Music,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname === "/channel/UC4R8DWoMoI7CAwX8_LjQHig") {
    await presence.setActivity({
      details: strings.browsingYouTubeLive,
      largeImageKey: Category.Live,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname === "/channel/UCrpQ4p1Ql_hG8rKXIKM1MOQ") {
    await presence.setActivity({
      details: strings.browsingYouTubeFashion,
      largeImageKey: Category.Fashion,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/@") || pathname.startsWith("/channel/")) {
    if (settings.showChannels) {
      const channelName = getChannelName()
      const avatar = getChannelAvatar()
      const subscribers = getChannelSubscribers()

      await presence.setActivity({
        details: channelName || strings.viewingChannel,
        state: subscribers,
        largeImageKey: avatar || Assets.Logo,
        largeImageText: channelName || "YouTube",
        type: PresenceType.Watching,
      })
    } else {
      await presence.setActivity({
        details: strings.viewingChannel,
        largeImageKey: Assets.Logo,
        type: PresenceType.Watching,
      })
    }
    return
  }

  if (pathname === "/" || pathname === "/feed/trending") {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/results")) {
    const query = new URLSearchParams(search).get("search_query")
    await presence.setActivity({
      details: strings.searching,
      state: query ? `"${query}"` : undefined,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/feed/subscriptions")) {
    await presence.setActivity({
      details: strings.browsingSubscriptions,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/feed/history")) {
    await presence.setActivity({
      details: strings.viewingHistory,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/feed/playlists")) {
    await presence.setActivity({
      details: strings.browsingPlaylists,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/feed/you")) {
    await presence.setActivity({
      details: strings.browsingYourFeed,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/feed/storefront")) {
    await presence.setActivity({
      details: strings.browsingMoviesTv,
      largeImageKey: Category.Storefront,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/gaming")) {
    await presence.setActivity({
      details: strings.browsingGaming,
      largeImageKey: Category.Gaming,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/podcasts")) {
    await presence.setActivity({
      details: strings.browsingPodcasts,
      largeImageKey: Category.Podcasts,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/playables")) {
    await presence.setActivity({
      details: strings.playingGames,
      largeImageKey: Category.Playables,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/feed/courses_destination")) {
    await presence.setActivity({
      details: strings.browsingCourses,
      largeImageKey: Category.Courses,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/playlist")) {
    const list = new URLSearchParams(search).get("list")
    let playlistName = strings.viewingPlaylist
    if (list === "WL") playlistName = strings.watchLater
    else if (list === "LL") playlistName = strings.likedVideos

    await presence.setActivity({
      details: playlistName,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  await presence.setActivity({
    details: strings.browsing,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
}
