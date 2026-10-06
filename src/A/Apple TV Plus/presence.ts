import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { $, findVideo, hasPlayerTabs, text } from "./utils/dom"
import { getPageDescription, getPageTitle, getThumbnail, parseSubtitle } from "./utils/metadata"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
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
      "en-US": "When enabled, your Discord presence also shows when you browse Apple TV+ (home, search) - not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Apple TV+ (accueil, recherche) - pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Apple TV+ (inicio, búsqueda), no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Apple TV+ durchsuchst (Startseite, Suche) – nicht nur, wenn etwas abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Apple TV+ (αρχική, αναζήτηση) και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、Apple TV+（ホーム、検索）を閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 Apple TV+를 탐색(홈, 검색)할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Apple TV+ (laman utama, carian), bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Apple TV+ (strona główna, wyszukiwanie), a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo Apple TV+ (início, busca), não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, Apple TV+'ta (ana sayfa, arama) gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const video = findVideo()
  const playing = video && hasPlayerTabs()

  if (video && playing) {
    const title = text($(".video-metadata .title"))
    const subtitle = text($(".video-metadata .subtitle-text"))
    const genre = text($(".metadata-genre"))
    const thumbnail = getThumbnail()
    const isPaused = !!video.paused
    const mediaTitleInHeader = Boolean(ctx.settings.showMediaTitle && title)

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: mediaTitleInHeader ? title : undefined,
      largeImageKey: thumbnail || Assets.Logo,
      largeImageText: title || "Apple TV+",
      type: PresenceType.Watching,
      buttons: [{
        label: subtitle ? strings.watchEpisode : strings.watchShow,
        url: href,
      }],
    }

    if (subtitle) {
      const { seasonNum, episodeNum, episodeTitle } = parseSubtitle(subtitle)
      data.details = mediaTitleInHeader ? "Apple TV+" : title || "Apple TV+"
      if (episodeTitle) {
        data.state = `S${seasonNum}:E${episodeNum} ${episodeTitle}`
      } else if (Number.isFinite(seasonNum) && Number.isFinite(episodeNum)) {
        data.state = presence.formatString(strings.seasonEpisode, { season: seasonNum!, episode: episodeNum! })
      } else {
        data.state = subtitle
      }
    } else {
      data.details = mediaTitleInHeader ? "Apple TV+" : title || getPageTitle() || "Apple TV+"
      data.state = genre || strings.movie
    }

    if (isPaused) {
      data.smallImageKey = "pause"
      data.smallImageText = strings.paused
    } else {
      data.smallImageKey = "play"
      data.smallImageText = strings.playing
      Object.assign(data, createMediaTimestamps(video))
    }

    await presence.setActivity(data)
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  if (pathname === "/" || pathname.startsWith("/home")) {
    await presence.setActivity({
      details: strings.browsingHome,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/search")) {
    const query = new URLSearchParams(document.location.search).get("q")
    await presence.setActivity({
      details: strings.searching,
      state: query ? `"${query}"` : undefined,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/show/")) {
    const pageTitle = getPageTitle()
    await presence.setActivity({
      details: pageTitle || strings.viewingSeries,
      state: pageTitle ? undefined : getPageDescription(),
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname.startsWith("/room/")) {
    await presence.setActivity({
      details: strings.sharePlayRoom,
      largeImageKey: Assets.Logo,
      type: PresenceType.Watching,
    })
    return
  }

  await presence.setActivity({
    details: strings.browsing,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
