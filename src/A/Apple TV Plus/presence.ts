import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { $, findVideo, hasPlayerTabs, text } from "./utils/dom"
import { getPageDescription, getPageTitle, getThumbnail, parseSubtitle } from "./utils/metadata"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "When enabled, your Discord presence also shows when you browse Apple TV+ (home, search) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Apple TV+ (accueil, recherche) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Apple TV+ (inicio, búsqueda), no solo al reproducir contenido.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const video = findVideo()
  const playing = video && hasPlayerTabs()

  if (video && playing) {
    const title = text($(".video-metadata .title"))
    const subtitle = text($(".video-metadata .subtitle-text"))
    const genre = text($(".metadata-genre"))
    const thumbnail = getThumbnail()
    const isPaused = !!video.paused

    const data: Parameters<typeof presence.setActivity>[0] = {
      largeImageKey: thumbnail || Assets.Logo,
      largeImageText: title || "Apple TV+",
      type: PresenceType.Watching,
      buttons: [{
        label: subtitle ? strings.watchEpisode : strings.watchShow,
        url: href,
      }],
    }

    if (subtitle) {
      const { seasonNum, episodeNum, episodeTitle } = parseSubtitle(subtitle)
      data.details = title || "Apple TV+"
      if (episodeTitle) {
        data.state = `S${seasonNum}:E${episodeNum} ${episodeTitle}`
      } else if (Number.isFinite(seasonNum) && Number.isFinite(episodeNum)) {
        data.state = presence.formatString(strings.seasonEpisode, { season: seasonNum!, episode: episodeNum! })
      } else {
        data.state = subtitle
      }
    } else {
      data.details = title || getPageTitle() || "Apple TV+"
      data.state = genre || strings.movie
    }

    if (isPaused) {
      data.smallImageKey = "pause"
      data.smallImageText = strings.paused
    } else {
      data.smallImageKey = "play"
      data.smallImageText = strings.playing
      Object.assign(data, createMediaTimestamps(video))
    }

    await presence.setActivity(data)
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  if (pathname === "/" || pathname.startsWith("/home")) {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/search")) {
    const query = new URLSearchParams(document.location.search).get("q")
    await presence.setActivity({
      details: strings.searching,
      state: query ? `"${query}"` : undefined,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/show/")) {
    const pageTitle = getPageTitle()
    await presence.setActivity({
      details: pageTitle || strings.viewingSeries,
      state: pageTitle ? undefined : getPageDescription(),
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/room/")) {
    await presence.setActivity({
      details: strings.sharePlayRoom,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  await presence.setActivity({
    details: strings.browsing,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
