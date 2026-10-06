import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
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
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "When enabled, your Discord presence also shows when you browse Cinepulse (home, catalog) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Cinepulse (accueil, catalogue), pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Cinepulse (inicio, catálogo), no solo al reproducir contenido.",
    },
  },
})

const presence = new Presence(settings)

const getTitle = (): string =>
  document.title.replace(/^Cinepulse\s*[-–]\s*/, "").trim() || "Cinepulse"

const getSheetPoster = (): string | undefined =>
  document.querySelector<HTMLImageElement>("img[alt^='Poster']")?.src ?? undefined

const getPlayerPoster = (): string | undefined =>
  document.querySelector<HTMLImageElement>("[data-media-provider] img")?.src ?? undefined

// Find the episode info span (e.g. "S1:E1 - "Épisode 1"") in the player controls
const getEpisodeSpan = (): HTMLSpanElement | null => {
  for (const el of document.querySelectorAll<HTMLSpanElement>("[data-media-player] span")) {
    if (/^S\d+:E\d+/.test(el.textContent?.trim() ?? "")) return el
  }
  return null
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = location

  // Player page (/play/{token})
  if (pathname.startsWith("/play/")) {
    const video = document.querySelector<HTMLVideoElement>("video")
    const mediaPlayer = document.querySelector("[data-media-player]")
    const poster = getPlayerPoster()

    const episodeEl = getEpisodeSpan()
    // For series: the series title is the sibling just before the episode span
    const seriesTitleEl = episodeEl?.previousElementSibling as HTMLSpanElement | null
    const title = seriesTitleEl?.textContent?.trim() || getTitle()
    const episodeLabel = episodeEl?.textContent?.trim()

    const isPlaying = video
      ? !video.paused && !video.ended
      : !mediaPlayer?.hasAttribute("data-paused")

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: title,
      state: episodeLabel,
      largeImageKey: poster || Assets.Logo,
      largeImageText: title,
      smallImageKey: isPlaying ? "play" : "pause",
      smallImageText: isPlaying ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }

    if (isPlaying && video) {
      Object.assign(data, createMediaTimestamps(video))
    }

    await presence.setActivity(data)
    return
  }

  // Sheet page (/sheet/movie-{id} or /sheet/tv-{id})
  const sheetMatch = pathname.match(/^\/sheet\/(movie|tv)-\d+/)
  if (sheetMatch) {
    const contentType = sheetMatch[1] as "movie" | "tv"
    const title = getTitle()
    const poster = getSheetPoster()

    await presence.setActivity({
      details: contentType === "movie" ? strings.viewingMovie : strings.viewingTvShow,
      state: title,
      largeImageKey: poster || Assets.Logo,
      largeImageText: title,
      type: PresenceType.Watching,
      buttons: [
        {
          label: contentType === "movie" ? strings.viewMovie : strings.viewTvShow,
          url: location.href,
        },
      ],
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: strings.browsingCinepulse,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
