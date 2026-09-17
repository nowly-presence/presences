import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getVibePage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showPrivateChats: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show private chats",
      "fr-FR": "Afficher les chats privés",
      "es-ES": "Mostrar chats privados",
    },
    description: {
      "en-US": "When enabled, private Vibe conversations can show their title on Discord. Off by default: Discord only shows that you are using Vibe.",
      "fr-FR": "Lorsque cette option est activée, les conversations privées Vibe peuvent afficher leur titre sur Discord. Désactivé par défaut : Discord indique seulement que vous utilisez Vibe.",
      "es-ES": "Si está activada, las conversaciones privadas de Vibe pueden mostrar su título en Discord. Desactivada por defecto: Discord solo muestra que estás usando Vibe.",
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
      "en-US": "Show activity while you browse Vibe outside a chat.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez Vibe hors d'un chat.",
      "es-ES": "Muestra actividad al explorar Vibe fuera de un chat.",
    },
  },
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

const browsingDetails = (activity: string, strings: typeof enUS): string => {
  switch (activity) {
    case "work":
      return strings.browsingWork
    case "code":
      return strings.browsingCode
    case "codeExtensions":
      return strings.browsingCodeExtensions
    case "memories":
      return strings.browsingMemories
    case "connectors":
      return strings.browsingConnectors
    case "libraries":
      return strings.browsingLibraries
    case "agentsShared":
      return strings.browsingAgentsShared
    case "agentsMine":
      return strings.browsingAgentsMine
    case "agents":
      return strings.browsingAgents
    case "skills":
      return strings.browsingSkills
    case "knowledge":
      return strings.browsingKnowledge
    case "tasks":
      return strings.browsingTasks
    default:
      return strings.browsingVibe
  }
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const showPrivateChats = isEnabled(ctx.settings.showPrivateChats)
  const showConversationTitle = !("showConversationTitle" in ctx.settings) || isEnabled(ctx.settings.showConversationTitle)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getVibePage()

  if (page.kind === "chat") {
    const hideDetails = page.private && !showPrivateChats
    const title = !hideDetails && showConversationTitle ? page.title : undefined
    const data: PresenceData = {
      details: hideDetails ? strings.usingVibe : strings.viewingConversation,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: "Vibe",
      type: PresenceType.Playing,
      startTimestamp: page.startedAt,
    }

    await presence.setActivity(data)
    return
  }

  if (page.kind === "project" || page.kind === "connector" || page.kind === "library") {
    const label = page.kind === "project" ? strings.viewingProject
      : page.kind === "connector" ? strings.viewingConnector
      : strings.viewingLibrary
    const title = showConversationTitle ? page.title : undefined
    await presence.setActivity({
      details: label,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: "Vibe",
      type: PresenceType.Playing,
    })
    return
  }

  if (page.kind === "instructions") {
    await presence.setActivity({
      details: strings.editingInstructions,
      largeImageKey: Assets.Logo,
      largeImageText: "Vibe",
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
    largeImageText: "Vibe",
    type: PresenceType.Playing,
  })
})
