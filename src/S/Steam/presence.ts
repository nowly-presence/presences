import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getSteamPage, isSpecificSteamPage, type SteamPage } from "./utils/page"
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
      "en-US": "Hide game, profile, and page names.",
      "fr-FR": "Masque les noms de jeux, de profils et de pages.",
      "es-ES": "Oculta nombres de juegos, perfiles y páginas.",
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
      "en-US": "Show activity on leftover Steam pages that are not a known store or community view.",
      "fr-FR": "Affiche l'activité sur les pages Steam restantes qui ne sont pas une vue boutique ou communauté connue.",
      "es-ES": "Muestra actividad en las demás páginas de Steam que no son una vista conocida de tienda o comunidad.",
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
      "en-US": "Show a button to open the current store page.",
      "fr-FR": "Affiche un bouton pour ouvrir la page boutique en cours.",
      "es-ES": "Muestra un botón para abrir la página de tienda actual.",
    },
  },
})

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

const namedState = (privacy: boolean, value?: string): string | undefined =>
  privacy ? undefined : value

const detailsFor = (page: SteamPage, strings: typeof enUS): { details: string; state?: string; url?: string } => {
  switch (page.kind) {
    case "app":
      return { details: strings.viewingGame, state: page.title, url: page.url }
    case "bundle":
      return { details: strings.viewingBundle, state: page.title, url: page.url }
    case "package":
      return { details: strings.viewingPackage, state: page.title, url: page.url }
    case "profile":
      return { details: strings.viewingProfile, state: page.title }
    case "hub":
      return { details: strings.viewingHub, state: page.title }
    case "group":
      return { details: strings.viewingGroup, state: page.title }
    case "workshopItem":
      return { details: strings.viewingWorkshopItem, state: page.title }
    case "category":
      return { details: strings.browsingCategory, state: page.name }
    case "home":
      return { details: strings.browsingHome }
    case "charts":
      return { details: strings.browsingCharts }
    case "news":
      return { details: strings.browsingNews }
    case "wishlist":
      return { details: strings.browsingWishlist }
    case "specials":
      return { details: strings.browsingSpecials }
    case "demos":
      return { details: strings.browsingDemos }
    case "search":
      return { details: strings.searching }
    case "community":
      return { details: strings.browsingCommunity }
    case "discussions":
      return { details: strings.browsingDiscussions }
    case "market":
      return { details: strings.browsingMarket, state: page.title }
    case "workshop":
      return { details: strings.browsingWorkshop }
    case "curator":
      return { details: strings.viewingCurator, state: page.name }
    case "developer":
      return { details: strings.viewingDeveloper, state: page.name }
    case "publisher":
      return { details: strings.viewingPublisher, state: page.name }
    case "franchise":
      return { details: strings.viewingFranchise, state: page.name }
    case "points":
      return { details: strings.pointsShop }
    case "stats":
      return { details: strings.viewingStats }
    default:
      return { details: strings.browsingSteam }
  }
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getSteamPage()

  if (!isSpecificSteamPage(page) && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const mapped = detailsFor(page, strings)
  const data: PresenceData = {
    name: "Steam",
    appName: "Steam",
    details: mapped.details,
    state: namedState(privacy, mapped.state),
    largeImageKey: Assets.Logo,
    type: PresenceType.Playing,
  }

  if (page.kind === "search") data.smallImageKey = "search"

  if (!privacy && showButtons && mapped.url) {
    data.buttons = [{ label: strings.viewStore, url: mapped.url }]
  }

  await presence.setActivity(data)
})
