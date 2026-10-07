import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import {
  findBanner,
  findDescription,
  findEpisodeInfo,
  findSeriesTitle,
  findTitleText,
  findVideo,
  isActivePlayer,
} from "./utils/player"
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
  hideThumbnail: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Hide movie or series thumbnail",
      "fr-FR": "Cacher la miniature du film ou de la série",
      "es-ES": "Ocultar la miniatura de la película o serie",
      "de-DE": "Miniaturbild des Films oder der Serie ausblenden",
      "el-GR": "Απόκρυψη μικρογραφίας ταινίας ή σειράς",
      "ja-JP": "映画またはシリーズのサムネイルを非表示",
      "ko-KR": "영화 또는 시리즈 썸네일 숨기기",
      "ms-MY": "Sembunyikan lakaran kecil filem atau siri",
      "pl-PL": "Ukryj miniaturę filmu lub serialu",
      "pt-BR": "Ocultar a miniatura do filme ou série",
      "tr-TR": "Film veya dizi küçük resmini gizle",
    },
    description: {
      "en-US": "When enabled, use the Prime Video logo instead of the movie or series thumbnail.",
      "fr-FR": "Lorsque cette option est activée, le logo Prime Video est utilisé à la place de la miniature du film ou de la série.",
      "es-ES": "Si está activada, se utiliza el logotipo de Prime Video en lugar de la miniatura de la película o serie.",
      "de-DE": "Wenn diese Option aktiviert ist, wird das Prime-Video-Logo anstelle des Miniaturbilds verwendet.",
      "el-GR": "Όταν είναι ενεργοποιημένο, χρησιμοποιείται το λογότυπο του Prime Video αντί για τη μικρογραφία.",
      "ja-JP": "有効にすると、映画またはシリーズのサムネイルの代わりにPrime Videoのロゴを使用します。",
      "ko-KR": "활성화하면 영화 또는 시리즈 썸네일 대신 Prime Video 로고를 사용합니다.",
      "ms-MY": "Apabila didayakan, logo Prime Video digunakan menggantikan lakaran kecil filem atau siri.",
      "pl-PL": "Po włączeniu tej opcji zamiast miniatury filmu lub serialu używane jest logo Prime Video.",
      "pt-BR": "Quando ativado, o logo do Prime Video é usado no lugar da miniatura do filme ou série.",
      "tr-TR": "Etkinleştirildiğinde film veya dizi küçük resmi yerine Prime Video logosu kullanılır.",
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
      "en-US": "When enabled, your Discord presence also shows when you browse Prime Video (home, search, categories) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Prime Video (accueil, recherche, catégories) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Prime Video (inicio, búsqueda, categorías), no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Prime Video durchsuchst (Startseite, Suche, Kategorien) – nicht nur, wenn etwas abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Prime Video (αρχική, αναζήτηση, κατηγορίες) και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、Prime Video（ホーム、検索、カテゴリー）を閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 Prime Video를 탐색(홈, 검색, 카테고리)할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Prime Video (laman utama, carian, kategori), bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Prime Video (strona główna, wyszukiwanie, kategorie), a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo Prime Video (início, busca, categorias), não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, Prime Video'da (ana sayfa, arama, kategoriler) gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = document.location
  const isOnDetailPage = pathname.includes("/detail/")

  if (isOnDetailPage) {
    const seriesTitle = findSeriesTitle()
    const episode = findEpisodeInfo()
    const titleText = seriesTitle || findTitleText()
    const video = findVideo()

    if (isActivePlayer(video) && titleText) {
      const bannerImg = findBanner()
      const description = findDescription()

      let state: string | undefined

      if (episode) {
        state = `S${episode.season}.E${episode.episode}`
        if (episode.episodeTitle) {
          state += ` ${episode.episodeTitle}`
        }
      } else {
        const desc = description && description !== titleText ? description : undefined
        state = desc
      }

      const data: Parameters<typeof presence.setActivity>[0] = {
        name: ctx.settings.showMediaTitle ? titleText ?? undefined : undefined,
        details: ctx.settings.showMediaTitle && titleText ? "Prime Video" : titleText ?? undefined,
        state,
        largeImageKey: ctx.settings.hideThumbnail ? Assets.Logo : bannerImg || Assets.Logo,
        largeImageText: titleText ?? undefined,
        type: PresenceType.Watching,
      }

      if (video.paused) {
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

    if (titleText) {
      const bannerImg = findBanner()
      await presence.setActivity({
        details: strings.viewingDetails,
        state: titleText,
        largeImageKey: ctx.settings.hideThumbnail ? Assets.Logo : bannerImg || Assets.Logo,
        largeImageText: titleText,
        type: PresenceType.Watching,
      })
      return
    }
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await handleBrowsingActivity(presence, pathname)
})
