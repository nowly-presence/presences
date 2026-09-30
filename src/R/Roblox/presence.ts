import { PresenceType } from "@nowly/sdk"
import { getRobloxPage } from "./utils/page"
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
      "en-US": "Hide profile, game, and group names from your activity.",
      "fr-FR": "Masque les noms des profils, jeux et groupes dans votre activité.",
      "es-ES": "Oculta los nombres de perfiles, juegos y grupos de tu actividad.",
      "de-DE": "Blendet Profil-, Spiel- und Gruppennamen in deiner Aktivität aus.",
      "pt-BR": "Oculte nomes de perfis, jogos e grupos da sua atividade.",
      "pl-PL": "Ukrywa nazwy profili, gier i grup w aktywności.",
      "ja-JP": "アクティビティからプロフィール、ゲーム、グループ名を非表示にします。",
      "ko-KR": "활동에서 프로필, 게임 및 그룹 이름을 숨깁니다.",
      "tr-TR": "Etkinliğinde profil, oyun ve grup adlarını gizler.",
      "ms-MY": "Sembunyikan nama profil, permainan dan kumpulan daripada aktiviti anda.",
      "el-GR": "Αποκρύπτει ονόματα προφίλ, παιχνιδιών και ομάδων από τη δραστηριότητά σου.",
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
      "en-US": "Show general Roblox pages when no specific page is detected.",
      "fr-FR": "Affiche les pages Roblox générales lorsqu'aucune page spécifique n'est détectée.",
      "es-ES": "Muestra páginas generales de Roblox cuando no se detecta una página específica.",
      "de-DE": "Zeigt allgemeine Roblox-Seiten an, wenn keine bestimmte Seite erkannt wird.",
      "pt-BR": "Mostra páginas gerais do Roblox quando nenhuma página específica é detectada.",
      "pl-PL": "Pokazuje ogólne strony Roblox, gdy nie wykryto konkretnej strony.",
      "ja-JP": "特定のページが検出されない場合にRobloxの一般ページを表示します。",
      "ko-KR": "특정 페이지가 감지되지 않을 때 일반 Roblox 페이지를 표시합니다.",
      "tr-TR": "Belirli bir sayfa algılanmadığında genel Roblox sayfalarını gösterir.",
      "ms-MY": "Paparkan halaman Roblox umum apabila tiada halaman khusus dikesan.",
      "el-GR": "Εμφανίζει γενικές σελίδες Roblox όταν δεν εντοπίζεται συγκεκριμένη σελίδα.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { hostname, pathname, href } = document.location
  const page = getRobloxPage(hostname, pathname, href, strings)
  const privacy = ctx.settings.privacy
  const showBrowsing = ctx.settings.showBrowsing

  if (!page.isSpecific && !showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: privacy ? strings.browsing : page.details,
    state: privacy ? undefined : page.state,
    largeImageKey: privacy ? Assets.Logo : page.image || Assets.Logo,
    largeImageText: privacy ? undefined : page.state,
    smallImageKey: page.isSearch && !privacy ? "search" : undefined,
    type: PresenceType.Playing,
    buttons: !privacy && page.buttonUrl
      ? [{ label: strings.openPage, url: page.buttonUrl }]
      : undefined,
  })
})
