import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getCrunchyrollPage, getEpisodeCover, getSeriesUrl, getVideo, getWatchInfo } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showMediaTitle: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show media title in activity name",
      "fr-FR": "Afficher le titre du média dans le nom de l'activité",
      "es-ES": "Mostrar el título del contenido en el nombre de la actividad",
      "de-DE": "Medientitel als Aktivitätsnamen anzeigen",
      "el-GR": "Εμφάνιση τίτλου πολυμέσου στο όνομα δραστηριότητας",
      "ja-JP": "アクティビティ名にメディアタイトルを表示",
      "ko-KR": "활동 이름에 미디어 제목 표시",
      "ms-MY": "Paparkan tajuk media sebagai nama aktiviti",
      "pl-PL": "Pokazuj tytuł materiału jako nazwę aktywności",
      "pt-BR": "Mostrar o título da mídia no nome da atividade",
      "tr-TR": "Etkinlik adında medya başlığını göster",
    },
    description: {
      "en-US": "When enabled, use the current media title as the Discord activity name instead of the service name.",
      "fr-FR": "Lorsque cette option est activée, le titre du média en cours remplace le nom du service dans votre activité Discord.",
      "es-ES": "Si está activada, el título del contenido actual sustituye al nombre del servicio en tu actividad de Discord.",
      "de-DE": "Wenn diese Option aktiviert ist, ersetzt der aktuelle Medientitel den Dienstnamen in deiner Discord-Aktivität.",
      "el-GR": "Όταν είναι ενεργό, ο τρέχων τίτλος πολυμέσου αντικαθιστά το όνομα της υπηρεσίας στη δραστηριότητά σου στο Discord.",
      "ja-JP": "有効にすると、Discordのアクティビティ名にサービス名の代わりに再生中のメディアタイトルを表示します。",
      "ko-KR": "활성화하면 Discord 활동 이름에 서비스 이름 대신 현재 미디어 제목을 표시합니다.",
      "ms-MY": "Apabila diaktifkan, tajuk media semasa menggantikan nama perkhidmatan dalam aktiviti Discord anda.",
      "pl-PL": "Po włączeniu tytuł odtwarzanego materiału zastąpi nazwę usługi w Twojej aktywności Discord.",
      "pt-BR": "Quando ativado, o título da mídia atual substitui o nome do serviço na sua atividade do Discord.",
      "tr-TR": "Etkinleştirildiğinde, Discord etkinliğinde hizmet adı yerine oynatılan medyanın başlığı gösterilir.",
    },
  },
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
      name: !privacy && ctx.settings.showMediaTitle ? info.show || (page.kind === "watch" ? page.title : undefined) : undefined,
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
