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
  return cleanClaudeTitle(og || document.title)
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

export type ClaudePage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      url?: string
      startedAt: number
    }
  | { kind: "project"; title?: string }
  | { kind: "browse" }

export const getClaudePage = (): ClaudePage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateClaude(title, pathname, search)
  const first = segs[0] ?? ""

  if (first === "project" || first === "projects") {
    const name = isGenericTitle(title) ? undefined : title
    return { kind: "project", title: name }
  }

  if (!first || first === "new" || first === "chat" || first === "chats") {
    const id = first === "chat" || first === "chats" ? segs[1] : undefined
    return {
      kind: "chat",
      title: isGenericTitle(title) ? undefined : title,
      private: privateChat,
      url: id ? href.split("?")[0] : undefined,
      startedAt: touchSession(id ?? "new"),
    }
  }

  return { kind: "browse" }
}
