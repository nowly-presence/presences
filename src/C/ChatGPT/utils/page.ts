const GENERIC_TITLES = new Set([
  "chatgpt",
  "chatGPT",
  "new chat",
  "temporary chat",
  "chat temporaire",
  "chat temporal",
])

const PRIVACY_LABEL = /temporary-chat|temporary|temporaire|temporal|incognito/i

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

export const cleanChatGptTitle = (title: string): string =>
  title
    .replace(/^\s*ChatGPT\s*[-–|]\s*/i, "")
    .replace(/\s*[-–|]\s*ChatGPT\s*$/i, "")
    .trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanChatGptTitle(document.title || og || "")
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

// Project chats render the page title as "{Project name} - {Conversation title}"
const stripProjectPrefix = (title: string): string => title.replace(/^[^-–]+[-–]\s*/, "").trim()

export const isPrivateChatGpt = (title: string, pathname: string, search: string): boolean => {
  const params = new URLSearchParams(search)
  if (params.get("temporary-chat") === "true") return true
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  return Boolean(
    document.querySelector(
      '[aria-label*="Temporary" i], [aria-label*="temporaire" i], [aria-label*="temporal" i]',
    ),
  )
}

export type ChatGptBrowseActivity =
  | "gpts"
  | "plugins"
  | "scheduled"
  | "library"
  | "images"
  | "health"
  | "finances"
  | "codex"
  | "other"

export type ChatGptPage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      startedAt: number
    }
  | { kind: "project"; title?: string }
  | { kind: "browse"; activity: ChatGptBrowseActivity }

const BROWSE_ACTIVITIES: Record<string, ChatGptBrowseActivity> = {
  gpts: "gpts",
  explore: "gpts",
  plugins: "plugins",
  scheduled: "scheduled",
  library: "library",
  images: "images",
  health: "health",
  finances: "finances",
  codex: "codex",
}

export const getChatGptPage = (): ChatGptPage => {
  const { pathname, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateChatGpt(title, pathname, search)
  const first = segs[0] ?? ""

  const browseActivity = BROWSE_ACTIVITIES[first]
  if (browseActivity) {
    return { kind: "browse", activity: browseActivity }
  }

  if (first === "g" && segs[1]?.startsWith("g-p-") && segs[2] === "project") {
    return { kind: "project", title: isGenericTitle(title) ? undefined : title }
  }

  if (!first || first === "c" || first === "g") {
    const id = first === "c" ? segs[1] : first === "g" ? segs[3] || segs[1] : undefined
    const isProjectChat = first === "g" && segs[1]?.startsWith("g-p-") && segs[2] === "c"
    const chatTitle = isProjectChat ? stripProjectPrefix(title) : title
    return {
      kind: "chat",
      title: isGenericTitle(chatTitle) ? undefined : chatTitle,
      private: privateChat,
      startedAt: touchSession(id ?? (privateChat ? "temporary" : "new")),
    }
  }

  return { kind: "browse", activity: "other" }
}
