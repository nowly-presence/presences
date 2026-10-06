import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
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
      "en-US": "When enabled, your Discord presence also shows when you browse Peacock, not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Peacock, pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Peacock, no solo al reproducir contenido.",
      "de-DE": "Wenn diese Option aktiviert ist, zeigt deine Discord-Aktivität auch an, wenn du Peacock durchsuchst – nicht nur, wenn etwas abgespielt wird.",
      "el-GR": "Όταν είναι ενεργοποιημένο, η παρουσία σας στο Discord εμφανίζεται επίσης όταν περιηγείστε στο Peacock και όχι μόνο όταν αναπαράγεται κάτι.",
      "ja-JP": "有効にすると、何かを再生しているときだけでなく、Peacockを閲覧しているときもDiscordのプレゼンスに表示されます。",
      "ko-KR": "활성화하면 콘텐츠를 재생 중일 때뿐만 아니라 Peacock을 탐색할 때도 Discord 활동 상태에 표시됩니다.",
      "ms-MY": "Apabila didayakan, presence Discord anda turut dipaparkan semasa anda melayari Peacock, bukan hanya apabila sesuatu sedang dimainkan.",
      "pl-PL": "Po włączeniu tej opcji Twoja aktywność na Discordzie jest widoczna także podczas przeglądania Peacock, a nie tylko podczas odtwarzania.",
      "pt-BR": "Quando ativado, seu status no Discord também aparece enquanto você navega pelo Peacock, não apenas quando algo está sendo reproduzido.",
      "tr-TR": "Etkinleştirildiğinde, Discord durumunuz yalnızca bir içerik oynatılırken değil, Peacock'ta gezinirken de gösterilir.",
    },
  },
})

const presence = new Presence(settings)

const findWatchingVideo = (): HTMLVideoElement | null => {
  const videos = [...document.querySelectorAll<HTMLVideoElement>("video")]
  return videos.find(video => !video.closest("[data-gsp-shortform-player]")) || null
}

const getText = (...selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const text = document.querySelector<HTMLElement>(selector)?.textContent?.trim()
    if (text) return text
  }

  return undefined
}

const getCover = (): string | undefined => {
  const image = document.querySelector<HTMLImageElement>('[data-testid="immersive-image"]')
  const src = image?.srcset.split(",")[0]?.trim().split(/\s+/)[0] || image?.currentSrc || image?.src
  return src?.startsWith("https://") ? src : undefined
}

const cleanDocumentTitle = (): string | undefined =>
  document.title.replace(/\s*[-|]\s*Peacock.*$/i, "").trim() || undefined

const getBrowsingString = (pathname: string, strings: typeof enUS): string => {
  if (pathname.includes("/movies/highlights")) return strings.browsingMovies
  if (pathname.includes("/watch/tv/highlights")) return strings.browsingTv
  if (pathname.includes("/watch/kids/highlights")) return strings.browsingKids
  if (pathname.includes("/watch/sports/highlights")) return strings.browsingSports
  if (pathname.includes("/watch/latino/highlights")) return strings.browsingLatino
  if (pathname.includes("/watch/my-stuff")) return strings.browsingMyStuff
  return strings.browsing
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { pathname, href } = document.location
  const isSearch = pathname.includes("/watch/search")
  const isPlaybackRoute = pathname.includes("/watch/playback")
  const isAssetRoute = pathname.includes("/watch/asset")
  const video = isPlaybackRoute || isAssetRoute ? findWatchingVideo() : null

  if (video) {
    const title = getText(
      '[data-testid="metadata-title"]',
      ".playback-header__title",
      ".playback-metadata__container-title",
      "h1",
    ) || cleanDocumentTitle()
    const description = getText(
      '[data-testid="metadata-description"]',
      ".playback-metadata__container-episode-metadata-info",
      ".playback-metadata__container-description",
      ".swiper-slide-active .playlist-item-overlay__container-title",
    )
    const isLive = !Number.isFinite(video.duration)

    const data: Parameters<typeof presence.setActivity>[0] = {
      name: ctx.settings.showMediaTitle ? title : undefined,
      details: ctx.settings.showMediaTitle && title ? "Peacock" : title || strings.watching,
      state: description,
      largeImageKey: getCover() || Assets.Logo,
      largeImageText: title,
      type: PresenceType.Watching,
      buttons: [{ label: strings.watching, url: href.split("?")[0] || href }],
    }

    if (isLive) {
      data.smallImageKey = "play"
      data.smallImageText = strings.live
    } else if (video.paused) {
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

  if (isAssetRoute || isPlaybackRoute) {
    const title = cleanDocumentTitle() || getText("h1")
    if (title) {
      await presence.setActivity({
        details: title,
        state: getText('[data-testid="synopsis"]'),
        largeImageKey: getCover() || Assets.Logo,
        largeImageText: title,
        type: PresenceType.Watching,
      })
      return
    }
  }

  if (!ctx.settings.showBrowsing && !isSearch) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: isSearch ? strings.searching : getBrowsingString(pathname, strings),
    largeImageKey: Assets.Logo,
    smallImageKey: isSearch ? "search" : undefined,
    type: PresenceType.Watching,
  })
})
