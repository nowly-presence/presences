import { PresenceType, type PresenceData } from "@nowly/sdk"
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
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show buttons",
      "fr-FR": "Afficher les boutons",
      "es-ES": "Mostrar botones",
    },
    description: {
      "en-US": "Show a button to open the current profile.",
      "fr-FR": "Affiche un bouton pour ouvrir le profil en cours.",
      "es-ES": "Muestra un botón para abrir el perfil actual.",
    },
  },
})

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
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
    : page.kind === "games" ? strings.playingGame
    : page.kind === "settings" ? strings.editingSettings
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

  const image =
    page.kind === "profile" || page.kind === "company" || page.kind === "school" ? page.image : undefined

  const data: PresenceData = {
    details,
    state,
    largeImageKey: (!privacy && image) || Assets.Logo,
    largeImageText: "LinkedIn",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") data.smallImageKey = "search"

  if (!privacy && showButtons) {
    if (page.kind === "profile") data.buttons = [{ label: strings.viewProfile, url: page.url }]
    else if (page.kind === "company" || page.kind === "school") data.buttons = [{ label: strings.viewPage, url: page.url }]
    else if (page.kind === "post") data.buttons = [{ label: strings.viewPost, url: page.url }]
  }
  await presence.setActivity(data)
})
