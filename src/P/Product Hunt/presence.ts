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
import { findProductLogo, findProductName, findProductTagline } from "./utils/product"
import { findProfileAvatar, findProfileName } from "./utils/profile"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "When enabled, your Discord presence also shows when browsing Product Hunt categories, forums, and launches.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez les catégories, forums et lancements de Product Hunt.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar categorías, foros y lanzamientos de Product Hunt.",
    },
  },
})

const presence = new Presence(settings)

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

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()

  if (isOnProductPage()) {
    const name = findProductName()
    const tagline = findProductTagline()
    const logo = findProductLogo()

    await presence.setActivity({
      details: name || strings.discoveringProduct,
      state: tagline,
      largeImageKey: logo || Assets.Logo,
      largeImageText: name || "Product Hunt",
      smallImageKey: Assets.Logo,
      smallImageText: "Product Hunt",
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
    if (!ctx.settings.showBrowsing) {
      presence.clearActivity()
      return
    }

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
      buttons: [{ label: strings.viewTopic, url: window.location.href.split("?")[0] }],
    })
    return
  }

  if (isOnForumsListPage()) {
    if (!ctx.settings.showBrowsing) {
      presence.clearActivity()
      return
    }

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
      largeImageKey: avatar || Assets.Logo,
      largeImageText: name || "Product Hunt",
      smallImageKey: Assets.Logo,
      smallImageText: "Product Hunt",
      type: PresenceType.Watching,
      buttons: [{ label: strings.viewProfile, url: window.location.href.split("?")[0] }],
    })
    return
  }

  if (isOnHomePage()) {
    if (!ctx.settings.showBrowsing) {
      presence.clearActivity()
      return
    }

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
