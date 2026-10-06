import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getCrunchyrollPage, getEpisodeCover, getSeriesUrl, getVideo, getWatchInfo } from "./utils/page"
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
  privacy: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Privacy mode",
      "fr-FR": "Mode privé",
      "es-ES": "Modo privado",
      "de-DE": "Datenschutzmodus",
      "el-GR": "Λειτουργία απορρήτου",
      "ja-JP": "プライバシーモード",
      "ko-KR": "개인정보 보호 모드",
      "ms-MY": "Mod privasi",
      "pl-PL": "Tryb prywatny",
      "pt-BR": "Modo de privacidade",
      "tr-TR": "Gizlilik modu",
    },
    description: {
      "en-US": "Hide the title you're watching.",
      "fr-FR": "Masque le titre que vous regardez.",
      "es-ES": "Oculta el título que estás viendo.",
      "de-DE": "Den Titel ausblenden, den du gerade ansiehst.",
      "el-GR": "Απόκρυψη του τίτλου που παρακολουθείτε.",
      "ja-JP": "視聴中のタイトルを非表示にします。",
      "ko-KR": "시청 중인 콘텐츠의 제목을 숨깁니다.",
      "ms-MY": "Sembunyikan tajuk yang sedang anda tonton.",
      "pl-PL": "Ukryj oglądany tytuł.",
      "pt-BR": "Ocultar o título que você está assistindo.",
      "tr-TR": "İzlediğin içeriğin adını gizle.",
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
      "en-US": "Show activity on leftover Crunchyroll pages.",
      "fr-FR": "Affiche l'activité sur les autres pages Crunchyroll.",
      "es-ES": "Muestra actividad en las demás páginas de Crunchyroll.",
      "de-DE": "Aktivität auf sonstigen Crunchyroll-Seiten anzeigen.",
      "el-GR": "Εμφάνιση δραστηριότητας στις υπόλοιπες σελίδες του Crunchyroll.",
      "ja-JP": "その他のCrunchyrollページでのアクティビティを表示します。",
      "ko-KR": "기타 Crunchyroll 페이지에서 활동을 표시합니다.",
      "ms-MY": "Tunjukkan aktiviti pada halaman Crunchyroll lain.",
      "pl-PL": "Pokazuj aktywność na pozostałych stronach Crunchyroll.",
      "pt-BR": "Mostrar atividade nas demais páginas da Crunchyroll.",
      "tr-TR": "Diğer Crunchyroll sayfalarındaki etkinliği göster.",
    },
  },
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show buttons",
      "fr-FR": "Afficher les boutons",
      "es-ES": "Mostrar botones",
      "de-DE": "Schaltflächen anzeigen",
      "el-GR": "Εμφάνιση κουμπιών",
      "ja-JP": "ボタンを表示",
      "ko-KR": "버튼 표시",
      "ms-MY": "Tunjukkan butang",
      "pl-PL": "Pokazuj przyciski",
      "pt-BR": "Mostrar botões",
      "tr-TR": "Düğmeleri göster",
    },
    description: {
      "en-US": "Show a button to open the current page.",
      "fr-FR": "Affiche un bouton pour ouvrir la page en cours.",
      "es-ES": "Muestra un botón para abrir la página actual.",
      "de-DE": "Eine Schaltfläche zum Öffnen der aktuellen Seite anzeigen.",
      "el-GR": "Εμφάνιση κουμπιού για άνοιγμα της τρέχουσας σελίδας.",
      "ja-JP": "現在のページを開くボタンを表示します。",
      "ko-KR": "현재 페이지를 여는 버튼을 표시합니다.",
      "ms-MY": "Tunjukkan butang untuk membuka halaman semasa.",
      "pl-PL": "Pokaż przycisk otwierający bieżącą stronę.",
      "pt-BR": "Mostrar um botão para abrir a página atual.",
      "tr-TR": "Geçerli sayfayı açmak için bir düğme göster.",
    },
  },
})

const presence = new Presence(settings)
const isEnabled = (value: unknown): boolean => value === true || value === "true"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const page = getCrunchyrollPage()
  const video = getVideo()
  const href = document.location.href.split("?")[0] ?? document.location.href
  const watching = page.kind === "watch" || Boolean(video && video.duration > 0)

  if (watching) {
    const playing = video ? !video.paused && !video.ended : true
    const info = getWatchInfo()
    const seasonEpisode =
      info.season !== undefined && info.episodeNumber !== undefined
        ? presence.formatString(strings.seasonEpisode, { season: info.season, episode: info.episodeNumber })
        : undefined
    const mediaTitle = info.show || (page.kind === "watch" ? page.title : undefined)
    const mediaTitleInHeader = Boolean(!privacy && ctx.settings.showMediaTitle && mediaTitle)
    const data: PresenceData = {
      name: mediaTitleInHeader ? mediaTitle : undefined,
      details: privacy ? strings.watching : mediaTitleInHeader ? "Crunchyroll" : mediaTitle || strings.watching,
      state: privacy ? undefined : info.episode,
      largeImageKey: (!privacy && getEpisodeCover()) || Assets.Logo,
      largeImageText: seasonEpisode ?? "Crunchyroll",
      smallImageKey: playing ? "play" : "pause",
      smallImageText: playing ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }
    if (playing && video) Object.assign(data, createMediaTimestamps(video))
    if (!privacy && showButtons) {
      const seriesUrl = getSeriesUrl()
      data.buttons = [
        { label: strings.watchEpisode, url: href },
        ...(seriesUrl ? [{ label: strings.viewSeries, url: seriesUrl }] : []),
      ]
    }
    await presence.setActivity(data)
    return
  }

  const details =
    page.kind === "series" ? strings.viewingSeries
    : page.kind === "manga" ? strings.readingManga
    : page.kind === "news" ? strings.readingNews
    : page.kind === "search" ? strings.searching
    : page.kind === "watchlist" ? strings.viewingWatchlist
    : page.kind === "history" ? strings.viewingHistory
    : page.kind === "calendar" ? strings.viewingCalendar
    : page.kind === "games" ? strings.browsingGames
    : page.kind === "music" ? strings.browsingMusic
    : page.kind === "home" ? strings.browsingCrunchyroll
    : strings.browsingCrunchyroll

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const data: PresenceData = {
    details,
    state: privacy ? undefined : page.kind === "series" || page.kind === "manga" || page.kind === "news" ? page.title : undefined,
    largeImageKey: Assets.Logo,
    largeImageText: "Crunchyroll",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") data.smallImageKey = "search"
  await presence.setActivity(data)
})
