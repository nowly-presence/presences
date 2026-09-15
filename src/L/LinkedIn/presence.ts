import { PresenceType } from "@nowly/sdk"
import { getLinkedInPage } from "./utils/page"
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
      "en-US": "Hide profile, company, and job names.",
      "fr-FR": "Masque les noms de profils, d'entreprises et d'offres.",
      "es-ES": "Oculta nombres de perfiles, empresas y ofertas.",
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
      "en-US": "Show activity on leftover LinkedIn pages.",
      "fr-FR": "Affiche l'activité sur les autres pages LinkedIn.",
      "es-ES": "Muestra actividad en las demás páginas de LinkedIn.",
    },
  },
})

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getLinkedInPage()

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const details =
    page.kind === "messaging" ? strings.messaging
    : page.kind === "profile" ? strings.viewingProfile
    : page.kind === "company" ? strings.viewingCompany
    : page.kind === "school" ? strings.viewingSchool
    : page.kind === "job" ? strings.viewingJob
    : page.kind === "jobs" ? strings.browsingJobs
    : page.kind === "search" ? strings.searching
    : page.kind === "notifications" ? strings.viewingNotifications
    : page.kind === "network" ? strings.browsingNetwork
    : page.kind === "learning" ? strings.browsingLearning
    : page.kind === "groups" ? strings.viewingGroup
    : page.kind === "events" ? strings.viewingEvent
    : page.kind === "post" ? strings.viewingPost
    : page.kind === "article" ? strings.readingArticle
    : page.kind === "feed" ? strings.browsingFeed
    : strings.usingLinkedIn

  const state =
    privacy ? undefined
    : page.kind === "profile" ? page.name
    : page.kind === "company" || page.kind === "school" ? page.name
    : page.kind === "job" ? page.title
    : page.kind === "groups" || page.kind === "events" ? page.name
    : page.kind === "article" ? page.title
    : undefined

  const data = {
    details,
    state,
    largeImageKey: Assets.Logo,
    largeImageText: "LinkedIn",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") Object.assign(data, { smallImageKey: "search" })
  await presence.setActivity(data)
})
