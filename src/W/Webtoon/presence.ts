import { PresenceType } from "@nowly/sdk"
import { getWebtoonPage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
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
      "en-US": "Show general WEBTOON browsing when no series or episode page is open.",
      "fr-FR": "Affiche la navigation générale sur WEBTOON lorsqu'aucune série ni aucun épisode n'est ouvert.",
      "es-ES": "Muestra la navegación general por WEBTOON cuando no hay ninguna serie o episodio abierto.",
      "de-DE": "Zeigt allgemeine Aktivitäten auf WEBTOON, wenn keine Serien- oder Episodenseite geöffnet ist.",
      "pt-BR": "Mostra a navegação geral no WEBTOON quando nenhuma série ou episódio estiver aberto.",
      "pl-PL": "Pokazuje ogólne przeglądanie WEBTOON, gdy nie jest otwarta strona serii ani odcinka.",
      "ja-JP": "シリーズまたはエピソードページを開いていないときにWEBTOONの閲覧状況を表示します。",
      "ko-KR": "시리즈나 에피소드 페이지가 열려 있지 않을 때 WEBTOON 탐색 상태를 표시합니다.",
      "tr-TR": "Bir seri veya bölüm sayfası açık değilken genel WEBTOON gezinmesini gösterir.",
      "ms-MY": "Paparkan aktiviti umum WEBTOON apabila tiada halaman siri atau episod dibuka.",
      "el-GR": "Εμφανίζει τη γενική περιήγηση στο WEBTOON όταν δεν είναι ανοιχτή σελίδα σειράς ή επεισοδίου.",
    },
  },
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show series button",
      "fr-FR": "Afficher le bouton de la série",
      "es-ES": "Mostrar botón de la serie",
    },
    description: {
      "en-US": "Add a button to open the WEBTOON series you're viewing.",
      "fr-FR": "Ajoute un bouton pour ouvrir la série WEBTOON consultée.",
      "es-ES": "Añade un botón para abrir la serie de WEBTOON que estás viendo.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = document.location
  const page = getWebtoonPage(pathname, strings)

  if (!page.isSpecific && !ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: page.details,
    state: page.state,
    largeImageKey: page.image || Assets.Logo,
    largeImageText: "WEBTOON",
    smallImageKey: page.image ? Assets.Logo : page.isSearch ? "search" : undefined,
    smallImageText: page.image ? "WEBTOON" : undefined,
    buttons: ctx.settings.showButtons && page.buttonUrl
      ? [{ label: strings.openWebtoon, url: page.buttonUrl }]
      : undefined,
  })
})
