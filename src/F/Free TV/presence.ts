import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { getLatestFreeTvEvent, installFreeTvBridge } from "./utils/bridge"
import { findVideo, getMode, getTitle, isVideoPlaying } from "./utils/dom"
import type enUS from "./locales/en-US.json"

installFreeTvBridge()

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
      "en-US": "When enabled, your Discord presence also shows when you browse Free TV - not only when a channel or movie is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Free TV, pas seulement pendant la lecture d'une chaîne ou d'un film.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Free TV, no solo al ver un canal o una película.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Free TV durchsuchst – nicht nur, wenn ein Sender oder Film läuft.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Free TV και όχι μόνο όταν αναπαράγεται κάποιο κανάλι ή κάποια ταινία.",
      "ja-JP": "有効にすると、チャンネルや映画を再生しているときだけでなく、Free TVを閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 채널이나 영화를 재생 중일 때뿐만 아니라 Free TV를 탐색할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Free TV, bukan hanya apabila saluran atau filem sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Free TV, a nie tylko podczas oglądania kanału lub filmu.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo Free TV, não apenas quando um canal ou filme está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir kanal veya film oynatılırken değil, Free TV'de gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const mode = getMode(document.location.pathname)

  if (mode === "hidden") {
    presence.clearActivity()
    return
  }

  const strings = await presence.getStrings<typeof enUS>()

  if (mode === "live" || mode === "vod") {
    const video = findVideo()
    if (ctx.settings.hideOnPause && video?.paused) {
      presence.clearActivity()
      return
    }
    const event = getLatestFreeTvEvent()
    const fallbackTitle = getTitle()
    const mediaTitle = event.programName || fallbackTitle || event.channelName || undefined
    const mediaTitleInHeader = Boolean(ctx.settings.showMediaTitle && mediaTitle)

    const state = mode === "live"
      ? (event.channelName && event.programName
        ? presence.formatString(strings.liveState, { channel: event.channelName, program: event.programName })
        : event.channelName || event.programName || fallbackTitle)
      : (event.programName || fallbackTitle)

    await presence.setActivity({
      name: mediaTitleInHeader ? mediaTitle : undefined,
      details: mode === "live" ? strings.watchingLive : strings.watchingVod,
      state,
      largeImageKey: Assets.Logo,
      largeImageText: "Free TV",
      smallImageKey: ctx.settings.showPlaybackState !== false && video ? video.paused ? "pause" : "play" : undefined,
      statusDisplayType: ctx.settings.statusDisplayType === "details" ? 2
        : ctx.settings.statusDisplayType === "state" && state ? 1 : 0,
      type: PresenceType.Watching,
      ...(isVideoPlaying(video) ? createMediaTimestamps(video!) : {}),
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  const browsingDetails: Record<string, string> = {
    home: strings.browsingHome,
    channels: strings.browsingChannels,
    vodHub: strings.browsingVodHub,
    tvGuide: strings.browsingTvGuide,
    myList: strings.browsingMyList,
    detail: strings.viewingDetail,
  }

  await presence.setActivity({
    details: browsingDetails[mode] ?? strings.browsingHome,
    largeImageKey: Assets.Logo,
    largeImageText: "Free TV",
    smallImageKey: Assets.Icon,
    type: PresenceType.Watching,
  })
})
