const GENERIC_TITLES = new Set(["perplexity", "perplexity ai", "home"])

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

// Perplexity is a SPA - document.title reflects live navigation more
// reliably than the og:title meta tag, which can lag behind.
const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanPerplexityTitle(document.title || og || "")
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

// The incognito toggle reuses the same spy icon in both states - only its
// filled ("active") vs outlined ("inactive") style class differs, which is
// more stable across locales than matching the aria-label text.
export const isPrivatePerplexity = (): boolean => {
  const toggle = Array.from(document.querySelectorAll<HTMLButtonElement>("button[aria-label]")).find((btn) =>
    btn.querySelector('use[href="#pplx-icon-spy"]'),
  )
  return Boolean(toggle?.className.includes("text-inverse"))
}

export type ComputerTab = "home" | "tasks" | "artifacts" | "connectors" | "skills" | "workflows" | "memory"
export type ProjectTab = "conversations" | "files" | "wiki" | "settings"

export type PerplexityPage =
  | { kind: "search"; title?: string; private: boolean; url?: string; startedAt: number }
  | { kind: "project"; tab: ProjectTab; title?: string; url: string }
  | { kind: "computer"; tab: ComputerTab }
  | { kind: "library" }
  | { kind: "other" }

const COMPUTER_TABS = new Set<ComputerTab>(["tasks", "artifacts", "connectors", "skills", "workflows", "memory"])
const PROJECT_TABS = new Set<ProjectTab>(["files", "wiki", "settings"])

export const getPerplexityPage = (): PerplexityPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const first = segs[0] ?? ""
  const query = new URLSearchParams(search).get("q")?.trim()

  if (first === "library") return { kind: "library" }

  if (first === "computer") {
    const requested = segs[1] as ComputerTab | undefined
    return { kind: "computer", tab: requested && COMPUTER_TABS.has(requested) ? requested : "home" }
  }

  if (first === "projects" && segs[1]) {
    const tabParam = new URLSearchParams(search).get("tab") as ProjectTab | null
    return {
      kind: "project",
      tab: tabParam && PROJECT_TABS.has(tabParam) ? tabParam : "conversations",
      title: isGenericTitle(title) ? undefined : title,
      url: href.split("?")[0] ?? href,
    }
  }

  if (!first || first === "search") {
    const id = first === "search" ? segs[1] : undefined
    const label = query || (isGenericTitle(title) ? undefined : title)
    return {
      kind: "search",
      title: label,
      private: isPrivatePerplexity(),
      url: id ? href.split("?")[0] : undefined,
      startedAt: touchSession(id ?? query ?? "home"),
    }
  }

  return { kind: "other" }
}
