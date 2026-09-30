import type enUS from "../locales/en-US.json"

type RobloxStrings = typeof enUS

type RobloxPage = {
  details: string
  state?: string
  image?: string
  isSpecific: boolean
  isSearch?: boolean
  buttonUrl?: string
}

const getText = (...selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const value = document.querySelector<HTMLElement>(selector)?.textContent?.trim()
    if (value) return value
  }

  return undefined
}

const getImage = (...selectors: string[]): string | undefined => {
  const src = document.querySelector<HTMLImageElement>(selectors.join(", "))?.src
  return src?.startsWith("https://") ? src : undefined
}

export const getRobloxPage = (
  hostname: string,
  pathname: string,
  href: string,
  strings: RobloxStrings,
): RobloxPage => {
  const url = new URL(href)
  const search = url.searchParams.get("keyword")
    || url.searchParams.get("Keyword")
    || url.searchParams.get("query")

  if (hostname === "devforum.roblox.com") {
    return {
      details: strings.devForum,
      state: getText(".fancy-title", "h1") || strings.forumHome,
      isSpecific: true,
      buttonUrl: pathname.includes("/t/") ? href.split("?")[0] : undefined,
    }
  }

  if (hostname === "create.roblox.com") {
    return {
      details: strings.creatorHub,
      state: getText("button[aria-selected='true']", "h1"),
      isSpecific: true,
    }
  }

  if (/\/games?\//.test(pathname)) {
    const gameName = getText(".game-calls-to-action h1", "[data-testid='game-name']", "h1")
    if (gameName) {
      return {
        details: strings.viewingGame,
        state: gameName,
        image: getImage("[class*='carousel-item'] img", ".game-card-thumb img"),
        isSpecific: true,
        buttonUrl: href.split("?")[0],
      }
    }
  }

  if (/\/users\/[^/]+\/profile|\/member\//.test(pathname)) {
    return {
      details: strings.viewingProfile,
      state: getText(".profile-name", ".username", "h1"),
      image: getImage(".avatar-card-link img", ".profile-avatar img"),
      isSpecific: true,
      buttonUrl: href.split("?")[0],
    }
  }

  if (pathname.includes("/groups/") && !pathname.includes("/search")) {
    return {
      details: strings.viewingGroup,
      state: getText(".group-name", "h1"),
      image: getImage(".group-image img"),
      isSpecific: true,
      buttonUrl: href.split("?")[0],
    }
  }

  if (pathname.includes("/catalog") || pathname.includes("/bundles/") || pathname.includes("/library/")) {
    return {
      details: strings.viewingCatalog,
      state: getText(".item-name-container h2", "h1"),
      image: getImage(".thumbnail-span img"),
      isSpecific: true,
      buttonUrl: href.split("?")[0],
    }
  }

  if (search) {
    return {
      details: strings.searching,
      state: search,
      isSpecific: true,
      isSearch: true,
    }
  }

  return { details: strings.browsing, isSpecific: false }
}
