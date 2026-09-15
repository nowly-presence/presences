const GENERIC_TITLES = new Set(["perplexity", "perplexity ai", "home"])
const PRIVACY_LABEL = /incognito|temporary|temporaire|privado|priv[ée]/i

let sessionKey = ""
let sessionStartedAt = Date.now()

const touchSession = (key: string): number => {
  if (key !== sessionKey) {
    sessionKey = key
    sessionStartedAt = Date.now()
  }
  return sessionStartedAt
}

const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export const cleanPerplexityTitle = (title: string): string =>
  title.replace(/\s*[-–|]\s*Perplexity(?: AI)?\s*$/i, "").trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanPerplexityTitle(og || document.title)
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

export const isPrivatePerplexity = (title: string, pathname: string, search: string): boolean => {
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  return Boolean(
    document.querySelector('[aria-label*="Incognito" i], [aria-label*="incognito" i]'),
  )
}

export type PerplexityPage =
  | {
      kind: "search"
      title?: string
      private: boolean
      url?: string
      startedAt: number
    }
  | { kind: "browse"; activity: "spaces" | "other" }

export const getPerplexityPage = (): PerplexityPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivatePerplexity(title, pathname, search)
  const first = segs[0] ?? ""
  const query = new URLSearchParams(search).get("q")?.trim()

  if (first === "spaces" || first === "collections") {
    return { kind: "browse", activity: "spaces" }
  }

  if (!first || first === "search" || first === "library") {
    const id = first === "search" || first === "library" ? segs[1] : undefined
    const label = query || (isGenericTitle(title) ? undefined : title)
    return {
      kind: "search",
      title: label,
      private: privateChat,
      url: id ? href.split("?")[0] : undefined,
      startedAt: touchSession(id ?? query ?? "home"),
    }
  }

  if (first === "page" || first === "blog" || first === "finance") {
    return { kind: "browse", activity: "other" }
  }

  return {
    kind: "search",
    title: isGenericTitle(title) ? undefined : title,
    private: privateChat,
    url: href.split("?")[0],
    startedAt: touchSession(pathname),
  }
}
