import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import { findVideo, getPageMetadata, isLivePath } from "./utils/player"
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
      "en-US": "When enabled, your Discord presence also shows when you browse CANAL+ (home, search, cinema, series) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez CANAL+ (accueil, recherche, cinéma, séries) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar CANAL+ (inicio, búsqueda, cine, series), no solo al reproducir contenido.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const video = findVideo()
  const live = isLivePath(pathname, video)
  const isProgrammePath = /\/h\/\d+/i.test(pathname)
  const isWatching = !!video && (isProgrammePath || live || video.duration > 0)

  if (isWatching && video) {
    const metadata = await getPageMetadata()

    const data: Parameters<typeof presence.setActivity>[0] = {
      details: metadata.title || "CANAL+",
      state: live ? metadata.subtitle || strings.liveTv : metadata.subtitle,
      largeImageKey: metadata.image || Assets.Logo,
      largeImageText: metadata.title || "CANAL+",
      type: PresenceType.Watching,
      buttons: [{
        label: live ? strings.watchLive : strings.watchNow,
        url: href.split("?")[0] || href,
      }],
    }

    if (video.paused) {
      data.smallImageKey = "pause"
      data.smallImageText = strings.paused
    } else {
      data.smallImageKey = "play"
      data.smallImageText = strings.playing
      if (!live) Object.assign(data, createMediaTimestamps(video))
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
