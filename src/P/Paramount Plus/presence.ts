import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import { findVideo, getPlayerMetadata, getPoster } from "./utils/player"
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
      "en-US": "When enabled, your Discord presence also shows when you browse Paramount+ (home, search, shows) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Paramount+ (accueil, recherche, séries) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Paramount+ (inicio, búsqueda, series), no solo al reproducir contenido.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const video = findVideo()
  const isLive = pathname.includes("/live-tv/")
  const playerArea = document.querySelector(".video__player-area")
  const onWatchRoute = /\/(?:shows|movies)\/video\//.test(pathname) || isLive

  const isWatching = !!video && onWatchRoute && (!!playerArea || video.duration > 0)

  if (isWatching && video) {
    const { title, episode } = getPlayerMetadata()
    const poster = getPoster()

    const data: Parameters<typeof presence.setActivity>[0] = {
      details: title || "Paramount+",
      state: isLive ? strings.liveTv : episode,
      largeImageKey: poster || Assets.Logo,
      largeImageText: title || "Paramount+",
      type: PresenceType.Watching,
      buttons: [{
        label: episode ? strings.watchEpisode : strings.watchNow,
        url: href.split("?")[0] || href,
      }],
    }

    if (video.paused) {
      data.smallImageKey = "pause"
      data.smallImageText = strings.paused
    } else {
      data.smallImageKey = "play"
      data.smallImageText = strings.playing
      if (!isLive) Object.assign(data, createMediaTimestamps(video))
    }

    await presence.setActivity(data)
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await handleBrowsingActivity(presence, pathname)
})
