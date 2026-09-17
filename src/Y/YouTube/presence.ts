import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import { Category } from "./utils/categories"
import { findTitle, findUploader } from "./utils/channel"
import { $, findVideo, text } from "./utils/dom"
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
      "en-US": "When enabled, your Discord presence also shows when you browse YouTube (home, search, subscriptions) - not only when a video is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez YouTube (accueil, recherche, abonnements) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar YouTube (inicio, búsqueda, suscripciones), no solo al reproducir un vídeo.",
    },
  },
  showChannels: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show channel details",
      "fr-FR": "Afficher les détails de la chaîne",
      "es-ES": "Mostrar detalles del canal",
    },
    description: {
      "en-US": "When enabled, your Discord presence shows the channel name and avatar on channel pages.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord affiche le nom et l'avatar de la chaîne sur les pages chaîne.",
      "es-ES": "Si está activada, tu presencia de Discord muestra el nombre y el avatar del canal en las páginas de canal.",
    },
  },
})

const presence = new Presence(settings)
let prevPath = ""

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href, search } = document.location

  if (pathname !== prevPath) {
    prevPath = pathname
    await new Promise((r) => setTimeout(r, 800))
  }

  const video = findVideo()
  const videoId = new URLSearchParams(search).get("v")

  if (video && videoId) {
    const title = findTitle()
    const isPlaying = !video.paused
    const uploader = findUploader(videoId)

    await presence.setActivity({
      details: title,
      ...(uploader ? { state: uploader } : {}),
      largeImageKey: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined,
      largeImageText: title,
      smallImageKey: isPlaying ? "play" : "pause",
      smallImageText: isPlaying ? strings.playing : strings.paused,
      ...createMediaTimestamps(video),
      type: PresenceType.Watching,
      buttons: [{ label: strings.watchVideo, url: href.split("&")[0] }],
    })
    return
  }

  const playablesMatch = pathname.match(/^\/playables\/([^/]+)$/)
  if (playablesMatch) {
    const gameName = text($(".ytMiniAppTopBarViewModelTitle"))
    const gameIcon = $<HTMLMetaElement>("meta[property='og:image']")?.content
      || document.querySelector<HTMLElement>(".miniAppSplashScreenViewModelBackgroundBlur")?.style.backgroundImage?.match(/url\("([^"]+)"\)/)?.[1]

    await presence.setActivity({
      details: gameName || strings.playingGame,
      state: findUploader(),
      largeImageKey: gameIcon || Category.Playables,
      largeImageText: gameName || strings.youtubePlayables,
      startTimestamp: Math.floor(Date.now() / 1000),
      type: PresenceType.Watching,
      buttons: [{ label: strings.playGame, url: href.split("?")[0] }],
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await handleBrowsingActivity(presence, ctx.settings)
})
