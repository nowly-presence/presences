import type enUS from "../locales/en-US.json"

type SteamDBStrings = typeof enUS

export type SteamDBPage = {
  details: string
  state?: string
  isSearch?: boolean
  buttonUrl?: string
}

const getHeaderTitle = (selector: string): string | undefined =>
  document.querySelector<HTMLElement>(selector)?.textContent?.trim() || undefined

export const getSteamDBPage = (
  hostname: string,
  pathname: string,
  href: string,
  strings: SteamDBStrings,
): SteamDBPage => {
  const searchInput = document.querySelector<HTMLInputElement>(
    '[aria-label="Search"], [type="search"], input.ais-SearchBox-input',
  )
  const search = searchInput?.value.trim()
  const title = getHeaderTitle("h1.header-title, h1.header-title span, h1")
  const subTitle = getHeaderTitle("h2.header-title, h2.header-subtitle")
  const url = new URL(href)

  if (hostname === "steamstat.us") {
    return {
      details: strings.viewingStatus,
      state: document.querySelector("#online")?.textContent?.trim() || undefined,
    }
  }

  if (search) return { details: strings.searching, state: search, isSearch: true }
  if (pathname.startsWith("/graph/")) return { details: strings.viewingCharts, state: subTitle }

  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] === "app" && segments[1]) {
    return {
      details: strings.viewingGame,
      state: title || document.querySelector("h1")?.lastChild?.textContent?.trim(),
      buttonUrl: url.origin + pathname,
    }
  }

  if (["sub", "bundle", "depot", "changelist", "patchnotes"].includes(segments[0])) {
    return {
      details: strings.viewingPage,
      state: title || subTitle,
      buttonUrl: url.origin + pathname,
    }
  }

  if (pathname === "/" || pathname === "") return { details: strings.browsing }
  return { details: strings.viewingPage, state: title || subTitle }
}
