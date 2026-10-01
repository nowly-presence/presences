import { PresenceType } from "@nowly/sdk"
import {
  getChessOpponent,
  getChessPageKind,
  getChessPageTitle,
  getChessProfileImage,
  getChessProfileName,
} from "./utils/page"
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
      "en-US": "Hide player names and profile details.",
      "fr-FR": "Masque les noms des joueurs et les détails des profils.",
      "es-ES": "Oculta los nombres de los jugadores y los detalles de perfil.",
      "de-DE": "Blendet Spielernamen und Profildetails aus.",
      "pt-BR": "Oculte nomes de jogadores e detalhes de perfil.",
      "pl-PL": "Ukrywa nazwy graczy i szczegóły profilu.",
      "ja-JP": "プレイヤー名とプロフィールの詳細を非表示にします。",
      "ko-KR": "플레이어 이름과 프로필 정보를 숨깁니다.",
      "tr-TR": "Oyuncu adlarını ve profil ayrıntılarını gizler.",
      "ms-MY": "Sembunyikan nama pemain dan butiran profil.",
      "el-GR": "Αποκρύπτει ονόματα παικτών και λεπτομέρειες προφίλ.",
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
      "pt-BR": "Mostrar atividade de navegação",
      "pl-PL": "Pokazuj aktywność przeglądania",
      "ja-JP": "閲覧アクティビティを表示",
      "ko-KR": "탐색 활동 표시",
      "tr-TR": "Gezinme etkinliğini göster",
      "ms-MY": "Tunjukkan aktiviti pelayaran",
      "el-GR": "Εμφάνιση δραστηριότητας περιήγησης",
    },
    description: {
      "en-US": "Show general Chess.com browsing when you're not playing or studying.",
      "fr-FR": "Affiche la navigation générale sur Chess.com lorsque vous ne jouez pas et n'étudiez pas.",
      "es-ES": "Muestra la navegación general por Chess.com cuando no estás jugando ni estudiando.",
      "de-DE": "Zeigt allgemeine Aktivitäten auf Chess.com, wenn du nicht spielst oder lernst.",
      "pt-BR": "Mostra a navegação geral no Chess.com quando você não estiver jogando ou estudando.",
      "pl-PL": "Pokazuje ogólne przeglądanie Chess.com, gdy nie grasz ani się nie uczysz.",
      "ja-JP": "対局や学習をしていないときにChess.comの閲覧状況を表示します。",
      "ko-KR": "대국이나 학습 중이 아닐 때 Chess.com 탐색 상태를 표시합니다.",
      "tr-TR": "Oynamadığın veya çalışmadığın zamanlarda genel Chess.com gezinmesini gösterir.",
      "ms-MY": "Paparkan aktiviti umum Chess.com apabila anda tidak bermain atau belajar.",
      "el-GR": "Εμφανίζει τη γενική περιήγηση στο Chess.com όταν δεν παίζεις ή μελετάς.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const privacy = ctx.settings.privacy
  const page = getChessPageKind(pathname)
  const title = getChessPageTitle()
  let details = strings.browsing
  let state: string | undefined
  let smallImageKey: string | undefined
  let smallImageText: string | undefined
  let largeImageKey = Assets.Logo

  if (page === "game") {
    details = strings.playingGame
    state = getChessOpponent()
    smallImageKey = "play"
    smallImageText = strings.playing
  } else if (page === "puzzle") {
    details = strings.solvingPuzzle
    smallImageKey = "search"
  } else if (page === "analysis") {
    details = strings.analyzingGame
    state = title
  } else if (page === "lesson") {
    details = strings.studyingChess
    state = title
  } else if (page === "profile") {
    details = strings.viewingProfile
    state = getChessProfileName()
    largeImageKey = getChessProfileImage() || Assets.Logo
  } else if (page === "watch") {
    details = strings.watching
  } else if (page === "events") {
    details = strings.events
  } else if (page === "tv") {
    details = strings.tv
  } else if (page === "streamers") {
    details = strings.streamers
  } else if (page === "settings") {
    details = strings.settings
  } else if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  if (privacy && page === "game") {
    state = undefined
    details = strings.playingGame
  } else if (privacy && page === "profile") {
    state = undefined
    largeImageKey = Assets.Logo
  }
  if (!privacy && page === "profile" && largeImageKey !== Assets.Logo) {
    smallImageKey = Assets.Logo
    smallImageText = "Chess.com"
  }

  await presence.setActivity({
    details,
    state,
    largeImageKey,
    largeImageText: privacy ? undefined : title,
    smallImageKey,
    smallImageText,
    type: page === "watch" || page === "tv" ? PresenceType.Watching : PresenceType.Playing,
    buttons: !privacy && (page === "game" || page === "profile")
      ? [{ label: strings.openPage, url: href.split("?")[0] }]
      : undefined,
  })
})
