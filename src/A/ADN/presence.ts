import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getAdnPage, getVideo } from "./utils/page"
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
      "en-US": "Show activity on leftover ADN pages.",
      "fr-FR": "Affiche l'activité sur les autres pages ADN.",
      "es-ES": "Muestra actividad en las demás páginas de ADN.",
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
  const page = getAdnPage()
  const video = getVideo()
  const href = document.location.href.split("?")[0] ?? document.location.href
  const watching = page.kind === "watch" || Boolean(video && video.duration > 0)

  if (watching) {
    const playing = video ? !video.paused && !video.ended : true
    const title = "title" in page ? page.title : undefined
    const data: PresenceData = {
      details: privacy ? strings.watching : title || strings.watching,
      largeImageKey: Assets.Logo,
      largeImageText: "ADN",
      smallImageKey: playing ? "play" : "pause",
      smallImageText: playing ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }
    if (playing && video) Object.assign(data, createMediaTimestamps(video))
    if (!privacy && showButtons) data.buttons = [{ label: strings.viewTitle, url: href }]
    await presence.setActivity(data)
    return
  }

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const details =
    page.kind === "series" ? strings.viewingSeries
    : page.kind === "catalog" ? strings.browsingCatalog
    : page.kind === "search" ? strings.searching
    : page.kind === "schedule" ? strings.viewingSchedule
    : page.kind === "simulcast" ? strings.viewingSimulcast
    : page.kind === "movies" ? strings.browsingMovies
    : page.kind === "watchlist" ? strings.viewingWatchlist
    : strings.browsingAdn

  const data: PresenceData = {
    details,
    state: privacy ? undefined : page.kind === "series" ? page.title : page.kind === "catalog" ? page.name : undefined,
    largeImageKey: Assets.Logo,
    largeImageText: "ADN",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") data.smallImageKey = "search"
  await presence.setActivity(data)
})
