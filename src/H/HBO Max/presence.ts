import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getHboMaxPage, getVideo } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  hideOnPause: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Hide presence when paused",
      "fr-FR": "Masquer la présence en pause",
      "es-ES": "Ocultar la presencia en pausa"
    },
    description: {
      "en-US": "Hide paused playback and show it again when playback resumes.",
      "fr-FR": "Masquer la lecture en pause et la réafficher à la reprise.",
      "es-ES": "Ocultar la reproducción en pausa y mostrarla al reanudarla."
    }
  },
  showPlaybackState: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show play/pause indicator",
      "fr-FR": "Afficher l'indicateur lecture/pause",
      "es-ES": "Mostrar el indicador de reproducción/pausa"
    },
    description: {
      "en-US": "Show the small play/pause icon and its tooltip.",
      "fr-FR": "Afficher la petite icône lecture/pause et son infobulle.",
      "es-ES": "Mostrar el pequeño icono de reproducción/pausa y su descripción."
    }
  },
  statusDisplayType: {
    type: "select",
    default: "name",
    label: {
      "en-US": "Compact Discord status",
      "fr-FR": "Statut Discord compact",
      "es-ES": "Estado compacto de Discord"
    },
    options: [
      {
        value: "name",
        label: {
          "en-US": "Activity name",
          "fr-FR": "Nom de l'activité",
          "es-ES": "Nombre de la actividad"
        }
      },
      {
        value: "details",
        label: {
          "en-US": "Title / details",
          "fr-FR": "Titre / détails",
          "es-ES": "Título / detalles"
        }
      },
      {
        value: "state",
        label: {
          "en-US": "Episode / channel / other info",
          "fr-FR": "Épisode / chaîne / autres infos",
          "es-ES": "Episodio / canal / otra información"
        }
      }
    ],
    description: {
      "en-US": "Choose the compact status text without changing the card. Missing fields fall back to the activity name. Requires a compatible extension and native host.",
      "fr-FR": "Choisir le texte du statut compact sans modifier la carte. Si le champ manque, utiliser le nom de l'activité. Nécessite une extension et un hôte natif compatibles.",
      "es-ES": "Elegir el texto del estado compacto sin cambiar la tarjeta. Si falta el campo, usar el nombre de la actividad. Requiere una extensión y un host nativo compatibles."
    }
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
      "en-US": "Use the media title as the activity name without removing it from the card.",
      "fr-FR": "Utiliser le titre comme nom d'activité sans le retirer de la carte.",
      "es-ES": "Usar el título como nombre de actividad sin quitarlo de la tarjeta.",
      "de-DE": "Den Titel als Aktivitätsnamen verwenden, ohne ihn aus der Karte zu entfernen.",
      "el-GR": "Χρήση του τίτλου ως ονόματος δραστηριότητας χωρίς αφαίρεσή του από την κάρτα.",
      "ja-JP": "カードにタイトルを残したまま、アクティビティ名にも使用します。",
      "ko-KR": "카드의 제목을 유지하면서 활동 이름으로 사용합니다.",
      "ms-MY": "Gunakan tajuk sebagai nama aktiviti tanpa membuangnya daripada kad.",
      "pl-PL": "Używaj tytułu jako nazwy aktywności, zachowując go na karcie.",
      "pt-BR": "Usar o título como nome da atividade sem removê-lo do cartão.",
      "tr-TR": "Başlığı karttan kaldırmadan etkinlik adı olarak kullan."
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
      "en-US": "Show activity on leftover HBO Max pages.",
      "fr-FR": "Affiche l'activité sur les autres pages HBO Max.",
      "es-ES": "Muestra actividad en las demás páginas de HBO Max.",
      "de-DE": "Aktivität auf sonstigen HBO Max-Seiten anzeigen.",
      "el-GR": "Εμφάνιση δραστηριότητας στις υπόλοιπες σελίδες του HBO Max.",
      "ja-JP": "その他のHBO Maxページでのアクティビティを表示します。",
      "ko-KR": "기타 HBO Max 페이지에서 활동을 표시합니다.",
      "ms-MY": "Tunjukkan aktiviti pada halaman HBO Max lain.",
      "pl-PL": "Pokazuj aktywność na pozostałych stronach HBO Max.",
      "pt-BR": "Mostrar atividade nas demais páginas da HBO Max.",
      "tr-TR": "Diğer HBO Max sayfalarındaki etkinliği göster.",
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
  const page = getHboMaxPage()
  const video = getVideo()
  const href = document.location.href.split("?")[0] ?? document.location.href
  const watching = page.kind === "watch" || Boolean(video && video.duration > 0)

  if (watching) {
    const playing = video ? !video.paused && !video.ended : true
    if (ctx.settings.hideOnPause && video?.paused) {
      presence.clearActivity()
      return
    }
    const title = page.kind === "watch" ? page.title : undefined
    const mediaTitleInHeader = Boolean(!privacy && ctx.settings.showMediaTitle && title)
    const data: PresenceData = {
      name: mediaTitleInHeader ? title : undefined,
      details: privacy ? strings.watching : title || strings.watching,
      largeImageKey: Assets.Logo,
      largeImageText: "HBO Max",
      smallImageKey: playing ? "play" : "pause",
      smallImageText: playing ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }
    if (playing && video) Object.assign(data, createMediaTimestamps(video))
    if (!privacy && showButtons) data.buttons = [{ label: strings.viewTitle, url: href }]
    if (ctx.settings.showPlaybackState === false) {
      delete data.smallImageKey
      delete data.smallImageText
    }
    data.statusDisplayType = ctx.settings.statusDisplayType === "details" ? 2 : 0
    await presence.setActivity(data)
    return
  }

  if (page.kind === "other" && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const details =
    page.kind === "show" ? strings.viewingShow
    : page.kind === "movie" ? strings.viewingMovie
    : page.kind === "search" ? strings.searching
    : page.kind === "myList" ? strings.viewingMyList
    : strings.browsingHboMax

  const data: PresenceData = {
    details,
    state: privacy ? undefined : "title" in page ? page.title : undefined,
    largeImageKey: Assets.Logo,
    largeImageText: "HBO Max",
    type: PresenceType.Watching,
  }
  if (page.kind === "search") data.smallImageKey = "search"
  await presence.setActivity(data)
})
