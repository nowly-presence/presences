import { PresenceType, type PresenceData } from "@nowly/sdk"
import { getRedditPage } from "./utils/page"
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
      "en-US": "Hide subreddit names, usernames, and post links on Discord.",
      "fr-FR": "Masque les noms de communautés, identifiants et liens de posts sur Discord.",
      "es-ES": "Oculta nombres de comunidades, usuarios y enlaces de publicaciones en Discord.",
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
      "en-US": "Show activity on the home feed and other browsing pages.",
      "fr-FR": "Affiche l'activité sur le fil d'accueil et les autres pages de navigation.",
      "es-ES": "Muestra actividad en el inicio y otras páginas de navegación.",
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
      "en-US": "Show buttons to open the current post or community.",
      "fr-FR": "Affiche des boutons pour ouvrir le post ou la communauté en cours.",
      "es-ES": "Muestra botones para abrir la publicación o comunidad actual.",
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
  const page = getRedditPage()

  if (page.kind === "messages") {
    await presence.setActivity({
      details: strings.usingReddit,
      state: strings.readingMessages,
      largeImageKey: Assets.Logo,
      largeImageText: "Reddit",
      type: PresenceType.Watching,
    })
    return
  }

  if (page.kind === "post") {
    const data: PresenceData = {
      details: !privacy && page.title ? page.title : strings.viewingPost,
      state: privacy ? undefined : `r/${page.subreddit}`,
      largeImageKey: Assets.Logo,
      largeImageText: "Reddit",
      type: PresenceType.Watching,
    }
    if (!privacy && showButtons) {
      data.buttons = [{ label: strings.viewPost, url: page.url }]
    }
    await presence.setActivity(data)
    return
  }

  if (page.kind === "subreddit") {
    const data: PresenceData = {
      details: privacy
        ? strings.viewingSubreddit
        : presence.formatString(strings.viewingSubredditOf, { subreddit: page.subreddit }),
      largeImageKey: Assets.Logo,
      largeImageText: "Reddit",
      type: PresenceType.Watching,
    }
    if (!privacy && showButtons) {
      data.buttons = [{ label: strings.viewCommunity, url: page.url }]
    }
    await presence.setActivity(data)
    return
  }

  if (page.kind === "profile") {
    await presence.setActivity({
      details: privacy ? strings.viewingProfile : presence.formatString(strings.viewingProfileOf, { user: page.user }),
      largeImageKey: Assets.Logo,
      largeImageText: "Reddit",
      type: PresenceType.Watching,
    })
    return
  }

  if (page.kind === "search") {
    await presence.setActivity({
      details: strings.searching,
      state: privacy ? undefined : page.query,
      largeImageKey: Assets.Logo,
      largeImageText: "Reddit",
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: page.kind === "home" ? strings.browsingHome : strings.browsingReddit,
    largeImageKey: Assets.Logo,
    largeImageText: "Reddit",
    type: PresenceType.Watching,
  })
})
