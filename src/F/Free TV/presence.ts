import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { getLatestFreeTvEvent, installFreeTvBridge } from "./utils/bridge"
import { findVideo, getMode, getTitle, isVideoPlaying } from "./utils/dom"
import type enUS from "./locales/en-US.json"

installFreeTvBridge()

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
      "en-US": "When enabled, your Discord presence also shows when you browse Free TV - not only when a channel or movie is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Free TV, pas seulement pendant la lecture d'une chaîne ou d'un film.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Free TV, no solo al ver un canal o una película.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const mode = getMode(document.location.pathname)

  if (mode === "hidden") {
    presence.clearActivity()
    return
  }

  const strings = await presence.getStrings<typeof enUS>()

  if (mode === "live" || mode === "vod") {
    const event = getLatestFreeTvEvent()
    const fallbackTitle = getTitle()

    const state = mode === "live"
      ? (event.channelName && event.programName
        ? presence.formatString(strings.liveState, { channel: event.channelName, program: event.programName })
        : event.channelName || event.programName || fallbackTitle)
      : (event.programName || fallbackTitle)

    const video = findVideo()

    await presence.setActivity({
      name: ctx.settings.showMediaTitle ? event.programName || fallbackTitle || event.channelName || undefined : undefined,
      details: mode === "live" ? strings.watchingLive : strings.watchingVod,
      state,
      largeImageKey: Assets.Logo,
      largeImageText: "Free TV",
      smallImageKey: Assets.Icon,
      type: PresenceType.Watching,
      ...(isVideoPlaying(video) ? createMediaTimestamps(video!) : {}),
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  const browsingDetails: Record<string, string> = {
    home: strings.browsingHome,
    channels: strings.browsingChannels,
    vodHub: strings.browsingVodHub,
    tvGuide: strings.browsingTvGuide,
    myList: strings.browsingMyList,
    detail: strings.viewingDetail,
  }

  await presence.setActivity({
    details: browsingDetails[mode] ?? strings.browsingHome,
    largeImageKey: Assets.Logo,
    largeImageText: "Free TV",
    smallImageKey: Assets.Icon,
    type: PresenceType.Watching,
  })
})
