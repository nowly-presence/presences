import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getMediaElement, getMediaSessionTrack, getPageImage, toDiscordImage } from "./utils/track"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  privacy: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Privacy mode",
      "fr-FR": "Mode privé",
      "es-ES": "Modo privado",
    },
    description: {
      "en-US": "Hide the track title, artist, artwork, and buttons.",
      "fr-FR": "Masque le titre, l'artiste, la pochette et les boutons.",
      "es-ES": "Oculta el título, artista, portada y botones.",
    },
  },
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "Show activity while you browse SoundCloud with no track detected.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez SoundCloud sans titre détecté.",
      "es-ES": "Muestra actividad al explorar SoundCloud sin una pista detectada.",
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
    },
    description: {
      "en-US": "Show a button to open the current page.",
      "fr-FR": "Affiche un bouton pour ouvrir la page en cours.",
      "es-ES": "Muestra un botón para abrir la página actual.",
    },
  },
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

const browsingDetails = (pathname: string, strings: typeof enUS): string => {
  if (pathname.startsWith("/search") || pathname.startsWith("/you/search")) return strings.searching
  if (pathname.startsWith("/discover")) return strings.browsingDiscover
  if (pathname.startsWith("/charts")) return strings.browsingCharts
  if (pathname.startsWith("/notifications")) return strings.viewingNotifications
  if (pathname.startsWith("/messages")) return strings.viewingMessages
  if (pathname.startsWith("/you/")) return strings.browsingLibrary
  if (pathname.startsWith("/settings")) return strings.viewingSettings
  if (pathname.split("/").filter(Boolean).length === 1) return strings.viewingProfile
  return strings.browsingSoundCloud
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
      largeImageText: privacy ? "SoundCloud" : track.title,
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

  const pathname = document.location.pathname
  const isProfile = pathname.split("/").filter(Boolean).length === 1

  const data: PresenceData = {
    details: browsingDetails(pathname, strings),
    largeImageKey: (!privacy && isProfile && getPageImage()) || Assets.Logo,
    largeImageText: "SoundCloud",
    type: PresenceType.Listening,
  }
  if (!privacy && isProfile && showButtons) {
    data.buttons = [{ label: strings.viewProfile, url: document.location.href.split("?")[0] ?? document.location.href }]
  }
  await presence.setActivity(data)
})
