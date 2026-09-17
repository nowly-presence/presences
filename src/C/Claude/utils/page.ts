const GENERIC_TITLES = new Set([
  "claude",
  "claude.ai",
  "anthropic",
  "incognito",
  "new chat",
  "nouvelle discussion",
])

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

export const cleanClaudeTitle = (title: string): string =>
  title.replace(/\s*[-–|]\s*Claude(?:\.ai)?\s*$/i, "").trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanClaudeTitle(document.title || og || "")
}

// Project pages don't put the project name in the document title - it only
// lives in this heading.
const projectTitle = (): string => {
  const heading = document.querySelector("h1.font-heading.text-primary")?.textContent
  return (heading ?? "").trim()
}

// Skill/connector/plugin detail pages don't put the item name in the document
// title either - it only lives in this tooltip span.
const itemTitle = (): string => {
  const label = document.querySelector('span[data-cds="OverflowTooltip"]')?.textContent
  return (label ?? "").trim()
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

export const isPrivateClaude = (title: string, pathname: string, search: string): boolean => {
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  return Boolean(
    document.querySelector(
      '[aria-label*="Incognito" i], [aria-label*="incognito" i], [aria-label*="Temporary" i]',
    ),
  )
}

export type ClaudeBrowseActivity =
  | "skills"
  | "connectors"
  | "plugins"
  | "artifacts"
  | "projects"
  | "other"

export type ClaudePage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      startedAt: number
    }
  | { kind: "project"; title?: string }
  | { kind: "browse"; activity: ClaudeBrowseActivity; title?: string }

const CUSTOMIZE_ACTIVITIES: Record<string, ClaudeBrowseActivity> = {
  skills: "skills",
  connectors: "connectors",
  plugins: "plugins",
}

export const getClaudePage = (): ClaudePage => {
  const { pathname, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateClaude(title, pathname, search)
  const first = segs[0] ?? ""

  if (first === "customize") {
    const activity = CUSTOMIZE_ACTIVITIES[segs[1] ?? ""] ?? "other"
    // Detail pages: /customize/skills/discover/<id>, /customize/connectors/directory/<id>,
    // /customize/plugins/<id>.
    const hasDetail =
      (activity === "skills" && segs[2] === "discover" && segs[3]) ||
      (activity === "connectors" && segs[2] === "directory" && segs[3]) ||
      (activity === "plugins" && segs[2])
    if (hasDetail) {
      const name = itemTitle()
      return { kind: "browse", activity, title: isGenericTitle(name) ? undefined : name }
    }
    return { kind: "browse", activity }
  }

  if (first === "artifacts") return { kind: "browse", activity: "artifacts" }
  if (first === "projects") return { kind: "browse", activity: "projects" }

  if (first === "project" && segs[1]) {
    const name = projectTitle()
    return { kind: "project", title: isGenericTitle(name) ? undefined : name }
  }

  if (!first || first === "new" || first === "chat" || first === "chats") {
    const id = first === "chat" || first === "chats" ? segs[1] : undefined
    return {
      kind: "chat",
      title: isGenericTitle(title) ? undefined : title,
      private: privateChat,
      startedAt: touchSession(id ?? "new"),
    }
  }

  return { kind: "browse", activity: "other" }
}
