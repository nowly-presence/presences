import { PresenceType, type PresenceData } from "@nowly/sdk"
import { toDiscordImage } from "./utils/proxy"
import { createProgressTimestamps, findPlayerBar, findVideo, getCurrentTrack } from "./utils/track"
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
      "en-US": "Show activity while you browse YouTube Music with no track detected.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez YouTube Music sans titre détecté.",
      "es-ES": "Muestra actividad al explorar YouTube Music sin una canción detectada.",
      "de-DE": "Aktivität beim Durchsuchen von YouTube Music anzeigen, wenn kein Track erkannt wird.",
      "el-GR": "Εμφάνιση δραστηριότητας κατά την περιήγηση στο YouTube Music όταν δεν εντοπίζεται κομμάτι.",
      "ja-JP": "トラックが検出されていない状態でYouTube Musicを閲覧しているときもアクティビティを表示します。",
      "ko-KR": "감지된 트랙이 없을 때 YouTube Music을 탐색 중인 활동을 표시합니다.",
      "ms-MY": "Tunjukkan aktiviti semasa anda melayari YouTube Music apabila tiada lagu dikesan.",
      "pl-PL": "Pokazuj aktywność podczas przeglądania YouTube Music, gdy nie wykryto utworu.",
      "pt-BR": "Mostrar atividade enquanto você navega no YouTube Music sem nenhuma faixa detectada.",
      "tr-TR": "Parça algılanmadığında YouTube Music'te gezinirken etkinliği göster.",
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
      "en-US": "Show a button to open the current track.",
      "fr-FR": "Affiche un bouton pour ouvrir le titre en cours.",
      "es-ES": "Muestra un botón para abrir la canción actual.",
      "de-DE": "Eine Schaltfläche zum Öffnen des aktuellen Tracks anzeigen.",
      "el-GR": "Εμφάνιση κουμπιού για άνοιγμα του τρέχοντος κομματιού.",
      "ja-JP": "現在の曲を開くボタンを表示します。",
      "ko-KR": "현재 트랙을 여는 버튼을 표시합니다.",
      "ms-MY": "Tunjukkan butang untuk membuka lagu semasa.",
      "pl-PL": "Pokaż przycisk otwierający bieżący utwór.",
      "pt-BR": "Mostrar um botão para abrir a faixa atual.",
      "tr-TR": "Geçerli parçayı açmak için bir düğme göster.",
    },
  },
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

const browsingDetails = (pathname: string, strings: typeof enUS): string => {
  if (pathname === "/" || pathname === "/browse") return strings.browsingHome
  if (pathname.startsWith("/search")) return strings.searching
  if (pathname.startsWith("/playlist")) return strings.viewingPlaylist
  if (pathname.startsWith("/channel") || pathname.startsWith("/artist")) return strings.viewingArtist
  if (pathname.startsWith("/library")) return strings.browsingLibrary
  if (pathname.startsWith("/explore")) return strings.exploringMusic
  return strings.browsingYouTubeMusic
}

presence.on("UpdateData", async (ctx) => {
  try {
    const strings = await presence.getStrings<typeof enUS>()
    const privacy = isEnabled(ctx.settings.privacy)
    const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
    const showBrowsing = isEnabled(ctx.settings.showBrowsing)
    const playerBar = findPlayerBar()
    const video = findVideo()
    const track = getCurrentTrack(playerBar, video)

    if (track) {
      const mediaTitleInHeader = !privacy && isEnabled(ctx.settings.showMediaTitle)
      const data: PresenceData = {
        name: mediaTitleInHeader ? track.title : undefined,
        details: privacy ? strings.listeningToMusic : mediaTitleInHeader ? "YouTube Music" : track.title,
        state: privacy ? undefined : track.artist,
        largeImageKey: Assets.Logo,
        largeImageText: privacy ? "YouTube Music" : track.title,
        smallImageKey: track.playing ? "play" : "pause",
        smallImageText: track.playing ? strings.playing : strings.paused,
        type: PresenceType.Listening,
        ...createProgressTimestamps(video, track),
      }

      if (!privacy) {
        data.largeImageKey = toDiscordImage(track.artwork) ?? Assets.Logo
      }

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
      state: document.location.pathname.startsWith("/search")
        ? new URLSearchParams(document.location.search).get("q") ?? undefined
        : undefined,
      largeImageKey: Assets.Logo,
      largeImageText: "YouTube Music",
      type: PresenceType.Listening,
    })
  } catch (err) {
    presence.error(`YouTube Music presence error: ${err}`)
    await presence.setActivity({
      details: "YouTube Music",
      largeImageKey: Assets.Logo,
      type: PresenceType.Listening,
    })
  }
})
