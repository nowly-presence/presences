import { PresenceType } from "@nowly/sdk"
import { findCategoryName } from "./utils/category"
import {
  getProfileSubTab,
  isOnCategoriesListPage,
  isOnCategoryPage,
  isOnForumsListPage,
  isOnForumTopicPage,
  isOnHomePage,
  isOnLaunchGuidePage,
  isOnProductPage,
  isOnProfilePage,
  isOnSubmitPage,
} from "./utils/dom"
import { findForumTopicTitle } from "./utils/forum"
import { findProductName, findProductTagline, findProductThumbnail } from "./utils/product"
import { findProfileAvatar, findProfileName } from "./utils/profile"
import type enUS from "./locales/en-US.json"

const presence = new Presence()

const getProfileTabLabel = (subTab: string | undefined, strings: typeof enUS): string | undefined => {
  switch (subTab) {
    case "forums": return strings.tabForums
    case "activity": return strings.tabActivity
    case "upvotes": return strings.tabUpvotes
    case "submitted": return strings.tabSubmitted
    case "collections": return strings.tabCollections
    case "stacks": return strings.tabStacks
    case "reviews": return strings.tabReviews
    default: return undefined
  }
}

presence.on("UpdateData", async () => {
  const strings = await presence.getStrings<typeof enUS>()

  if (isOnProductPage()) {
    const name = findProductName()
    const tagline = findProductTagline()
    const thumbnail = findProductThumbnail()

    await presence.setActivity({
      details: name || strings.discoveringProduct,
      state: tagline,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      smallImageKey: thumbnail,
      smallImageText: name || "Product Hunt",
      type: PresenceType.Watching,
      buttons: [{ label: strings.viewProduct, url: window.location.href.split("?")[0] }],
    })
    return
  }

  if (isOnCategoryPage()) {
    const category = findCategoryName()
    await presence.setActivity({
      details: category
        ? presence.formatString(strings.browsingNamed, { name: category })
        : strings.browsingCategory,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      type: PresenceType.Watching,
    })
    return
  }

  if (isOnCategoriesListPage()) {
    await presence.setActivity({
      details: strings.browsingCategories,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      type: PresenceType.Watching,
    })
    return
  }

  if (isOnForumTopicPage()) {
    const title = findForumTopicTitle()
    await presence.setActivity({
      details: title || strings.readingForumTopic,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      type: PresenceType.Watching,
      buttons: [{ label: strings.viewProduct, url: window.location.href.split("?")[0] }],
    })
    return
  }

  if (isOnForumsListPage()) {
    await presence.setActivity({
      details: strings.browsingForums,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      type: PresenceType.Watching,
    })
    return
  }

  if (isOnLaunchGuidePage()) {
    await presence.setActivity({
      details: strings.readingLaunchGuide,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      type: PresenceType.Watching,
    })
    return
  }

  if (isOnSubmitPage()) {
    await presence.setActivity({
      details: strings.submittingProduct,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      type: PresenceType.Watching,
    })
    return
  }

  if (isOnProfilePage()) {
    const name = findProfileName()
    const avatar = findProfileAvatar()
    const tabLabel = getProfileTabLabel(getProfileSubTab(), strings)

    await presence.setActivity({
      details: name
        ? presence.formatString(strings.viewingNamedProfile, { name })
        : strings.viewingProfile,
      state: tabLabel,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      smallImageKey: avatar,
      smallImageText: name || "Product Hunt",
      type: PresenceType.Watching,
      buttons: [{ label: strings.viewProfile, url: window.location.href.split("?")[0] }],
    })
    return
  }

  if (isOnHomePage()) {
    await presence.setActivity({
      details: strings.browsingLaunches,
      largeImageKey: Assets.Logo,
      largeImageText: "Product Hunt",
      type: PresenceType.Watching,
    })
    return
  }

  presence.clearActivity()
})
