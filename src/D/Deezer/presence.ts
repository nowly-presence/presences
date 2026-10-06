import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getMediaElement, getMediaSessionTrack, toDiscordImage } from "./utils/track"
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
      "en-US": "Hide the track title, artist, artwork, and buttons.",
      "fr-FR": "Masque le titre, l'artiste, la pochette et les boutons.",
      "es-ES": "Oculta el título, artista, portada y botones.",
      "de-DE": "Tracktitel, Künstler, Cover und Schaltflächen ausblenden.",
      "el-GR": "Απόκρυψη τίτλου κομματιού, καλλιτέχνη, εξωφύλλου και κουμπιών.",
      "ja-JP": "曲名、アーティスト、アートワーク、ボタンを非表示にします。",
      "ko-KR": "트랙 제목, 아티스트, 아트워크 및 버튼을 숨깁니다.",
      "ms-MY": "Sembunyikan tajuk lagu, artis, karya seni dan butang.",
      "pl-PL": "Ukryj tytuł utworu, wykonawcę, okładkę i przyciski.",
      "pt-BR": "Ocultar o título da faixa, o artista, a capa e os botões.",
      "tr-TR": "Parça adını, sanatçıyı, kapak görselini ve düğmeleri gizle.",
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
      "en-US": "Show activity while you browse Deezer with no track detected.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez Deezer sans titre détecté.",
      "es-ES": "Muestra actividad al explorar Deezer sin una canción detectada.",
      "de-DE": "Aktivität beim Durchsuchen von Deezer anzeigen, wenn kein Track erkannt wird.",
      "el-GR": "Εμφάνιση δραστηριότητας κατά την περιήγηση στο Deezer όταν δεν εντοπίζεται κάποιο κομμάτι.",
      "ja-JP": "曲が検出されていない状態でDeezerを閲覧している間もアクティビティを表示します。",
      "ko-KR": "감지된 트랙 없이 Deezer를 탐색하는 동안 활동을 표시합니다.",
      "ms-MY": "Tunjukkan aktiviti semasa anda melayari Deezer apabila tiada lagu dikesan.",
      "pl-PL": "Pokazuj aktywność podczas przeglądania Deezer, gdy nie wykryto żadnego utworu.",
      "pt-BR": "Mostrar atividade enquanto você navega pelo Deezer sem nenhuma faixa detectada.",
      "tr-TR": "Herhangi bir parça algılanmadan Deezer'da gezinirken etkinliği göster.",
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

const browsingPath = (pathname: string): string => {
  const parts = pathname.split("/").filter(Boolean)
  if (parts[0] && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(parts[0])) return `/${parts.slice(1).join("/")}`
  return pathname
}

const browsingDetails = (pathname: string, strings: typeof enUS): string => {
  const path = browsingPath(pathname)
  if (path.startsWith("/search")) return strings.searching
  if (path.startsWith("/playlist")) return strings.viewingPlaylist
  if (path.startsWith("/album")) return strings.viewingAlbum
  if (path.startsWith("/artist")) return strings.viewingArtist
  if (path.startsWith("/show")) return strings.viewingPodcast
  if (path.startsWith("/channels")) return strings.browsingChannels
  return strings.browsingDeezer
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const media = getMediaElement()
  const track = getMediaSessionTrack(document.location.href.split("?")[0] ?? document.location.href)

  if (track) {
    const playing = media ? !media.paused : track.playing
    const data: PresenceData = {
      name: !privacy && ctx.settings.showMediaTitle ? track.title : undefined,
      details: privacy ? strings.listeningToMusic : track.title,
      state: privacy ? undefined : track.artist,
      largeImageKey: privacy ? Assets.Logo : toDiscordImage(track.artwork) ?? Assets.Logo,
      largeImageText: privacy ? "Deezer" : track.title,
      smallImageKey: playing ? "play" : "pause",
      smallImageText: playing ? strings.playing : strings.paused,
      type: PresenceType.Listening,
    }

    if (playing && media) Object.assign(data, createMediaTimestamps(media))

    if (!privacy && showButtons) {
      data.buttons = [{ label: strings.listen, url: track.url }]
    }

    await presence.setActivity(data)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: browsingDetails(document.location.pathname, strings),
    largeImageKey: Assets.Logo,
    largeImageText: "Deezer",
    type: PresenceType.Listening,
  })
})
