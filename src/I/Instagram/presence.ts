import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getInstagramPage } from "./utils/page"
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
      "en-US": "Hide usernames and content links on Discord.",
      "fr-FR": "Masque les identifiants et les liens de contenu sur Discord.",
      "es-ES": "Oculta nombres de usuario y enlaces de contenido en Discord.",
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
      "en-US": "Show activity on the home feed, explore, and other browsing pages.",
      "fr-FR": "Affiche l'activité sur le fil d'accueil, Explorer et les autres pages de navigation.",
      "es-ES": "Muestra actividad en el inicio, Explorar y otras páginas de navegación.",
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
      "en-US": "Show buttons to open the current post or profile.",
      "fr-FR": "Affiche des boutons pour ouvrir le post ou le profil en cours.",
      "es-ES": "Muestra botones para abrir la publicación o el perfil actual.",
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
  const page = getInstagramPage()

  if (page.kind === "messages") {
    await presence.setActivity({
      details: strings.usingInstagram,
      state: strings.readingMessages,
      largeImageKey: Assets.Logo,
      largeImageText: "Instagram",
      type: PresenceType.Watching,
    })
    return
  }

  if (page.kind === "post" || page.kind === "reel") {
    const data: PresenceData = {
      details: page.kind === "reel" ? strings.viewingReel : strings.viewingPost,
      largeImageKey: Assets.Logo,
      largeImageText: "Instagram",
      type: PresenceType.Watching,
    }
    if (!privacy && showButtons) {
      data.buttons = [{ label: strings.viewPost, url: page.url }]
    }
    await presence.setActivity(data)
    return
  }

  if (page.kind === "story") {
    await presence.setActivity({
      details: strings.viewingStory,
      state: privacy ? undefined : page.user ? `@${page.user}` : undefined,
      largeImageKey: Assets.Logo,
      largeImageText: "Instagram",
      type: PresenceType.Watching,
    })
    return
  }

  if (page.kind === "profile") {
    const data: PresenceData = {
      details: privacy ? strings.viewingProfile : presence.formatString(strings.viewingProfileOf, { user: page.user }),
      largeImageKey: Assets.Logo,
      largeImageText: "Instagram",
      type: PresenceType.Watching,
    }
    if (!privacy && showButtons) {
      data.buttons = [{ label: strings.viewProfile, url: page.url }]
    }
    await presence.setActivity(data)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  const browsing =
    page.kind === "explore" ? strings.browsingExplore
    : page.kind === "home" ? strings.browsingHome
    : strings.browsingInstagram

  await presence.setActivity({
    details: browsing,
    largeImageKey: Assets.Logo,
    largeImageText: "Instagram",
    type: PresenceType.Watching,
  })
})
