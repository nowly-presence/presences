const localePrefixes = new Set(["fr", "es", "de", "pt-br", "pl", "ja", "ko", "tr", "ms", "el"])

export type NowlyPage = {
  area: "website" | "docs"
  kind: string
  pathname: string
  slug?: string
}

const getSegments = (pathname: string): string[] => {
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] && localePrefixes.has(segments[0].toLowerCase())) segments.shift()
  return segments
}

export const getNowlyPage = (): NowlyPage | undefined => {
  const hostname = window.location.hostname.toLowerCase()
  const pathname = window.location.pathname
  const segments = getSegments(pathname)

  if (hostname === "docs.nowly.me") {
    if (segments[0] === "changelog") {
      return { area: "docs", kind: segments[1] ? "docsRelease" : "docsChangelog", pathname, slug: segments[1] }
    }

    return { area: "docs", kind: segments.length ? "docsArticle" : "docsHome", pathname }
  }

  if (hostname !== "nowly.me" && hostname !== "www.nowly.me") return undefined

  const [first, second] = segments
  if (!first) return { area: "website", kind: "home", pathname }
  if (first === "library") {
    return second
      ? { area: "website", kind: "presence", pathname, slug: second }
      : { area: "website", kind: "library", pathname }
  }
  if (first === "author") return { area: "website", kind: "author", pathname, slug: second }
  if (first === "changelog") {
    return { area: "website", kind: second ? "release" : "changelog", pathname, slug: second }
  }

  const knownPages: Record<string, string> = {
    desktop: "desktop",
    extension: "extension",
    canary: "canary",
    support: "support",
    status: "status",
    branding: "branding",
    privacy: "privacy",
    consent: "consent",
    tos: "terms",
    cookies: "cookies",
    "legal-notice": "legalNotice",
    uninstall: "uninstall",
  }

  return { area: "website", kind: knownPages[first] ?? "websitePage", pathname, slug: segments.join("/") }
}

export const getPresenceLogo = (slug: string): string =>
  `https://cdn.nowly.me/presences/${encodeURIComponent(slug)}/assets/logo.png`

export const findPageTitle = (): string | undefined => {
  const title = document.querySelector("main h1, article h1, h1")?.textContent?.replace(/\s+/g, " ").trim()
  if (title) return title

  const documentTitle = document.title
    .replace(/\s*[|–—-]\s*Nowly(?: Docs)?\s*$/i, "")
    .trim()

  return documentTitle || undefined
}

export const truncateActivityText = (value: string, maxLength = 128): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value
