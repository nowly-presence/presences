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
      name: ctx.settings.showMediaTitle ? title : undefined,
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
