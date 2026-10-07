type DetailPage = {
  title: string
  image?: string
  detailUrl: string
  watchUrl?: string
  trailer: boolean
}

type Playback = {
  video: HTMLVideoElement
  title: string
  episode?: string
  watchUrl?: string
}

const detailPath = /\/(?:detail|dp)\/[A-Z0-9]+(?:\/|$)/i

const cleanUrl = (href: string, autoplay = false): string | undefined => {
  const url = new URL(href, location.href)
  if (url.origin !== location.origin || !detailPath.test(url.pathname)) return undefined
  url.search = ""
  url.hash = ""
  // autoplay is functional, not a tracking parameter.
  if (autoplay) url.searchParams.set("autoplay", "1")
  return url.href
}

const findWatchUrl = (): string | undefined => {
  const link = document.querySelector<HTMLAnchorElement>(
    'a[data-testid="dp-atf-play-button"][href], a[data-automation-id="dp-atf-play-button"][href], a[data-testid="episodes-playbutton"][href]',
  )
  return link ? cleanUrl(link.href, true) : undefined
}

const findEpisode = (watchUrl: string | undefined): string | undefined => {
  if (!watchUrl) return undefined
  for (const item of document.querySelectorAll('[data-testid="episode-list-item"]')) {
    const link = item.querySelector<HTMLAnchorElement>('a[data-testid="episodes-playbutton"][href]')
    if (!link || cleanUrl(link.href, true) !== watchUrl) continue
    const heading = item.querySelector("h3")?.textContent?.trim()
    const match = heading?.match(/^(\d+)\.\s*(.*)$/)
    const season = document.querySelector('[data-testid="dp-season-selector"] label')?.textContent?.match(/\d+/)?.[0]
    return match && season ? `S${season}.E${match[1]} ${match[2]}`.trim() : heading
  }
  return undefined
}

export const readDetailPage = (): DetailPage | undefined => {
  if (!detailPath.test(location.pathname)) return undefined
  const heading = document.querySelector<HTMLElement>(
    'h1[data-testid="title-art"], .DVWebNode-detail-atf-wrapper h1, h1[data-automation-id="title"]',
  )
  const title = heading?.querySelector("img")?.alt?.trim() || heading?.textContent?.trim()
  if (!title) return undefined
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
  const detailUrl = (canonical && cleanUrl(canonical)) || cleanUrl(location.href)
  if (!detailUrl) return undefined
  const image = document.querySelector<HTMLImageElement>(
    '[data-automation-id="hero-background"] img, img#atf-full',
  )
  const trailerLink = document.querySelector<HTMLAnchorElement>('a[data-testid="trailer-button"][href]')
  return {
    title,
    image: image?.currentSrc || image?.src || undefined,
    detailUrl,
    watchUrl: findWatchUrl(),
    trailer: !!trailerLink && cleanUrl(trailerLink.href) === cleanUrl(location.href),
  }
}

const isVisible = (element: HTMLElement): boolean => {
  const style = getComputedStyle(element)
  const bounds = element.getBoundingClientRect()
  return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0
}

export const createPlaybackReader = () => {
  let root: HTMLElement | undefined
  let identity: string | undefined
  let title: string | undefined
  let episode: string | undefined
  let watchUrl: string | undefined
  let selectedWatchUrl: string | undefined
  let selectedPath: string | undefined
  let selectedTrailer = false
  let trailer = false

  document.addEventListener("click", event => {
    const link = event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>('a[href*="autoplay="]')
      : null
    if (link) {
      selectedTrailer = link.matches('[data-testid="trailer-button"]') ||
        new URL(link.href).searchParams.get("autoplay") === "trailer"
      if (selectedTrailer) episode = undefined
      selectedWatchUrl = selectedTrailer ? undefined : cleanUrl(link.href, true)
      selectedPath = location.pathname
    }
  }, true)

  const captureMetadata = () => {
    const nextTitle = root?.querySelector(".atvwebplayersdk-title-text")?.textContent?.trim()
    const nextEpisode = root?.querySelector(".atvwebplayersdk-episode-info")?.textContent?.trim()
    if (nextTitle && nextTitle !== title) {
      title = nextTitle
      episode = undefined
    }
    // Controls are unmounted when idle. Absence must not erase known metadata.
    if (nextEpisode && !trailer) {
      const parts = nextEpisode.match(/^\D*(\d+)\D+(\d+)\s*(.*)$/)
      episode = parts ? `S${parts[1]}.E${parts[2]} ${parts[3]}`.trim() : nextEpisode
      for (const item of document.querySelectorAll('[data-testid="episode-list-item"]')) {
        const episodeTitle = item.querySelector("h3")?.textContent?.trim().replace(/^\d+\.\s*/, "")
        if (episodeTitle && nextEpisode.endsWith(episodeTitle)) {
          const link = item.querySelector<HTMLAnchorElement>('a[data-testid="episodes-playbutton"][href]')
          if (link) watchUrl = cleanUrl(link.href, true)
          break
        }
      }
    }
  }

  const readPlayback = (page: DetailPage | undefined): Playback | undefined => {
    const nextIdentity = location.pathname
    if (selectedPath && selectedPath !== nextIdentity) {
      selectedPath = undefined
      selectedWatchUrl = undefined
      selectedTrailer = false
    }
    const nextRoot = [...document.querySelectorAll<HTMLElement>('[id^="dv-web-player"]')]
      .find(isVisible)
    const video = nextRoot && [...nextRoot.querySelectorAll<HTMLVideoElement>("video")]
      .find(candidate => !candidate.classList.contains("tst") && isVisible(candidate))
    // Never fall back to the ambient trailer or a hidden, preloaded player.
    if (!nextRoot || !video || !page) {
      root = undefined
      identity = undefined
      title = undefined
      episode = undefined
      watchUrl = undefined
      return undefined
    }

    trailer = selectedTrailer || page.trailer || new URL(location.href).searchParams.get("autoplay") === "trailer"
    if (identity !== nextIdentity || root !== nextRoot) {
      root = nextRoot
      identity = nextIdentity
      title = page.title
      watchUrl = selectedPath === nextIdentity ? selectedWatchUrl : page.watchUrl
      watchUrl ||= page.watchUrl
      // A trailer can share the series page but must not inherit its episode.
      episode = trailer ? undefined : findEpisode(watchUrl)
    }
    if (trailer) episode = undefined
    captureMetadata()
    return { video, title: title || page.title, episode, watchUrl }
  }

  // Capture controls when they mount, even between the extension's update ticks.
  const metadataSelector = ".atvwebplayersdk-title-text, .atvwebplayersdk-episode-info"
  const observer = new MutationObserver(records => {
    if (records.some(record =>
      (record.target instanceof Element && record.target.closest(metadataSelector)) ||
      (record.target.parentElement?.closest(metadataSelector)) ||
      [...record.addedNodes].some(node => node instanceof Element &&
        (node.matches(metadataSelector) || node.querySelector(metadataSelector))),
    )) readPlayback(readDetailPage())
  })
  observer.observe(document, { childList: true, subtree: true, characterData: true })
  return readPlayback
}

export const findSearchQuery = (): string | undefined => {
  const searchSummary = document.querySelector(".av-refine-bar-summaries")
  return searchSummary?.textContent?.match(/["„]([^"”]+)/)?.[1] || undefined
}
