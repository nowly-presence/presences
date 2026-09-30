import type enUS from "../locales/en-US.json"

type FandomStrings = typeof enUS

export type FandomPage = {
  details: string
  state?: string
  isSpecific: boolean
}

const getWikiTitle = (pathname: string, search: URLSearchParams): string => {
  const path = pathname.replace(/^\//, "").replace(/\/$/, "").split("/")
  const rawTitle = path[0] === "index.php"
    ? search.get("title") || ""
    : path[0] === "wiki"
      ? path.slice(1).join("/")
      : path.slice(1).join("/")

  return decodeURIComponent(rawTitle).replaceAll("_", " ")
}

export const getFandomPage = (
  hostname: string,
  pathname: string,
  href: string,
  strings: FandomStrings,
): FandomPage => {
  const url = new URL(href)
  const title = document.querySelector<HTMLElement>("h1")?.textContent?.trim()
    || getWikiTitle(pathname, url.searchParams)
  const wikiName = document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]')?.content
    || document.querySelector<HTMLElement>(".wds-community-header__sitename, .fandom-community-header__community-name")?.textContent?.trim()
  const action = url.searchParams.get("action") || url.searchParams.get("veaction")

  if (hostname === "www.fandom.com") {
    if (pathname.startsWith("/articles/")) {
      return { details: strings.readingArticle, state: document.querySelector(".article-header__title")?.textContent?.trim(), isSpecific: true }
    }
    if (pathname.startsWith("/video/")) {
      return { details: strings.watchingVideo, state: document.querySelector(".video-page-featured-player__title")?.textContent?.trim(), isSpecific: true }
    }
    return { details: strings.browsing, state: title || undefined, isSpecific: pathname !== "/" }
  }

  if (pathname.startsWith("/f/")) {
    const discussionTitle = document.querySelector<HTMLElement>(".post-info__title, .fancy-title")?.textContent?.trim()
    return { details: strings.viewingDiscussion, state: discussionTitle || wikiName || undefined, isSpecific: true }
  }

  if (document.querySelector(".unified-search__form")) {
    return {
      details: strings.searching,
      state: document.querySelector<HTMLInputElement>(".unified-search__input__query")?.value || undefined,
      isSpecific: true,
    }
  }

  if (action === "history" || url.searchParams.has("oldid") || url.searchParams.has("diff")) {
    return { details: strings.viewingHistory, state: title || wikiName || undefined, isSpecific: true }
  }

  if (action === "edit" || action === "editsource") {
    return { details: strings.editingPage, state: title || wikiName || undefined, isSpecific: true }
  }

  const namespace = [...document.body.classList].find(className => /^ns--?\d+$/.test(className))?.match(/^ns-(-?\d+)$/)?.[1]
  const isArticle = !namespace || namespace === "0"

  return {
    details: isArticle ? strings.readingArticle : strings.viewingPage,
    state: [title, wikiName].filter(Boolean).join(" | ") || undefined,
    isSpecific: true,
  }
}
