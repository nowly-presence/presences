import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getCrunchyrollPage, getEpisodeCover, getSeriesUrl, getVideo, getWatchInfo } from "./utils/page"
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
      "en-US": "Hide the title you're watching.",
      "fr-FR": "Masque le titre que vous regardez.",
      "es-ES": "Oculta el título que estás viendo.",
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
      "en-US": "Show activity on leftover Crunchyroll pages.",
      "fr-FR": "Affiche l'activité sur les autres pages Crunchyroll.",
      "es-ES": "Muestra actividad en las demás páginas de Crunchyroll.",
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
      "en-US": "Show a button to open the current page.",
      "fr-FR": "Affiche un bouton pour ouvrir la page en cours.",
      "es-ES": "Muestra un botón para abrir la página actual.",
    },
  },
})

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getCrunchyrollPage()
  const video = getVideo()
  const href = document.location.href.split("?")[0] ?? document.location.href
  const watching = page.kind === "watch" || Boolean(video && video.duration > 0)

  if (watching) {
    const playing = video ? !video.paused && !video.ended : true
    const info = getWatchInfo()
    const seasonEpisode =
      info.season !== undefined && info.episodeNumber !== undefined
        ? presence.formatString(strings.seasonEpisode, { season: info.season, episode: info.episodeNumber })
        : undefined
    const data: PresenceData = {
      details: privacy ? strings.watching : info.show || (page.kind === "watch" ? page.title : undefined) || strings.watching,
      state: privacy ? undefined : info.episode,
      largeImageKey: (!privacy && getEpisodeCover()) || Assets.Logo,
      largeImageText: seasonEpisode ?? "Crunchyroll",
      smallImageKey: playing ? "play" : "pause",
      smallImageText: playing ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }
    if (playing && video) Object.assign(data, createMediaTimestamps(video))
    if (!privacy && showButtons) {
      const seriesUrl = getSeriesUrl()
      data.buttons = [
        { label: strings.watchEpisode, url: href },
        ...(seriesUrl ? [{ label: strings.viewSeries, url: seriesUrl }] : []),
      ]
    }
    await presence.setActivity(data)
    return
  }

  const details =
    page.kind === "series" ? strings.viewingSeries
    : page.kind === "manga" ? strings.readingManga
    : page.kind === "news" ? strings.readingNews
    : page.kind === "search" ? strings.searching
    : page.kind === "watchlist" ? strings.viewingWatchlist
    : page.kind === "history" ? strings.viewingHistory
    : page.kind === "calendar" ? strings.viewingCalendar
    : page.kind === "games" ? strings.browsingGames
    : page.kind === "music" ? strings.browsingMusic
    : page.kind === "home" ? strings.browsingCrunchyroll
    : strings.browsingCrunchyroll

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const data: PresenceData = {
    details,
    state: privacy ? undefined : page.kind === "series" || page.kind === "manga" || page.kind === "news" ? page.title : undefined,
    largeImageKey: Assets.Logo,
    largeImageText: "Crunchyroll",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") data.smallImageKey = "search"
  await presence.setActivity(data)
})
