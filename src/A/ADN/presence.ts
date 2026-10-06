import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getAdnPage, getEpisodeCover, getVideo, getWatchInfo } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
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
      "en-US": "Show activity on leftover ADN pages.",
      "fr-FR": "Affiche l'activité sur les autres pages ADN.",
      "es-ES": "Muestra actividad en las demás páginas de ADN.",
      "de-DE": "Aktivität auf sonstigen ADN-Seiten anzeigen.",
      "el-GR": "Εμφάνιση δραστηριότητας στις υπόλοιπες σελίδες του ADN.",
      "ja-JP": "その他のADNページでのアクティビティを表示します。",
      "ko-KR": "기타 ADN 페이지에서 활동을 표시합니다.",
      "ms-MY": "Tunjukkan aktiviti pada halaman ADN lain.",
      "pl-PL": "Pokazuj aktywność na pozostałych stronach ADN.",
      "pt-BR": "Mostrar atividade nas demais páginas da ADN.",
      "tr-TR": "Diğer ADN sayfalarındaki etkinliği göster.",
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
  const page = getAdnPage()
  const video = getVideo()
  const href = document.location.href.split("?")[0] ?? document.location.href
  const watching = page.kind === "watch" || Boolean(video && video.duration > 0)

  if (watching) {
    const playing = video ? !video.paused && !video.ended : true
    const info = getWatchInfo()
    const title = "title" in page ? page.title : undefined
    const seasonEpisode =
      info.season !== undefined && info.episodeNumber !== undefined
        ? presence.formatString(strings.seasonEpisode, { season: info.season, episode: info.episodeNumber })
        : undefined
    const data: PresenceData = {
      name: !privacy && ctx.settings.showMediaTitle ? info.series || title : undefined,
      details: privacy ? strings.watching : info.series || title || strings.watching,
      state: privacy ? undefined : info.episode ?? seasonEpisode,
      largeImageKey: (!privacy && getEpisodeCover()) || Assets.Logo,
      largeImageText: seasonEpisode ?? "ADN",
      smallImageKey: playing ? "play" : "pause",
      smallImageText: playing ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }
    if (playing && video) Object.assign(data, createMediaTimestamps(video))
    if (!privacy && showButtons) {
      data.buttons = [
        { label: strings.watchEpisode, url: href },
        ...(info.seriesUrl ? [{ label: strings.viewSeries, url: info.seriesUrl }] : []),
      ]
    }
    await presence.setActivity(data)
    return
  }

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const details =
    page.kind === "series" ? strings.viewingSeries
    : page.kind === "catalog" ? strings.browsingCatalog
    : page.kind === "search" ? strings.searching
    : page.kind === "schedule" ? strings.viewingSchedule
    : page.kind === "simulcast" ? strings.viewingSimulcast
    : page.kind === "movies" ? strings.browsingMovies
    : page.kind === "watchlist" ? strings.viewingWatchlist
    : strings.browsingAdn

  const data: PresenceData = {
    details,
    state: privacy ? undefined : page.kind === "series" ? page.title : page.kind === "catalog" ? page.name : undefined,
    largeImageKey: Assets.Logo,
    largeImageText: "ADN",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") data.smallImageKey = "search"
  await presence.setActivity(data)
})
