import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getDeepSeekPage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
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
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const showConversationTitle = !("showConversationTitle" in ctx.settings) || isEnabled(ctx.settings.showConversationTitle)
  const page = getDeepSeekPage()

  if (page.kind === "chat") {
    const title = showConversationTitle ? page.title : undefined
    const data: PresenceData = {
      details: strings.viewingConversation,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: "DeepSeek",
      type: PresenceType.Playing,
      startTimestamp: page.startedAt,
    }

    await presence.setActivity(data)
    return
  }

  presence.clearActivity()
})
