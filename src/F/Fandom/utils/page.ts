import type enUS from "../locales/en-US.json"

type FandomStrings = typeof enUS

export type FandomPage = {
  details: string
  state?: string
  isSpecific: boolean
  buttonUrl?: string
  image?: string
}

const getWikiTitle = (pathname: string, search: URLSearchParams): string => {
  const path = pathname.replace(/^\//, "").replace(/\/$/, "").split("/")
  const rawTitle = path[0] === "index.php"
    ? search.get("title") || ""
    : path[0] === "wiki"
      ? path.slice(1).join("/")
      : path.slice(1).join("/")

  return decodeURIComponent(rawTitle)
    .replaceAll("_", " ")
    .replace(/\s*BETA\s*$/i, "")
    .trim()
}

const getPageButtonUrl = (href: string): string => href.split("#")[0] ?? href

const getWikiImage = (): string | undefined => {
  const image = document.querySelector<HTMLImageElement>(
    '[data-test="fandom-community-header-community-logo"], .fandom-community-header__community-logo, .wds-community-header__image img',
  )?.currentSrc
    || document.querySelector<HTMLImageElement>(
      '[data-test="fandom-community-header-community-logo"], .fandom-community-header__community-logo, .wds-community-header__image img',
    )?.src

  return image?.startsWith("https://") ? image : undefined
}

export const getFandomPage = (
  hostname: string,
  pathname: string,
  href: string,
  strings: FandomStrings,
): FandomPage => {
  const url = new URL(href)
  const title = (document.querySelector<HTMLElement>("h1")?.textContent?.trim()
    || getWikiTitle(pathname, url.searchParams))
    .replace(/\s*BETA\s*$/i, "")
    .trim()
  const wikiName = document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]')?.content
    || document.querySelector<HTMLElement>(".wds-community-header__sitename, .fandom-community-header__community-name")?.textContent?.trim()
  const action = url.searchParams.get("action") || url.searchParams.get("veaction")
  const isEditorialHost = hostname === "www.fandom.com" || hostname === "fandom.com" || hostname.endsWith(".tvguide.com") || hostname === "tvguide.com"

  if (isEditorialHost) {
    if (pathname.startsWith("/articles/") || pathname.startsWith("/news/")) {
      return {
        details: strings.readingArticle,
        state: title || undefined,
        isSpecific: true,
        buttonUrl: getPageButtonUrl(href),
      }
    }
    if (pathname.startsWith("/video/")) {
      return {
        details: strings.watchingVideo,
        state: document.querySelector(".video-page-featured-player__title")?.textContent?.trim(),
        isSpecific: true,
        buttonUrl: getPageButtonUrl(href),
      }
    }
    return {
      details: strings.browsing,
      state: title || undefined,
      isSpecific: pathname !== "/",
      buttonUrl: pathname !== "/" ? getPageButtonUrl(href) : undefined,
    }
  }

  if (pathname.startsWith("/f/")) {
    const discussionTitle = document.querySelector<HTMLElement>(".post-info__title, .fancy-title")?.textContent?.trim()
    return {
      details: strings.viewingDiscussion,
      state: discussionTitle || wikiName || undefined,
      isSpecific: true,
      buttonUrl: getPageButtonUrl(href),
      image: getWikiImage(),
    }
  }

  if (document.querySelector(".unified-search__form")) {
    return {
      details: strings.searching,
      state: document.querySelector<HTMLInputElement>(".unified-search__input__query")?.value || undefined,
      isSpecific: true,
      buttonUrl: getPageButtonUrl(href),
      image: getWikiImage(),
    }
  }

  if (action === "history" || url.searchParams.has("oldid") || url.searchParams.has("diff")) {
    return {
      details: strings.viewingHistory,
      state: title || wikiName || undefined,
      isSpecific: true,
      buttonUrl: getPageButtonUrl(href),
      image: getWikiImage(),
    }
  }

  if (action === "edit" || action === "editsource") {
    return {
      details: strings.editingPage,
      state: title || wikiName || undefined,
      isSpecific: true,
      buttonUrl: getPageButtonUrl(href),
      image: getWikiImage(),
    }
  }

  const namespace = [...document.body.classList].find(className => /^ns--?\d+$/.test(className))?.match(/^ns-(-?\d+)$/)?.[1]
  const isArticle = !namespace || namespace === "0"

  return {
    details: isArticle ? strings.readingArticle : strings.viewingPage,
    state: [title, wikiName].filter(Boolean).join(" | ") || undefined,
    isSpecific: true,
    buttonUrl: getPageButtonUrl(href),
    image: getWikiImage(),
  }
}
