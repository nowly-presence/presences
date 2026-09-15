import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getClaudePage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showPrivateChats: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show incognito chats",
      "fr-FR": "Afficher les chats incognito",
      "es-ES": "Mostrar chats incógnito",
    },
    description: {
      "en-US": "When enabled, incognito Claude chats can show their title on Discord. Off by default: Discord only shows that you are using Claude.",
      "fr-FR": "Lorsque cette option est activée, les chats incognito Claude peuvent afficher leur titre sur Discord. Désactivé par défaut : Discord indique seulement que vous utilisez Claude.",
      "es-ES": "Si está activada, los chats incógnito de Claude pueden mostrar su título en Discord. Desactivada por defecto: Discord solo muestra que estás usando Claude.",
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
      "en-US": "Show the current conversation or project title when it is available.",
      "fr-FR": "Affiche le titre de la conversation ou du projet en cours lorsqu'il est disponible.",
      "es-ES": "Muestra el título de la conversación o proyecto actual cuando está disponible.",
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
      "en-US": "Show activity while you browse Claude outside a chat.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez Claude hors d'un chat.",
      "es-ES": "Muestra actividad al explorar Claude fuera de un chat.",
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
  const page = getClaudePage()

  if (page.kind === "chat") {
    const hideDetails = page.private && !showPrivateChats
    const title = !hideDetails && showConversationTitle ? page.title : undefined
    const data: PresenceData = {
      details: title ? presence.formatString(strings.chatting, { title }) : strings.usingClaude,
      largeImageKey: Assets.Logo,
      largeImageText: "Claude",
      type: PresenceType.Playing,
      startTimestamp: page.startedAt,
    }

    if (!hideDetails && showButtons && page.url) {
      data.buttons = [{ label: strings.openChat, url: page.url }]
    }

    await presence.setActivity(data)
    return
  }

  if (page.kind === "project") {
    const title = showConversationTitle ? page.title : undefined
    await presence.setActivity({
      details: title ?? strings.viewingProject,
      state: title ? strings.viewingProject : undefined,
      largeImageKey: Assets.Logo,
      largeImageText: "Claude",
      type: PresenceType.Playing,
    })
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: strings.browsingClaude,
    largeImageKey: Assets.Logo,
    largeImageText: "Claude",
    type: PresenceType.Playing,
  })
})
