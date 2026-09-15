import type { PresenceInstance } from "@nowly/sdk"
import { PresenceType } from "@nowly/sdk"
import { getBrand } from "./brands"
import { getDetailCover, getOgTitle, getSearchQuery } from "./player"
import type enUS from "../locales/en-US.json"

export const handleBrowsingActivity = async (
  presence: PresenceInstance,
  pathname: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()

  if (/\/(?:shows|movies)\/video\//.test(pathname)) {
    presence.clearActivity()
  } else if (pathname === "/" || pathname.startsWith("/home")) {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/search")) {
    const query = getSearchQuery()
    await presence.setActivity({
      details: strings.searchingFor,
      state: query || "...",
      largeImageKey: Assets.Logo,
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/my-list")) {
    const query = getSearchQuery()
    await presence.setActivity({
      details: strings.browsingMyList,
      state: query || "...",
      largeImageKey: Assets.Logo,
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/shows/") || pathname.startsWith("/browse/")) {
    await presence.setActivity({
      details: strings.viewingShow,
      state: getOgTitle(),
      largeImageKey: getDetailCover() || Assets.Logo,
      largeImageText: getOgTitle(),
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/movies/")) {
    await presence.setActivity({
      details: strings.viewingMovie,
      state: getOgTitle(),
      largeImageKey: getDetailCover() || Assets.Logo,
      largeImageText: getOgTitle(),
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/collections/")) {
    await presence.setActivity({
      details: strings.viewingCollection,
      state: getOgTitle(),
      largeImageKey: getDetailCover() || Assets.Logo,
      largeImageText: getOgTitle(),
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/live-tv")) {
    await presence.setActivity({
      details: strings.browsingLiveTv,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/brands")) {
    const brand = getBrand(pathname)
    await presence.setActivity({
      details: brand
        ? presence.formatString(strings.browsingNamed, { name: brand.name })
        : strings.browsingBrands,
      largeImageKey: brand?.logo || Assets.Logo,
      largeImageText: brand?.name || "Paramount+",
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/sports")) {
    await presence.setActivity({
      details: strings.browsing,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else {
    presence.clearActivity()
  }
}
