import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { createButton, getPathSegments, getTitle } from "./dom"
import { getMetaImage, toDiscordImage } from "./images"
import type enUS from "../locales/en-US.json"

export const handleDiscoveryPage = async (
  presence: PresenceInstance,
  pathname: string,
  href: string,
): Promise<boolean> => {
  const strings = await presence.getStrings<typeof enUS>()
  const [first, second, third, fourth] = getPathSegments(pathname)

  if (first === "marketplace") {
    await handleMarketplacePage(presence, strings, second, third, fourth, href)
    return true
  }

  if (pathname === "/explore") {
    await setLogoActivity(presence, strings.exploringGitHub)
    return true
  }

  if (first === "topics" && second) {
    await setLogoActivity(presence, strings.exploringTopic, topicName(second), [createButton(strings.viewTopic, href)])
    return true
  }

  if (pathname === "/trending") {
    await setLogoActivity(presence, strings.viewingTrending)
    return true
  }

  if (pathname === "/collections") {
    await setLogoActivity(presence, strings.browsingCollections)
    return true
  }

  if (first === "collections" && second) {
    await setLogoActivity(presence, strings.viewingCollection, getTitle(collectionName(second)), [createButton(strings.viewCollection, href)])
    return true
  }

  if (pathname === "/sponsors/explore") {
    await setLogoActivity(presence, strings.exploringSponsors)
    return true
  }

  return false
}

const handleMarketplacePage = async (
  presence: PresenceInstance,
  strings: typeof enUS,
  second: string | undefined,
  third: string | undefined,
  fourth: string | undefined,
  href: string,
): Promise<void> => {
  if (second === "models" && third && fourth) {
    const image = await toDiscordImage(getMetaImage())
    await presence.setActivity({
      details: strings.viewingMarketplaceModel,
      state: getTitle(modelName(fourth)),
      largeImageKey: image || Assets.Logo,
      largeImageText: "GitHub Marketplace",
      type: PresenceType.Watching,
      buttons: [createButton(strings.viewModel, href)],
    })
    return
  }

  await setLogoActivity(presence, strings.browsingMarketplace, second ? getTitle("GitHub Marketplace") : undefined)
}

const setLogoActivity = async (
  presence: PresenceInstance,
  details: string,
  state?: string,
  buttons?: Array<{ label: string, url: string }>,
): Promise<void> => {
  await presence.setActivity({
    details,
    state,
    buttons,
    largeImageKey: Assets.Logo,
    largeImageText: "GitHub",
    type: PresenceType.Watching,
  })
}

const topicName = (topic: string): string =>
  topic.replace(/-/g, " ")

const collectionName = (collection: string): string =>
  collection.replace(/-/g, " ")

const modelName = (model: string): string =>
  model.replace(/-/g, " ")
