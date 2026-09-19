import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import {
  clearMetadata,
  fetchMetadata,
  findCurrentEpisode,
  getBoxart,
  getVideoId,
} from "./utils/metadata"
import { findVideo } from "./utils/player"
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
      "en-US": "When enabled, your Discord presence also shows when you browse Netflix (home, search, title pages) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Netflix (accueil, recherche, fiches) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Netflix (inicio, búsqueda, fichas), no solo al reproducir contenido.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = document.location
  const href = window.location.href
  const id = getVideoId(href)

  // Watching a movie or episode.
  if (pathname.includes("/watch") && id) {
    const video = findVideo()

    if (video) {
      const meta = await fetchMetadata(id)
      const v = meta?.video
      const isEpisode = v?.type === "show"

      let state: string | undefined
      if (v?.type === "show") {
        const current = findCurrentEpisode(v)
        if (current) {
          const { season, episode } = current
          state = `S${season.seq}.E${episode.seq}`
          if (episode.title) state += ` ${episode.title}`
        }
      } else if (v?.type === "movie" && v.year) {
        state = String(v.year)
      }

      const data: Parameters<typeof presence.setActivity>[0] = {
        details: v?.title || strings.watching,
        state,
        largeImageKey: await getBoxart(v) || Assets.Logo,
        largeImageText: v?.title || "Netflix",
        type: PresenceType.Watching,
        buttons: [{
          label: isEpisode ? strings.watchEpisode : strings.watchMovie,
          url: href.split("?")[0] || href,
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
  }

  if (!ctx.settings.showBrowsing) {
    clearMetadata()
    presence.clearActivity()
    return
  }

  // Viewing a title detail page (/title/{id} or ?jbv={id}).
  if (id) {
    const meta = await fetchMetadata(id)
    const v = meta?.video

    await presence.setActivity({
      details: v?.title || strings.watching,
      state: v?.synopsis?.slice(0, 128),
      largeImageKey: await getBoxart(v) || Assets.Logo,
      largeImageText: v?.title || "Netflix",
      smallImageKey: Assets.Logo,
      smallImageText: "Netflix",
      type: PresenceType.Watching,
      buttons: [{
        label: v?.type === "show" ? strings.viewSeries : strings.viewMovie,
        url: href,
      }],
    })
    return
  }

  await handleBrowsingActivity(presence, pathname)
})