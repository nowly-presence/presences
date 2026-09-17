import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getChatGptPage } from "./utils/page"
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
      "en-US": "When enabled, temporary ChatGPT chats can show their title on Discord. Off by default: Discord only shows that you are using ChatGPT.",
      "fr-FR": "Lorsque cette option est activée, les chats temporaires ChatGPT peuvent afficher leur titre sur Discord. Désactivé par défaut : Discord indique seulement que vous utilisez ChatGPT.",
      "es-ES": "Si está activada, los chats temporales de ChatGPT pueden mostrar su título en Discord. Desactivada por defecto: Discord solo muestra que estás usando ChatGPT.",
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
      "en-US": "Show activity while you browse GPTs or other ChatGPT pages outside a chat.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez les GPTs ou d'autres pages ChatGPT hors d'un chat.",
      "es-ES": "Muestra actividad al explorar GPTs u otras páginas de ChatGPT fuera de un chat.",
    },
  },
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

const browsingDetails = (activity: string, strings: typeof enUS): string => {
  switch (activity) {
    case "gpts":
      return strings.browsingGpts
    case "plugins":
      return strings.browsingPlugins
    case "scheduled":
      return strings.browsingScheduled
    case "library":
      return strings.browsingLibrary
    case "images":
      return strings.browsingImages
    case "health":
      return strings.browsingHealth
    case "finances":
      return strings.browsingFinances
    case "codex":
      return strings.browsingCodex
    default:
      return strings.browsingChatGPT
  }
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const showPrivateChats = isEnabled(ctx.settings.showPrivateChats)
  const showConversationTitle = !("showConversationTitle" in ctx.settings) || isEnabled(ctx.settings.showConversationTitle)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getChatGptPage()

  if (page.kind === "chat") {
    const hideDetails = page.private && !showPrivateChats
    const title = !hideDetails && showConversationTitle ? page.title : undefined
    const data: PresenceData = {
      details: hideDetails ? strings.usingChatGPT : strings.viewingConversation,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: "ChatGPT",
      type: PresenceType.Playing,
      startTimestamp: page.startedAt,
    }

    await presence.setActivity(data)
    return
  }

  if (page.kind === "project") {
    const title = showConversationTitle ? page.title : undefined
    await presence.setActivity({
      details: strings.viewingProject,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: "ChatGPT",
      type: PresenceType.Playing,
    })
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: browsingDetails(page.activity, strings),
    largeImageKey: Assets.Logo,
    largeImageText: "ChatGPT",
    type: PresenceType.Playing,
  })
})
