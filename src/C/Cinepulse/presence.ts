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
      "en-US": "When enabled, your Discord presence also shows when you browse Cinepulse (home, catalog) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Cinepulse (accueil, catalogue), pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Cinepulse (inicio, catálogo), no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Cinepulse durchsuchst (Startseite, Katalog) – nicht nur, wenn etwas abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Cinepulse (αρχική, κατάλογος) και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、Cinepulse（ホーム、カタログ）を閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 Cinepulse를 탐색(홈, 카탈로그)할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Cinepulse (laman utama, katalog), bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Cinepulse (strona główna, katalog), a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo Cinepulse (início, catálogo), não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, Cinepulse'ta (ana sayfa, katalog) gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

const getTitle = (): string =>
  document.title.replace(/^Cinepulse\s*[-–]\s*/, "").trim() || "Cinepulse"

const getSheetPoster = (): string | undefined =>
  document.querySelector<HTMLImageElement>("img[alt^='Poster']")?.src ?? undefined

const getPlayerPoster = (): string | undefined =>
  document.querySelector<HTMLImageElement>("[data-media-provider] img")?.src ?? undefined

// Find the episode info span (e.g. "S1:E1 - "Épisode 1"") in the player controls
const getEpisodeSpan = (): HTMLSpanElement | null => {
  for (const el of document.querySelectorAll<HTMLSpanElement>("[data-media-player] span")) {
    if (/^S\d+:E\d+/.test(el.textContent?.trim() ?? "")) return el
  }
  return null
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = location

  // Player page (/play/{token})
  if (pathname.startsWith("/play/")) {
    const video = document.querySelector<HTMLVideoElement>("video")
    const mediaPlayer = document.querySelector("[data-media-player]")
    const poster = getPlayerPoster()

    const episodeEl = getEpisodeSpan()
    // For series: the series title is the sibling just before the episode span
    const seriesTitleEl = episodeEl?.previousElementSibling as HTMLSpanElement | null
    const title = seriesTitleEl?.textContent?.trim() || getTitle()
    const episodeLabel = episodeEl?.textContent?.trim()

    const isPlaying = video
      ? !video.paused && !video.ended
      : !mediaPlayer?.hasAttribute("data-paused")

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: ctx.settings.showMediaTitle && title ? "Cinepulse" : title,
      state: episodeLabel,
      largeImageKey: poster || Assets.Logo,
      largeImageText: title,
      smallImageKey: isPlaying ? "play" : "pause",
      smallImageText: isPlaying ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }

    if (isPlaying && video) {
      Object.assign(data, createMediaTimestamps(video))
    }

    await presence.setActivity(data)
    return
  }

  // Sheet page (/sheet/movie-{id} or /sheet/tv-{id})
  const sheetMatch = pathname.match(/^\/sheet\/(movie|tv)-\d+/)
  if (sheetMatch) {
    const contentType = sheetMatch[1] as "movie" | "tv"
    const title = getTitle()
    const poster = getSheetPoster()

    await presence.setActivity({
      details: contentType === "movie" ? strings.viewingMovie : strings.viewingTvShow,
      state: title,
      largeImageKey: poster || Assets.Logo,
      largeImageText: title,
      type: PresenceType.Watching,
      buttons: [
        {
          label: contentType === "movie" ? strings.viewMovie : strings.viewTvShow,
          url: location.href,
        },
      ],
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: strings.browsingCinepulse,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
