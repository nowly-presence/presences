import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { getPinterestPage } from "./utils/page"
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
      "pt-BR": "Modo de privacidade",
      "pl-PL": "Tryb prywatny",
      "ja-JP": "プライバシーモード",
      "ko-KR": "개인정보 보호 모드",
      "tr-TR": "Gizlilik modu",
      "ms-MY": "Mod privasi",
      "el-GR": "Λειτουργία απορρήτου",
    },
    description: {
      "en-US": "Hide pin descriptions, profile names, and page details.",
      "fr-FR": "Masque les descriptions d'épingles, les noms de profil et les détails des pages.",
      "es-ES": "Oculta descripciones de pins, nombres de perfiles y detalles de páginas.",
      "de-DE": "Blendet Pin-Beschreibungen, Profilnamen und Seitendetails aus.",
      "pt-BR": "Oculte descrições de Pins, nomes de perfis e detalhes das páginas.",
      "pl-PL": "Ukrywa opisy Pinów, nazwy profili i szczegóły stron.",
      "ja-JP": "ピンの説明、プロフィール名、ページの詳細を非表示にします。",
      "ko-KR": "핀 설명, 프로필 이름 및 페이지 세부 정보를 숨깁니다.",
      "tr-TR": "Pin açıklamalarını, profil adlarını ve sayfa ayrıntılarını gizler.",
      "ms-MY": "Sembunyikan penerangan Pin, nama profil dan butiran halaman.",
      "el-GR": "Αποκρύπτει περιγραφές Pin, ονόματα προφίλ και λεπτομέρειες σελίδας.",
    },
  },
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show page buttons",
      "fr-FR": "Afficher les boutons de page",
      "es-ES": "Mostrar botones de página",
      "de-DE": "Seitenschaltflächen anzeigen",
      "pt-BR": "Mostrar botões da página",
      "pl-PL": "Pokazuj przyciski stron",
      "ja-JP": "ページボタンを表示",
      "ko-KR": "페이지 버튼 표시",
      "tr-TR": "Sayfa düğmelerini göster",
      "ms-MY": "Tunjukkan butang halaman",
      "el-GR": "Εμφάνιση κουμπιών σελίδας",
    },
    description: {
      "en-US": "Add buttons to open the pin or profile you're viewing.",
      "fr-FR": "Ajoute des boutons pour ouvrir l'épingle ou le profil consulté.",
      "es-ES": "Añade botones para abrir el pin o perfil que estás viendo.",
      "de-DE": "Fügt Schaltflächen hinzu, um den Pin oder das Profil zu öffnen.",
      "pt-BR": "Adiciona botões para abrir o Pin ou perfil visualizado.",
      "pl-PL": "Dodaje przyciski otwierające oglądany Pin lub profil.",
      "ja-JP": "閲覧中のピンやプロフィールを開くボタンを追加します。",
      "ko-KR": "보고 있는 핀이나 프로필을 여는 버튼을 추가합니다.",
      "tr-TR": "Görüntülediğin Pin'i veya profili açmak için düğmeler ekler.",
      "ms-MY": "Tambah butang untuk membuka Pin atau profil yang anda lihat.",
      "el-GR": "Προσθέτει κουμπιά για άνοιγμα του Pin ή του προφίλ που βλέπεις.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const page = getPinterestPage(pathname, href, strings)
  const privacy = ctx.settings.privacy
  const showButtons = ctx.settings.showButtons
  const data: Parameters<typeof presence.setActivity>[0] = {
    details: privacy && page.kind !== "general" ? strings.privateBrowsing : page.details,
    state: privacy ? undefined : page.state,
    largeImageKey: Assets.Logo,
    type: page.kind === "videoPin" ? PresenceType.Watching : PresenceType.Playing,
  }

  if (page.video && !Number.isNaN(page.video.duration)) {
    if (page.video.paused) {
      data.smallImageKey = "pause"
      data.smallImageText = strings.paused
    } else {
      data.smallImageKey = "play"
      data.smallImageText = strings.playing
      Object.assign(data, createMediaTimestamps(page.video))
    }
  }

  if (!privacy && showButtons && (page.kind === "pin" || page.kind === "videoPin")) {
    data.buttons = [{ label: strings.watchPin, url: href.split("?")[0] }]
    if (page.profileUrl) data.buttons.push({ label: strings.viewProfile, url: page.profileUrl })
  } else if (!privacy && showButtons && page.kind === "profile" && page.profileUrl) {
    data.buttons = [{ label: strings.viewProfile, url: page.profileUrl }]
  }

  await presence.setActivity(data)
})
