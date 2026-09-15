import type { PresenceInstance } from "@nowly/sdk"
import { PresenceType } from "@nowly/sdk"
import { findCategoryImage, findCategoryName } from "./category"
import { isOnCategoryPage, isOnChannelPage, isOnFollowingPage } from "./dom"
import { findStreamerAvatar, findStreamerName } from "./streamer"
import type enUS from "../locales/en-US.json"

export const handleBrowsingActivity = async (
  presence: PresenceInstance,
  pathname: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()

  if (isOnChannelPage()) {
    const streamer = findStreamerName()
    const avatar = findStreamerAvatar(streamer)
    await presence.setActivity({
      details: streamer
        ? presence.formatString(strings.viewingNamed, { name: streamer })
        : strings.viewingChannel,
      state: strings.browsingEllipsis,
      largeImageKey: avatar || Assets.Logo,
      largeImageText: streamer || "Twitch",
      smallImageKey: Assets.Logo,
      smallImageText: "Twitch",
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname === "/directory" || pathname === "/directory/") {
    await presence.setActivity({
      details: strings.browsingCategories,
      largeImageKey: Assets.Logo,
      largeImageText: "Twitch",
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/directory/")) {
    if (isOnCategoryPage()) {
      const category = findCategoryName()
      const categoryImage = findCategoryImage()
      await presence.setActivity({
        details: category
          ? presence.formatString(strings.browsingNamed, { name: category })
          : strings.browsingCategory,
        largeImageKey: categoryImage || Assets.Logo,
        largeImageText: category || "Twitch",
        smallImageKey: Assets.Logo,
        smallImageText: "Twitch",
        type: PresenceType.Watching,
        buttons: [{ label: strings.viewCategory, url: window.location.href.split("?")[0] }],
      })
    } else if (isOnFollowingPage()) {
      await presence.setActivity({
        details: strings.browsingFollowed,
        largeImageKey: Assets.Logo,
        type: PresenceType.Watching,
      })
    } else {
      await presence.setActivity({
        details: strings.browsingDirectory,
        largeImageKey: Assets.Logo,
        type: PresenceType.Watching,
      })
    }
  } else if (pathname.includes("/search")) {
    const query = new URLSearchParams(window.location.search).get("term")
    await presence.setActivity({
      details: strings.searchingFor,
      state: query || "...",
      largeImageKey: Assets.Logo,
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/team/")) {
    const team = pathname.split("/").pop()
    await presence.setActivity({
      details: strings.viewingTeam,
      state: team,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/subscriptions")) {
    await presence.setActivity({
      details: strings.viewingSubscriptions,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/wallet")) {
    await presence.setActivity({
      details: strings.viewingWallet,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/drops")) {
    await presence.setActivity({
      details: strings.viewingDrops,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else {
    presence.clearActivity()
  }
}
