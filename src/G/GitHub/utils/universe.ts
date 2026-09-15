import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { createButton, getTitle } from "./dom"
import { ProductAssets } from "./products"
import type enUS from "../locales/en-US.json"

export const handleGitHubUniverse = async (
  presence: PresenceInstance,
  href: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()

  await presence.setActivity({
    details: strings.browsingUniverse,
    state: getTitle("GitHub Universe"),
    largeImageKey: ProductAssets.UniverseLogo,
    largeImageText: "GitHub Universe",
    type: PresenceType.Watching,
    buttons: [createButton(strings.viewGitHubUniverse, href)],
  })
}
