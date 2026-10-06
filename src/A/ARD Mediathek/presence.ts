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
      "de-DE": "Browsing-Aktivität anzeigen",
    },
    description: {
      "en-US": "When enabled, your Discord presence also shows when you browse ARD Mediathek, not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez ARD Mediathek, pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar ARD Mediathek, no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Presence auch deine Aktivitäten in der ARD Mediathek an und nicht nur laufende Wiedergaben.",
    },
  },
})

const presence = new Presence(settings)
let currentUrl = document.location.href

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { href, pathname } = document.location
  const path = pathname.replace(/\/?$/, "/")

  if (href !== currentUrl) currentUrl = href

  if (!path.startsWith("/video/") && !path.startsWith("/live/")) {
    if (!ctx.settings.showBrowsing) {
      presence.clearActivity()
      return
    }

    await presence.setActivity({
      details: strings.browsing,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  const video = document.querySelector<HTMLVideoElement>(".ardplayer-mediacanvas, video")
  const title = document.querySelector<HTMLElement>("h1")?.textContent?.trim()
    || document.title.replace(/\s*\|\s*ARD-Mediathek.*$/i, "").replace(/\s*Livestream national.*$/i, "").trim()
  const metadata = document.querySelector<HTMLElement>(".Line-epbftj-1")?.textContent?.trim()
  const isLive = path.startsWith("/live/")

  if (!title) {
    presence.clearActivity()
    return
  }

  const data: Parameters<typeof presence.setActivity>[0] = {
    name: ctx.settings.showMediaTitle ? title : undefined,
    details: title,
    state: metadata,
    largeImageKey: Assets.Logo,
    largeImageText: "ARD Mediathek",
    type: PresenceType.Watching,
    buttons: [{
      label: isLive ? strings.watchStream : strings.watchVideo,
      url: currentUrl,
    }],
  }

  if (isLive) {
    data.smallImageKey = "play"
    data.smallImageText = strings.live
  } else if (video?.paused) {
    data.smallImageKey = "pause"
    data.smallImageText = strings.paused
  } else {
    data.smallImageKey = "play"
    data.smallImageText = strings.playing
    if (video) Object.assign(data, createMediaTimestamps(video))
  }

  await presence.setActivity(data)
})
