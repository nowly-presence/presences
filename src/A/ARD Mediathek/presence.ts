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
      "en-US": "When enabled, your Discord presence also shows when you browse ARD Mediathek, not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez ARD Mediathek, pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar ARD Mediathek, no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Presence auch deine Aktivitäten in der ARD Mediathek an und nicht nur laufende Wiedergaben.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο ARD Mediathek και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、ARD Mediathekを閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 ARD Mediathek를 탐색할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari ARD Mediathek, bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania ARD Mediathek, a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo ARD Mediathek, não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, ARD Mediathek'te gezinirken de gösterilir.",
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
    details: ctx.settings.showMediaTitle && title ? "ARD Mediathek" : title,
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
