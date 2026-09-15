import type { PresenceInstance } from "@nowly/sdk"
import { PresenceType } from "@nowly/sdk"
import { getCategory } from "./categories"
import { getDetailImage, getPageTitle, getSearchQuery } from "./player"
import type enUS from "../locales/en-US.json"

const categoryDetails = (strings: typeof enUS): Record<string, string> => ({
  browsingCinema: strings.browsingCinema,
  browsingSeries: strings.browsingSeries,
  browsingSports: strings.browsingSports,
  browsingKids: strings.browsingKids,
  browsingDocumentaries: strings.browsingDocumentaries,
  browsingEntertainment: strings.browsingEntertainment,
  browsingPicks: strings.browsingPicks,
  browsingNews: strings.browsingNews,
  browsingMusic: strings.browsingMusic,
  browsingCanalVod: strings.browsingCanalVod,
  browsingLaPresse: strings.browsingLaPresse,
  browsingSme: strings.browsingSme,
  browsingAudioDescription: strings.browsingAudioDescription,
  browsingLsf: strings.browsingLsf,
})

const categoryImageText = (strings: typeof enUS): Record<string, string> => ({
  imageMovies: strings.imageMovies,
  imageSeries: strings.imageSeries,
  imageSports: strings.imageSports,
  imageKids: strings.imageKids,
  imageDocumentaries: strings.imageDocumentaries,
  imageEntertainment: strings.imageEntertainment,
  imageForYou: strings.imageForYou,
  imageNews: strings.imageNews,
  imageMusic: strings.imageMusic,
  imageCanalVod: strings.imageCanalVod,
  imagePress: strings.imagePress,
  imageSme: strings.imageSme,
  imageAudioDescription: strings.imageAudioDescription,
  imageLsf: strings.imageLsf,
})

export const handleBrowsingActivity = async (
  presence: PresenceInstance,
  pathname: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()
  const category = getCategory(pathname)

  if (pathname === "/" || pathname === "") {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/recherche") || pathname.startsWith("/search")) {
    const query = getSearchQuery()
    await presence.setActivity({
      details: strings.searchingFor,
      state: query || "...",
      largeImageKey: Assets.Logo,
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/live")) {
    await presence.setActivity({
      details: strings.browsingLiveTv,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (category) {
    await presence.setActivity({
      details: categoryDetails(strings)[category.detailsKey],
      state: getPageTitle(),
      largeImageKey: category.image,
      largeImageText: categoryImageText(strings)[category.imageTextKey],
      type: PresenceType.Watching,
    })
  } else if (pathname.startsWith("/docs")) {
    await setCategoryActivity(presence, strings.browsingDocumentaries)
  } else if (pathname.startsWith("/chaines")) {
    await setCategoryActivity(presence, strings.browsingChannels)
  } else if (pathname.startsWith("/streaming")) {
    await setCategoryActivity(presence, strings.browsingStreaming)
  } else if (/\/h\/\d+/i.test(pathname)) {
    const title = getPageTitle()
    await presence.setActivity({
      details: strings.viewingProgramme,
      state: title,
      largeImageKey: getDetailImage() || Assets.Logo,
      largeImageText: title || "CANAL+",
      type: PresenceType.Watching,
    })
  } else {
    presence.clearActivity()
  }
}

const setCategoryActivity = async (
  presence: PresenceInstance,
  details: string,
): Promise<void> => {
  await presence.setActivity({
    details,
    state: getPageTitle(),
    largeImageKey: getDetailImage() || Assets.Logo,
    largeImageText: "CANAL+",
    type: PresenceType.Watching,
  })
}
