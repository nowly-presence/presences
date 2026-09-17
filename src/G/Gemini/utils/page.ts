const GENERIC_TITLES = new Set([
  "gemini",
  "google gemini",
  "temporary chat",
  "chat temporaire",
  "chat temporal",
  "chat temporaneo",
])

const PRIVACY_LABEL = /temporary|temporaire|temporal|incognito|privado|priv[ée]/i

const TEMPORARY_CHAT_COPY = /les discussions temporaires|temporary chats?|chats? temporales|vous ne faites que passer|just passing through|n['’]apparaissent pas dans les discussions r[eé]centes|don'?t appear in (your )?chat history/i

let sessionKey = ""
let sessionStartedAt = Date.now()

const touchSession = (key: string): number => {
  if (key !== sessionKey) {
    sessionKey = key
    sessionStartedAt = Date.now()
  }
  return sessionStartedAt
}

const pathParts = (pathname: string): string[] => {
  const parts = pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))
  if (parts[0] === "u" && parts[1] && /^\d+$/.test(parts[1])) return parts.slice(2)
  return parts
}

const normalizeTitle = (title: string): string =>
  title.replace(/[\u200E\u200F]/g, "").replace(/\u00a0/g, " ").trim()

export const cleanGeminiTitle = (title: string): string =>
  normalizeTitle(title)
    .replace(/\s*[-–|]\s*Google Gemini\s*$/i, "")
    .replace(/\s*[-–|]\s*Gemini\s*$/i, "")
    .trim()

const pageTitle = (): string => cleanGeminiTitle(document.title)

const isGenericTitle = (title: string): boolean => {
  if (!title) return true
  return GENERIC_TITLES.has(title.toLowerCase())
}

const pageCopy = (): string =>
  document.body.innerText.slice(0, 2000).replace(/\u00a0/g, " ")

export const isPrivateGemini = (title: string, pathname: string, search: string): boolean => {
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  if (TEMPORARY_CHAT_COPY.test(pageCopy())) return true
  return Boolean(
    document.querySelector(
      '[aria-label*="Temporary" i], [aria-label*="temporaire" i], [aria-label*="temporal" i]',
    ),
  )
}

export type GeminiBrowseActivity =
  | "gems"
  | "library"
  | "videos"
  | "images"
  | "students"
  | "search"
  | "notebooks"
  | "other"

export type GeminiPage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      startedAt: number
    }
  | { kind: "notebook"; title?: string }
  | { kind: "browse"; activity: GeminiBrowseActivity }

const BROWSE_ACTIVITIES: Record<string, GeminiBrowseActivity> = {
  gems: "gems",
  gem: "gems",
  library: "library",
  videos: "videos",
  images: "images",
  students: "students",
  search: "search",
}

const notebookTitle = (): string => {
  const heading = document.querySelector("h1.gds-display-s")?.textContent
  return (heading ?? "").trim()
}

export const getGeminiPage = (): GeminiPage => {
  const { pathname, search } = document.location
  const parts = pathParts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateGemini(title, pathname, search)
  const first = parts[0] ?? ""

  const browseActivity = BROWSE_ACTIVITIES[first]
  if (browseActivity) {
    return { kind: "browse", activity: browseActivity }
  }

  if (first === "notebooks") {
    return { kind: "browse", activity: "notebooks" }
  }

  if (first === "notebook" && parts[1]) {
    const name = notebookTitle()
    return { kind: "notebook", title: isGenericTitle(name) ? undefined : name }
  }

  if (!first || first === "app") {
    const id = first === "app" ? parts[1] : undefined
    // Without a real conversation id, the page title can still show marketing
    // copy - never trust it as a chat title.
    const conversationTitle = id && !isGenericTitle(title) ? title : undefined
    return {
      kind: "chat",
      title: conversationTitle,
      private: privateChat,
      startedAt: touchSession(id ?? (privateChat ? "temporary" : "app")),
    }
  }

  return { kind: "browse", activity: "other" }
}
