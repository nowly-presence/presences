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
      "en-US": "When enabled, use the media title as the Discord activity name and show the service name where the title normally appears.",
      "fr-FR": "Lorsque cette option est activée, le titre du média devient le nom de l’activité Discord et le nom du service s’affiche à la place habituelle du titre.",
      "es-ES": "Si está activada, el título del contenido pasa a ser el nombre de la actividad de Discord y el nombre del servicio se muestra donde normalmente aparece el título.",
      "de-DE": "Wenn diese Option aktiviert ist, wird der Medientitel zum Namen der Discord-Aktivität und der Dienstname dort angezeigt, wo normalerweise der Titel steht.",
      "el-GR": "Όταν είναι ενεργοποιημένο, ο τίτλος του πολυμέσου γίνεται το όνομα της δραστηριότητας Discord και το όνομα της υπηρεσίας εμφανίζεται εκεί όπου εμφανίζεται συνήθως ο τίτλος.",
      "ja-JP": "有効にすると、メディアタイトルがDiscordのアクティビティ名になり、通常タイトルが表示される場所にサービス名が表示されます。",
      "ko-KR": "활성화하면 미디어 제목이 Discord 활동 이름이 되고, 원래 제목이 표시되던 위치에는 서비스 이름이 표시됩니다.",
      "ms-MY": "Apabila diaktifkan, tajuk media menjadi nama aktiviti Discord dan nama perkhidmatan dipaparkan di tempat tajuk biasanya muncul.",
      "pl-PL": "Po włączeniu tytuł materiału stanie się nazwą aktywności Discord, a nazwa usługi pojawi się w miejscu, w którym zwykle wyświetlany jest tytuł.",
      "pt-BR": "Quando ativado, o título da mídia se torna o nome da atividade do Discord, e o nome do serviço aparece onde o título normalmente seria exibido.",
      "tr-TR": "Etkinleştirildiğinde medya başlığı Discord etkinlik adı olur ve hizmet adı başlığın normalde göründüğü yerde gösterilir.",
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
      "en-US": "When enabled, your Discord presence also shows when you browse Free TV - not only when a channel or movie is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Free TV, pas seulement pendant la lecture d'une chaîne ou d'un film.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Free TV, no solo al ver un canal o una película.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Free TV durchsuchst – nicht nur, wenn ein Sender oder Film läuft.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Free TV και όχι μόνο όταν αναπαράγεται κάποιο κανάλι ή κάποια ταινία.",
      "ja-JP": "有効にすると、チャンネルや映画を再生しているときだけでなく、Free TVを閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 채널이나 영화를 재생 중일 때뿐만 아니라 Free TV를 탐색할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Free TV, bukan hanya apabila saluran atau filem sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Free TV, a nie tylko podczas oglądania kanału lub filmu.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo Free TV, não apenas quando um canal ou filme está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir kanal veya film oynatılırken değil, Free TV'de gezinirken de gösterilir.",
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
    const mediaTitle = event.programName || fallbackTitle || event.channelName || undefined
    const mediaTitleInHeader = Boolean(ctx.settings.showMediaTitle && mediaTitle)

    const state = mode === "live"
      ? (event.channelName && event.programName
        ? presence.formatString(strings.liveState, { channel: event.channelName, program: event.programName })
        : event.channelName || event.programName || fallbackTitle)
      : (event.programName || fallbackTitle)

    const video = findVideo()

    await presence.setActivity({
      name: mediaTitleInHeader ? mediaTitle : undefined,
      details: mode === "live" ? strings.watchingLive : strings.watchingVod,
      state: mediaTitleInHeader ? "Free TV" : state,
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
