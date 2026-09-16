import type { PresenceInstance } from "@nowly/sdk"
import { PresenceType } from "@nowly/sdk"
import { findSearchQuery } from "./player"
import type enUS from "../locales/en-US.json"

export const handleBrowsingActivity = async (
  presence: PresenceInstance,
  pathname: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()

  if (pathname.includes("/storefront") || pathname === "/") {
    await presence.setActivity({
      details: strings.viewingHome,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/search/")) {
    const query = findSearchQuery()
    await presence.setActivity({
      details: strings.searchingFor,
      state: query || "...",
      largeImageKey: Assets.Logo,
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/movie")) {
    await presence.setActivity({
      details: strings.viewingMovies,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/tv")) {
    await presence.setActivity({
      details: strings.viewingTvSeries,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/sports")) {
    await presence.setActivity({
      details: strings.viewingSports,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/livetv")) {
    await presence.setActivity({
      details: strings.viewingLiveTv,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/categories")) {
    await presence.setActivity({
      details: strings.viewingCategories,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/kids/")) {
    await presence.setActivity({
      details: strings.viewingKidsMovies,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/genre/")) {
    await presence.setActivity({
      details: strings.viewingGenres,
      state: strings.browsingEllipsis,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("shop")) {
    await presence.setActivity({
      details: strings.browsingStore,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else {
    presence.clearActivity()
  }
}
