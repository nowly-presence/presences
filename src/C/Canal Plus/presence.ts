import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import { findVideo, getPageMetadata, isLivePath } from "./utils/player"
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
      "en-US": "When enabled, your Discord presence also shows when you browse CANAL+ (home, search, cinema, series) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez CANAL+ (accueil, recherche, cinéma, séries) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar CANAL+ (inicio, búsqueda, cine, series), no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du CANAL+ durchsuchst (Startseite, Suche, Kino, Serien) – nicht nur, wenn etwas abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο CANAL+ (αρχική, αναζήτηση, κινηματογράφος, σειρές) και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、CANAL+（ホーム、検索、映画、シリーズ）を閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 CANAL+를 탐색(홈, 검색, 영화, 시리즈)할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari CANAL+ (laman utama, carian, pawagam, siri), bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania CANAL+ (strona główna, wyszukiwanie, kino, seriale), a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo CANAL+ (início, busca, cinema, séries), não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, CANAL+'ta (ana sayfa, arama, sinema, diziler) gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const video = findVideo()
  const live = isLivePath(pathname, video)
  const isProgrammePath = /\/h\/\d+/i.test(pathname)
  const isWatching = !!video && (isProgrammePath || live || video.duration > 0)

  if (isWatching && video) {
    const metadata = await getPageMetadata()

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? metadata.title : undefined,
      details: ctx.settings.showMediaTitle && metadata.title ? "CANAL+" : metadata.title || "CANAL+",
      state: live ? metadata.subtitle || strings.liveTv : metadata.subtitle,
      largeImageKey: metadata.image || Assets.Logo,
      largeImageText: metadata.title || "CANAL+",
      type: PresenceType.Watching,
      buttons: [{
        label: live ? strings.watchLive : strings.watchNow,
        url: href.split("?")[0] || href,
      }],
    }

    if (video.paused) {
      data.smallImageKey = "pause"
      data.smallImageText = strings.paused
    } else {
      data.smallImageKey = "play"
      data.smallImageText = strings.playing
      if (!live) Object.assign(data, createMediaTimestamps(video))
    }

    await presence.setActivity(data)
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await handleBrowsingActivity(presence, pathname)
})
