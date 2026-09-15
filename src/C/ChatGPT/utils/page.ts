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
  title.replace(/\s*[-–|]\s*ChatGPT\s*$/i, "").trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanChatGptTitle(og || document.title)
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

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

export type ChatGptPage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      url?: string
      startedAt: number
    }
  | { kind: "browse"; activity: "gpts" | "other" }

export const getChatGptPage = (): ChatGptPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateChatGpt(title, pathname, search)
  const first = segs[0] ?? ""

  if (first === "gpts" || first === "explore" || (first === "g" && !segs[2])) {
    if (first === "gpts" || first === "explore") return { kind: "browse", activity: "gpts" }
  }

  if (!first || first === "c" || first === "g") {
    const id = first === "c" ? segs[1] : first === "g" ? segs[3] || segs[1] : undefined
    const url = id ? href.split("?")[0] : undefined
    return {
      kind: "chat",
      title: isGenericTitle(title) ? undefined : title,
      private: privateChat,
      url,
      startedAt: touchSession(id ?? (privateChat ? "temporary" : "new")),
    }
  }

  return { kind: "browse", activity: first === "gpts" || first === "explore" ? "gpts" : "other" }
}
