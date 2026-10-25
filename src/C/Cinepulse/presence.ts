import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
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
      "en-US": "When enabled, your Discord presence also shows when you browse Cinepulse (home, catalog) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Cinepulse (accueil, catalogue), pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Cinepulse (inicio, catálogo), no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Cinepulse durchsuchst (Startseite, Katalog) – nicht nur, wenn etwas abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Cinepulse (αρχική, κατάλογος) και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、Cinepulse（ホーム、カタログ）を閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 Cinepulse를 탐색(홈, 카탈로그)할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Cinepulse (laman utama, katalog), bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Cinepulse (strona główna, katalog), a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo Cinepulse (início, catálogo), não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, Cinepulse'ta (ana sayfa, katalog) gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

const getTitle = (): string =>
  document.title.replace(/^Cinepulse\s*[-–]\s*/, "").trim() || "Cinepulse"

const getSheetPoster = (): string | undefined =>
  document.querySelector<HTMLImageElement>("img[alt^='Poster']")?.src ?? undefined

const getPlayerPoster = (): string | undefined =>
  document.querySelector<HTMLImageElement>("[data-media-provider] img")?.src ?? undefined

// Find the episode info span (e.g. "S1:E1 - "Épisode 1"") in the player controls
const getEpisodeSpan = (): HTMLSpanElement | null => {
  for (const el of document.querySelectorAll<HTMLSpanElement>("[data-media-player] span")) {
    if (/^S\d+:E\d+/.test(el.textContent?.trim() ?? "")) return el
  }
  return null
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname } = location

  // Player page (/play/{token})
  if (pathname.startsWith("/play/")) {
    const video = document.querySelector<HTMLVideoElement>("video")
    const mediaPlayer = document.querySelector("[data-media-player]")
    const poster = getPlayerPoster()

    const episodeEl = getEpisodeSpan()
    // For series: the series title is the sibling just before the episode span
    const seriesTitleEl = episodeEl?.previousElementSibling as HTMLSpanElement | null
    const title = seriesTitleEl?.textContent?.trim() || getTitle()
    const episodeLabel = episodeEl?.textContent?.trim()

    const isPlaying = video
      ? !video.paused && !video.ended
      : !mediaPlayer?.hasAttribute("data-paused")

    if (ctx.settings.hideOnPause && (video ? video.paused : mediaPlayer?.hasAttribute("data-paused"))) {
      presence.clearActivity()
      return
    }

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: title,
      detailsUrl: document.location.href.split(/[?#]/)[0],
      state: episodeLabel,
      largeImageKey: poster || Assets.Logo,
      largeImageText: title,
      smallImageKey: isPlaying ? "play" : "pause",
      smallImageText: isPlaying ? strings.playing : strings.paused,
      type: PresenceType.Watching,
    }

    if (isPlaying && video) {
      Object.assign(data, createMediaTimestamps(video))
    }

    if (ctx.settings.showPlaybackState === false) {
      delete data.smallImageKey
      delete data.smallImageText
    }
    data.statusDisplayType = ctx.settings.statusDisplayType === "details" ? 2
      : ctx.settings.statusDisplayType === "state" && data.state ? 1 : 0
    await presence.setActivity(data)
    return
  }

  // Sheet page (/sheet/movie-{id} or /sheet/tv-{id})
  const sheetMatch = pathname.match(/^\/sheet\/(movie|tv)-\d+/)
  if (sheetMatch) {
    const contentType = sheetMatch[1] as "movie" | "tv"
    const title = getTitle()
    const poster = getSheetPoster()

    await presence.setActivity({
      details: contentType === "movie" ? strings.viewingMovie : strings.viewingTvShow,
      state: title,
      stateUrl: document.location.href.split(/[?#]/)[0],
      largeImageKey: poster || Assets.Logo,
      largeImageText: title,
      type: PresenceType.Watching,
      buttons: [
        {
          label: contentType === "movie" ? strings.viewMovie : strings.viewTvShow,
          url: location.href,
        },
      ],
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: strings.browsingCinepulse,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
