import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { handleBrowsingActivity } from "./utils/browsing"
import {
  clearMetadata,
  fetchMetadata,
  findCurrentEpisode,
  getBoxart,
  getVideoId,
} from "./utils/metadata"
import { findVideo } from "./utils/player"
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
      "en-US": "When enabled, your Discord presence also shows when you browse Netflix (home, search, title pages) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Netflix (accueil, recherche, fiches) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Netflix (inicio, búsqueda, fichas), no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Netflix durchsuchst (Startseite, Suche, Titelseiten) – nicht nur, wenn etwas abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Netflix (αρχική, αναζήτηση, σελίδες τίτλων) και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、Netflix（ホーム、検索、作品ページ）を閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 Netflix를 탐색(홈, 검색, 콘텐츠 페이지)할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Netflix (laman utama, carian, halaman tajuk), bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Netflix (strona główna, wyszukiwanie, strony tytułów), a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pela Netflix (início, busca, páginas de títulos), não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, Netflix'te (ana sayfa, arama, içerik sayfaları) gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = document.location
  const href = window.location.href
  const id = getVideoId(href)

  // Watching a movie or episode.
  if (pathname.includes("/watch") && id) {
    const video = findVideo()

    if (video) {
      const meta = await fetchMetadata(id)
      const v = meta?.video
      const isEpisode = v?.type === "show"

      let state: string | undefined
      if (v?.type === "show") {
        const current = findCurrentEpisode(v)
        if (current) {
          const { season, episode } = current
          state = `S${season.seq}.E${episode.seq}`
          if (episode.title) state += ` ${episode.title}`
        }
      } else if (v?.type === "movie" && v.year) {
        state = String(v.year)
      }

      const data: Parameters<typeof presence.setActivity>[0] = {
        name: ctx.settings.showMediaTitle ? v?.title : undefined,
        details: v?.title || strings.watching,
        state,
        largeImageKey: await getBoxart(v) || Assets.Logo,
        largeImageText: v?.title || "Netflix",
        type: PresenceType.Watching,
        buttons: [{
          label: isEpisode ? strings.watchEpisode : strings.watchMovie,
          url: href.split("?")[0] || href,
        }],
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
  }

  if (!ctx.settings.showBrowsing) {
    clearMetadata()
    presence.clearActivity()
    return
  }

  // Viewing a title detail page (/title/{id} or ?jbv={id}).
  if (id) {
    const meta = await fetchMetadata(id)
    const v = meta?.video

    await presence.setActivity({
      details: v?.title || strings.watching,
      state: v?.synopsis?.slice(0, 128),
      largeImageKey: await getBoxart(v) || Assets.Logo,
      largeImageText: v?.title || "Netflix",
      smallImageKey: Assets.Logo,
      smallImageText: "Netflix",
      type: PresenceType.Watching,
      buttons: [{
        label: v?.type === "show" ? strings.viewSeries : strings.viewMovie,
        url: href,
      }],
    })
    return
  }

  await handleBrowsingActivity(presence, pathname)
})
