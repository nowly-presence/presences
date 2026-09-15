import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getPerplexityPage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showPrivateChats: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show incognito searches",
      "fr-FR": "Afficher les recherches incognito",
      "es-ES": "Mostrar búsquedas incógnito",
    },
    description: {
      "en-US": "When enabled, incognito Perplexity searches can show their query on Discord. Off by default: Discord only shows that you are using Perplexity.",
      "fr-FR": "Lorsque cette option est activée, les recherches incognito Perplexity peuvent afficher leur requête sur Discord. Désactivé par défaut : Discord indique seulement que vous utilisez Perplexity.",
      "es-ES": "Si está activada, las búsquedas incógnito de Perplexity pueden mostrar su consulta en Discord. Desactivada por defecto: Discord solo muestra que estás usando Perplexity.",
    },
  },
  showConversationTitle: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show search title",
      "fr-FR": "Afficher le titre de la recherche",
      "es-ES": "Mostrar el título de la búsqueda",
    },
    description: {
      "en-US": "Show the current query or thread title when it is available.",
      "fr-FR": "Affiche la requête ou le titre du fil en cours lorsqu'il est disponible.",
      "es-ES": "Muestra la consulta o el título del hilo actual cuando está disponible.",
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
      "en-US": "Show activity while you browse Spaces or other Perplexity pages.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez les Spaces ou d'autres pages Perplexity.",
      "es-ES": "Muestra actividad al explorar Spaces u otras páginas de Perplexity.",
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
      "en-US": "Show a button to open the current thread.",
      "fr-FR": "Affiche un bouton pour ouvrir le fil en cours.",
      "es-ES": "Muestra un botón para abrir el hilo actual.",
    },
  },
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const showPrivateChats = isEnabled(ctx.settings.showPrivateChats)
  const showConversationTitle = !("showConversationTitle" in ctx.settings) || isEnabled(ctx.settings.showConversationTitle)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const page = getPerplexityPage()

  if (page.kind === "search") {
    const hideDetails = page.private && !showPrivateChats
    const title = !hideDetails && showConversationTitle ? page.title : undefined
    const data: PresenceData = {
      details: title ? presence.formatString(strings.searching, { title }) : strings.usingPerplexity,
      largeImageKey: Assets.Logo,
      largeImageText: "Perplexity",
      type: PresenceType.Playing,
      startTimestamp: page.startedAt,
    }

    if (!hideDetails && showButtons && page.url) {
      data.buttons = [{ label: strings.openThread, url: page.url }]
    }

    await presence.setActivity(data)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: page.activity === "spaces" ? strings.browsingSpaces : strings.browsingPerplexity,
    largeImageKey: Assets.Logo,
    largeImageText: "Perplexity",
    type: PresenceType.Playing,
  })
})
