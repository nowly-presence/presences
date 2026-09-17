import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getGrokPage } from "./utils/page"
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
      "en-US": "When enabled, private Grok chats can show their title on Discord. Off by default: Discord only shows that you are using Grok.",
      "fr-FR": "Lorsque cette option est activée, les chats privés Grok peuvent afficher leur titre sur Discord. Désactivé par défaut : Discord indique seulement que vous utilisez Grok.",
      "es-ES": "Si está activada, los chats privados de Grok pueden mostrar su título en Discord. Desactivada por defecto: Discord solo muestra que estás usando Grok.",
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
      "en-US": "Show activity while you browse Grok pages outside a chat.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez Grok hors d'un chat.",
      "es-ES": "Muestra actividad al explorar Grok fuera de un chat.",
    },
  },
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

const browsingDetails = (activity: string, strings: typeof enUS): string => {
  switch (activity) {
    case "automations":
      return strings.browsingAutomations
    case "library":
      return strings.browsingLibrary
    case "media":
      return strings.browsingMedia
    case "projects":
      return strings.browsingProjects
    case "apps":
      return strings.browsingApps
    case "files":
      return strings.browsingFiles
    case "connectors":
      return strings.browsingConnectors
    case "skills":
      return strings.browsingSkills
    default:
      return strings.browsingGrok
  }
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const showPrivateChats = isEnabled(ctx.settings.showPrivateChats)
  const showConversationTitle = !("showConversationTitle" in ctx.settings) || isEnabled(ctx.settings.showConversationTitle)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getGrokPage()

  if (page.kind === "imagine") {
    await presence.setActivity({
      details: page.editing ? strings.editingImage : strings.usingImagine,
      largeImageKey: Assets.Logo,
      largeImageText: "Grok",
      type: PresenceType.Playing,
    })
    return
  }

  if (page.kind === "writingSkill") {
    await presence.setActivity({
      details: strings.writingSkill,
      largeImageKey: Assets.Logo,
      largeImageText: "Grok",
      type: PresenceType.Playing,
    })
    return
  }

  if (page.kind === "chat") {
    const hideDetails = page.private && !showPrivateChats
    const title = !hideDetails && showConversationTitle ? page.title : undefined
    const data: PresenceData = {
      details: hideDetails ? strings.usingGrok : strings.viewingConversation,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: "Grok",
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
      largeImageText: "Grok",
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
    largeImageText: "Grok",
    type: PresenceType.Playing,
  })
})
