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
  const hash = url.hash.toLowerCase()
  const routePath = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, "") || "/"
  if (hostname === "about.roblox.com" || hostname === "www.about.roblox.com") {

    if (routePath.startsWith("/newsroom")) {
      return { details: strings.newsroom, isSpecific: true, buttonUrl: href.split("#")[0] }
    }
  }

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
  if (routePath === "/home" || routePath.endsWith("/home")) {
    return { details: strings.home, isSpecific: true }
  }
  if (routePath.includes("/my/messages")) {
    return { details: strings.messages, state: getText("h1"), isSpecific: true, buttonUrl: href.split("#")[0] }
  }
  if (routePath.includes("/users/friends")) {
    const details = hash.includes("following")
      ? strings.following
      : hash.includes("followers")
        ? strings.followers
        : hash.includes("friend-requests")
          ? strings.friendRequests
          : strings.friends

    return { details, isSpecific: true, buttonUrl: href.split("#")[0] }
  }
  if (routePath.includes("/my/avatar")) {
    return { details: strings.avatar, isSpecific: true, buttonUrl: href.split("#")[0] }
  }
  if (routePath.startsWith("/trades")) {
    const tab = url.searchParams.get("tab")?.toLowerCase()
    const details = tab === "outbound"
      ? strings.outboundTrades
      : tab === "completed"
        ? strings.completedTrades
        : tab === "inactive"
          ? strings.inactiveTrades
          : strings.inboundTrades

    return { details, isSpecific: true, buttonUrl: href.split("#")[0] }
  }
  if (routePath === "/search/communities") {
    return { details: strings.searchingCommunities, isSpecific: true, isSearch: true, buttonUrl: href.split("#")[0] }
  }
  if (/\/communities\/|\/groups\//.test(routePath) && !routePath.includes("/search")) {
    return {
      details: strings.viewingGroup,
      state: getText(".group-name", ".community-name", "h1.game-name", "h1"),
      image: getImage(".group-image img", ".group-header img", ".community-header img", "img[src*='rbxcdn.com']"),
      isSpecific: true,
      buttonUrl: href.split("?")[0],
    }
  }
  if (routePath.includes("/users/inventory")) {
    return {
      details: strings.viewingInventory,
      state: getText(
        "[data-page-name='Inventory'] .tab-item.active",
        "[data-page-name='Inventory'] .rbx-tab.active",
        "[data-page-name='Inventory'] [aria-current='page']",
        "h1",
      ),
      isSpecific: true,
      buttonUrl: href.split("?")[0],
    }
  }
  if (/\/games?\//.test(routePath)) {
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
  if (/\/users\/[^/]+\/profile|\/member\//.test(routePath)) {
    return {
      details: strings.viewingProfile,
      state: getText(".profile-name", ".username", "h1"),
      image: getImage(".avatar-card-link img", ".profile-avatar img"),
      isSpecific: true,
      buttonUrl: href.split("?")[0],
    }
  }
  if (routePath.includes("/catalog") || routePath.includes("/bundles/") || routePath.includes("/library/")) {
    return {
      details: strings.viewingCatalog,
      state: getText(".item-name-container h2", "h1"),
      image: getImage(".thumbnail-span img", ".thumbnail-2d-container img"),
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
