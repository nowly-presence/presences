import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getGeminiPage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showPrivateChats: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show temporary chats",
      "fr-FR": "Afficher les chats temporaires",
      "es-ES": "Mostrar chats temporales",
    },
    description: {
      "en-US": "When enabled, temporary Gemini chats can show their title on Discord. Off by default: Discord only shows that you are using Gemini.",
      "fr-FR": "Lorsque cette option est activée, les chats temporaires Gemini peuvent afficher leur titre sur Discord. Désactivé par défaut : Discord indique seulement que vous utilisez Gemini.",
      "es-ES": "Si está activada, los chats temporales de Gemini pueden mostrar su título en Discord. Desactivada por defecto: Discord solo muestra que estás usando Gemini.",
    },
  },
  showConversationTitle: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show conversation title",
      "fr-FR": "Afficher le titre de la conversation",
      "es-ES": "Mostrar el título de la conversación",
    },
    description: {
      "en-US": "Show the current conversation title when it is available.",
      "fr-FR": "Affiche le titre de la conversation en cours lorsqu'il est disponible.",
      "es-ES": "Muestra el título de la conversación actual cuando está disponible.",
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
      "en-US": "Show activity while you browse Gems or other Gemini pages outside a chat.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez les Gems ou d'autres pages Gemini hors d'un chat.",
      "es-ES": "Muestra actividad al explorar Gems u otras páginas de Gemini fuera de un chat.",
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
      "en-US": "Show a button to open the current chat.",
      "fr-FR": "Affiche un bouton pour ouvrir le chat en cours.",
      "es-ES": "Muestra un botón para abrir el chat actual.",
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
  const page = getGeminiPage()

  if (page.kind === "chat") {
    const hideDetails = page.private && !showPrivateChats
    const title = !hideDetails && showConversationTitle ? page.title : undefined
    const data: PresenceData = {
      details: title ? presence.formatString(strings.chatting, { title }) : strings.usingGemini,
      largeImageKey: Assets.Logo,
      largeImageText: "Gemini",
      type: PresenceType.Playing,
      startTimestamp: page.startedAt,
    }

    if (!hideDetails && showButtons && page.url) {
      data.buttons = [{ label: strings.openChat, url: page.url }]
    }

    await presence.setActivity(data)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: page.activity === "gems" ? strings.browsingGems : strings.browsingGemini,
    largeImageKey: Assets.Logo,
    largeImageText: "Gemini",
    type: PresenceType.Playing,
  })
})
