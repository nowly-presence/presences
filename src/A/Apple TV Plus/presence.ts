import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { $, findVideo, hasPlayerTabs, text } from "./utils/dom"
import { getPageDescription, getPageTitle, getThumbnail, parseSubtitle } from "./utils/metadata"
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
      "en-US": "When enabled, your Discord presence also shows when you browse Apple TV+ (home, search) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Apple TV+ (accueil, recherche) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Apple TV+ (inicio, búsqueda), no solo al reproducir contenido.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const video = findVideo()
  const playing = video && hasPlayerTabs()

  if (video && playing) {
    const title = text($(".video-metadata .title"))
    const subtitle = text($(".video-metadata .subtitle-text"))
    const genre = text($(".metadata-genre"))
    const thumbnail = getThumbnail()
    const isPaused = !!video.paused

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? title : undefined,
      largeImageKey: thumbnail || Assets.Logo,
      largeImageText: title || "Apple TV+",
      type: PresenceType.Watching,
      buttons: [{
        label: subtitle ? strings.watchEpisode : strings.watchShow,
        url: href,
      }],
    }

    if (subtitle) {
      const { seasonNum, episodeNum, episodeTitle } = parseSubtitle(subtitle)
      data.details = title || "Apple TV+"
      if (episodeTitle) {
        data.state = `S${seasonNum}:E${episodeNum} ${episodeTitle}`
      } else if (Number.isFinite(seasonNum) && Number.isFinite(episodeNum)) {
        data.state = presence.formatString(strings.seasonEpisode, { season: seasonNum!, episode: episodeNum! })
      } else {
        data.state = subtitle
      }
    } else {
      data.details = title || getPageTitle() || "Apple TV+"
      data.state = genre || strings.movie
    }

    if (isPaused) {
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

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  if (pathname === "/" || pathname.startsWith("/home")) {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/search")) {
    const query = new URLSearchParams(document.location.search).get("q")
    await presence.setActivity({
      details: strings.searching,
      state: query ? `"${query}"` : undefined,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/show/")) {
    const pageTitle = getPageTitle()
    await presence.setActivity({
      details: pageTitle || strings.viewingSeries,
      state: pageTitle ? undefined : getPageDescription(),
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/room/")) {
    await presence.setActivity({
      details: strings.sharePlayRoom,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  await presence.setActivity({
    details: strings.browsing,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
