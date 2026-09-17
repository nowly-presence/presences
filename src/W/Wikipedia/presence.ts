import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getWikipediaLeadImage, getWikipediaPage, pageUrl } from "./utils/page"
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
      "en-US": "Hide the article title, image, and buttons.",
      "fr-FR": "Masque le titre de l'article, l'image et les boutons.",
      "es-ES": "Oculta el título del artículo, la imagen y los botones.",
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
      "en-US": "Show activity on leftover Wikipedia pages.",
      "fr-FR": "Affiche l'activité sur les autres pages Wikipédia.",
      "es-ES": "Muestra actividad en las demás páginas de Wikipedia.",
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
      "en-US": "Show a button to open the current page.",
      "fr-FR": "Affiche un bouton pour ouvrir la page en cours.",
      "es-ES": "Muestra un botón para abrir la página actual.",
    },
  },
})

const WIKIPEDIA_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/128px-Wikipedia-logo-v2.svg.png"

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const page = getWikipediaPage()

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const details =
    page.kind === "article" ? (privacy ? strings.readingWikipedia : presence.formatString(strings.readingArticle, { title: page.title }))
    : page.kind === "category" ? strings.viewingCategory
    : page.kind === "search" ? strings.searching
    : page.kind === "portal" ? strings.viewingPortal
    : page.kind === "file" ? strings.viewingFile
    : page.kind === "talk" ? strings.viewingTalk
    : page.kind === "special" ? strings.viewingSpecial
    : strings.browsingWikipedia

  const state =
    privacy ? undefined
    : page.kind === "category" || page.kind === "portal" || page.kind === "file" || page.kind === "talk" || page.kind === "special"
      ? page.title
      : undefined

  const data: PresenceData = {
    details,
    state,
    largeImageKey: Assets.Logo,
    largeImageText: "Wikipedia",
    type: PresenceType.Watching,
  }

  const canSharePage = page.kind === "article" || page.kind === "file" || page.kind === "portal" || page.kind === "category"

  if (canSharePage && !privacy) {
    const image = getWikipediaLeadImage()
    if (image) {
      data.largeImageKey = image
      data.largeImageText = page.kind === "article" ? page.title : "Wikipedia"
      data.smallImageKey = WIKIPEDIA_LOGO
      data.smallImageText = "Wikipedia"
    }
    if (showButtons) {
      data.buttons = [{ label: strings.viewPage, url: pageUrl() }]
    }
  }

  if (page.kind === "search") data.smallImageKey = "search"
  await presence.setActivity(data)
})
