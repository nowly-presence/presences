import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import {
  findVideo,
  isOnChannelPage,
  isOnClipPage,
  isOnHomePage,
  isOnVideoPage,
} from "./utils/dom"
import { findGame, findStreamerAvatar, findStreamerName, findStreamTitle } from "./utils/streamer"
import { getClipInfo, getVodTitle } from "./utils/vod"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showVods: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show VOD activity",
      "fr-FR": "Afficher l'activité VOD",
      "es-ES": "Mostrar actividad de VOD",
      "de-DE": "VOD-Aktivität anzeigen",
      "el-GR": "Εμφάνιση δραστηριότητας VOD",
      "ja-JP": "VODアクティビティを表示",
      "ko-KR": "VOD 활동 표시",
      "ms-MY": "Tunjukkan aktiviti VOD",
      "pl-PL": "Pokazuj aktywność VOD",
      "pt-BR": "Mostrar atividade de VOD",
      "tr-TR": "VOD etkinliğini göster",
    },
    description: {
      "en-US": "Show your Discord presence when you watch VODs or clips.",
      "fr-FR": "Affiche votre présence Discord lorsque vous regardez des VOD ou des clips.",
      "es-ES": "Muestra tu presencia de Discord al ver VODs o clips.",
      "de-DE": "Zeige deinen Discord-Status, wenn du VODs oder Clips ansiehst.",
      "el-GR": "Εμφάνιση της κατάστασής σας στο Discord όταν παρακολουθείτε VOD ή κλιπ.",
      "ja-JP": "VODやクリップの視聴時にDiscordのプレゼンスを表示します。",
      "ko-KR": "VOD 또는 클립을 시청할 때 Discord 활동을 표시합니다.",
      "ms-MY": "Tunjukkan presence Discord anda apabila anda menonton VOD atau klip.",
      "pl-PL": "Pokazuj swoją aktywność na Discordzie podczas oglądania VOD-ów lub klipów.",
      "pt-BR": "Mostrar sua presença no Discord quando você assistir a VODs ou clipes.",
      "tr-TR": "VOD veya klip izlerken Discord etkinliğini göster.",
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
      "el-GR": "Εμφάνιση δραστηριότητας περιήγησης",
      "ja-JP": "閲覧アクティビティを表示",
      "ko-KR": "탐색 활동 표시",
      "ms-MY": "Tunjukkan aktiviti pelayaran",
      "pl-PL": "Pokazuj aktywność przeglądania",
      "pt-BR": "Mostrar atividade de navegação",
      "tr-TR": "Gezinme etkinliğini göster",
    },
    description: {
      "en-US": "When enabled, your Discord presence also shows when you browse Twitch (directory, channels) - not only when a stream or video is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Twitch (répertoire, chaînes) - pas seulement pendant un live ou une vidéo.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Twitch (directorio, canales), no solo al ver un directo o un vídeo.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Twitch durchsuchst (Verzeichnis, Kanäle) – nicht nur, wenn ein Stream oder Video abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Twitch (κατάλογος, κανάλια) και όχι μόνο όταν αναπαράγεται κάποια μετάδοση ή κάποιο βίντεο.",
      "ja-JP": "有効にすると、配信や動画を再生しているときだけでなく、Twitch（ディレクトリ、チャンネル）を閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 스트림이나 동영상을 재생 중일 때뿐만 아니라 Twitch를 탐색(디렉터리, 채널)할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Twitch (direktori, saluran), bukan hanya apabila strim atau video sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Twitcha (katalog, kanały), a nie tylko podczas odtwarzania transmisji lub filmu.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pela Twitch (diretório, canais), não apenas quando uma transmissão ou um vídeo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir yayın veya video oynatılırken değil, Twitch'te (dizin, kanallar) gezinirken de gösterilir.",
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
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const video = findVideo()
  const { pathname } = document.location

  const isOnVideo = isOnVideoPage()
  const isClip = isOnClipPage()
  const isHome = isOnHomePage()

  if (isHome) {
    if (!ctx.settings.showBrowsing) {
      presence.clearActivity()
      return
    }

    await presence.setActivity({
      details: strings.viewingHomepage,
      largeImageKey: Assets.Logo,
      largeImageText: "Twitch",
      type: PresenceType.Watching,
    })
    return
  }

  const isLive =
    isOnChannelPage() &&
    !isOnVideo &&
    !isClip &&
    video &&
    video.duration >= 1073741824 &&
    Boolean(findStreamerName() || findStreamTitle())

  if (isLive) {
    const title = findStreamTitle()
    const streamer = findStreamerName()
    const game = findGame()
    const avatar = findStreamerAvatar(streamer)

    await presence.setActivity({
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: title || strings.live,
      state: streamer ? `${streamer}${game ? ` - ${game}` : ""}` : game,
      largeImageKey: avatar || Assets.Logo,
      largeImageText: streamer || "Twitch",
      type: PresenceType.Watching,
      buttons: [{ label: strings.watchStream, url: window.location.href.split("?")[0] }],
    })
    return
  }

  if (isOnVideo) {
    if (!ctx.settings.showVods) {
      presence.clearActivity()
      return
    }

    const title = getVodTitle()
    const streamer = findStreamerName()
    const avatar = findStreamerAvatar(streamer)

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: title || strings.vod,
      state: streamer,
      largeImageKey: avatar || Assets.Logo,
      largeImageText: streamer || "Twitch",
      smallImageKey: video?.paused ? "pause" : "play",
      smallImageText: video?.paused ? strings.paused : strings.playing,
      type: PresenceType.Watching,
      buttons: [{ label: strings.watchVideo, url: window.location.href.split("?")[0] }],
    }

    if (video && !video.paused) Object.assign(data, createMediaTimestamps(video))

    await presence.setActivity(data)
    return
  }

  if (isClip) {
    if (!ctx.settings.showVods) {
      presence.clearActivity()
      return
    }

    const { title, creator } = getClipInfo()
    const avatar = findStreamerAvatar(creator)

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: title || strings.clip,
      state: creator,
      largeImageKey: avatar || Assets.Logo,
      largeImageText: creator || "Twitch Clip",
      smallImageKey: video?.paused ? "pause" : "play",
      smallImageText: video?.paused ? strings.paused : strings.playing,
      type: PresenceType.Watching,
      buttons: [{ label: strings.watchClip, url: window.location.href }],
    }

    if (video && !video.paused) Object.assign(data, createMediaTimestamps(video))

    await presence.setActivity(data)
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await handleBrowsingActivity(presence, pathname)
})
