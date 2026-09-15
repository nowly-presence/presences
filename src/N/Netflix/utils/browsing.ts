import type { PresenceInstance } from "@nowly/sdk"
import { PresenceType } from "@nowly/sdk"
import type enUS from "../locales/en-US.json"

const findSearchQuery = (): string | undefined => {
  const fromUrl = new URLSearchParams(document.location.search).get("q")
  if (fromUrl) return fromUrl

  const input = document.querySelector<HTMLInputElement>('[data-uia="search-box-input"], input[type="search"]')
  return input?.value || undefined
}

export const handleBrowsingActivity = async (
  presence: PresenceInstance,
  pathname: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()

  if (pathname.includes("/search")) {
    const query = findSearchQuery()
    await presence.setActivity({
      details: strings.searchingFor,
      state: query || "...",
      largeImageKey: Assets.Logo,
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/latest")) {
    await presence.setActivity({
      details: strings.browsingNewPopular,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/my-list")) {
    await presence.setActivity({
      details: strings.browsingMyList,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/browse/genre")) {
    await presence.setActivity({
      details: strings.browsingGenre,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname === "/" || pathname.includes("/browse")) {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else {
    presence.clearActivity()
  }
}
