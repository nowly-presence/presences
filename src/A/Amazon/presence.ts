import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getAmazonPage, getAmazonProductImage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  privacy: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Privacy mode",
      "fr-FR": "Mode privé",
      "es-ES": "Modo privado",
    },
    description: {
      "en-US": "Hide product and store names.",
      "fr-FR": "Masque les noms de produits et de boutiques.",
      "es-ES": "Oculta nombres de productos y tiendas.",
    },
  },
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "Show activity on leftover Amazon pages.",
      "fr-FR": "Affiche l'activité sur les autres pages Amazon.",
      "es-ES": "Muestra actividad en las demás páginas de Amazon.",
    },
  },
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show buttons",
      "fr-FR": "Afficher les boutons",
      "es-ES": "Mostrar botones",
    },
    description: {
      "en-US": "Show a button to open the current product.",
      "fr-FR": "Affiche un bouton pour ouvrir le produit en cours.",
      "es-ES": "Muestra un botón para abrir el producto actual.",
    },
  },
})

const AMAZON_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/128px-Amazon_logo.svg.png"

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const page = getAmazonPage()

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const details =
    page.kind === "product" ? strings.viewingProduct
    : page.kind === "search" ? strings.searching
    : page.kind === "cart" ? strings.viewingCart
    : page.kind === "wishlist" ? strings.viewingWishlist
    : page.kind === "orders" ? strings.viewingOrders
    : page.kind === "deals" ? strings.browsingDeals
    : page.kind === "bestsellers" ? strings.browsingBestsellers
    : page.kind === "store" ? strings.viewingStore
    : page.kind === "category" ? strings.browsingCategory
    : strings.shoppingAmazon

  const state =
    privacy ? undefined
    : page.kind === "product" ? page.title
    : page.kind === "store" ? page.name
    : page.kind === "category" ? page.name
    : undefined

  const data: PresenceData = {
    details,
    state,
    largeImageKey: Assets.Logo,
    largeImageText: "Amazon",
    type: PresenceType.Watching,
  }

  if (page.kind === "product" && !privacy) {
    const image = getAmazonProductImage()
    if (image) {
      data.largeImageKey = image
      data.largeImageText = page.title || "Amazon"
      data.smallImageKey = AMAZON_LOGO
      data.smallImageText = "Amazon"
    }
    if (showButtons) {
      data.buttons = [{ label: strings.viewProduct, url: page.url }]
    }
  }

  if (page.kind === "search") data.smallImageKey = "search"
  await presence.setActivity(data)
})
