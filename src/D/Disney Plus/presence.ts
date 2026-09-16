import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { getDisneyPlayerData, installDisneyBridge } from "./utils/bridge"
import { createDisneyImageUrl, findEntityTitle, findVideo, isEpisodeSubtitle, parseEpisodeState } from "./utils/dom"
import type enUS from "./locales/en-US.json"

installDisneyBridge()

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
      "en-US": "When enabled, your Discord presence also shows when you browse Disney+ (home, search, categories) — not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Disney+ (accueil, recherche, catégories) — pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Disney+ (inicio, búsqueda, categorías), no solo al reproducir contenido.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = document.location
  const video = findVideo()
  const { imageId, title, subtitle } = getDisneyPlayerData()

  if (pathname.includes("/play/") && video && imageId) {
    const largeImageKey = createDisneyImageUrl(imageId)
    const state = parseEpisodeState(subtitle)

    const data: Parameters<typeof presence.setActivity>[0] = {
      details: title || "Disney+",
      state,
      largeImageKey,
      largeImageText: title || "Disney+",
      type: PresenceType.Watching,
      buttons: [{
        label: isEpisodeSubtitle(subtitle) ? strings.watchEpisode : strings.watchMovie,
        url: window.location.href,
      }],
    }

    if (video.paused) {
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

  if (pathname.includes("/entity/")) {
    const title = findEntityTitle()
    const isSeries = !!document.querySelector("#episodes_control")

    await presence.setActivity({
      details: isSeries ? strings.viewingSeries : strings.viewingMovie,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: title,
      type: PresenceType.Watching,
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  if (pathname === "/" || pathname.includes("/home")) {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/search")) {
    const query = document.querySelector<HTMLInputElement>('input[type="search"]')?.value
    await presence.setActivity({
      details: strings.searchingFor,
      state: query || "...",
      largeImageKey: Assets.Logo,
      smallImageKey: "search",
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/watchlist")) {
    await presence.setActivity({
      details: strings.browsingWatchlist,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/series")) {
    await presence.setActivity({
      details: strings.browsingSeries,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else if (pathname.includes("/movies")) {
    await presence.setActivity({
      details: strings.browsingMovies,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
  } else {
    presence.clearActivity()
  }
})