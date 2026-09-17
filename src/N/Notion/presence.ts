import { PresenceType } from "@nowly/sdk"
import { getNotionPage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showPageTitle: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show page title",
      "fr-FR": "Afficher le titre de la page",
      "es-ES": "Mostrar el título de la página",
    },
    description: {
      "en-US": "When enabled, your Discord presence shows the name of the open Notion page.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord affiche le nom de la page Notion ouverte.",
      "es-ES": "Si está activada, tu presencia de Discord muestra el nombre de la página de Notion abierta.",
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
      "en-US": "Show activity on leftover Notion screens.",
      "fr-FR": "Affiche l'activité sur les autres écrans Notion.",
      "es-ES": "Muestra actividad en las demás pantallas de Notion.",
    },
  },
})

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const showPageTitle = !("showPageTitle" in ctx.settings) || isEnabled(ctx.settings.showPageTitle)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getNotionPage()

  if (page.kind === "page") {
    await presence.setActivity({
      details: showPageTitle && page.title
        ? presence.formatString(strings.editingPage, { title: page.title })
        : strings.workingInNotion,
      largeImageKey: Assets.Logo,
      largeImageText: "Notion",
      type: PresenceType.Watching,
    })
    return
  }

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const details =
    page.kind === "aiChat" ? strings.talkingWithAI
    : page.kind === "templates" ? strings.browsingTemplates
    : page.kind === "calendar" ? strings.viewingCalendar
    : page.kind === "search" ? strings.searching
    : page.kind === "settings" ? strings.viewingSettings
    : strings.browsingNotion

  const data = {
    details,
    largeImageKey: Assets.Logo,
    largeImageText: "Notion",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") Object.assign(data, { smallImageKey: "search" })
  await presence.setActivity(data)
})
