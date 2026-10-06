import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import {
  findBanner,
  findDescription,
  findEpisodeInfo,
  findSeriesTitle,
  findTitleText,
  findVideo,
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

    if (video && (seriesTitle || episode)) {
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
        details: titleText ?? undefined,
        state,
        largeImageKey: bannerImg || Assets.Logo,
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
        largeImageKey: bannerImg || Assets.Logo,
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
