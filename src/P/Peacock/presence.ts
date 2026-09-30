import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "When enabled, your Discord presence also shows when you browse Peacock, not only when something is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Peacock, pas seulement pendant la lecture.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Peacock, no solo al reproducir contenido.",
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
      details: title || strings.watching,
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
