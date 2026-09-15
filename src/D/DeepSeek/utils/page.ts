const GENERIC_TITLES = new Set(["deepseek", "chat", "new chat"])
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

export const cleanDeepSeekTitle = (title: string): string =>
  title.replace(/\s*[-–|]\s*DeepSeek\s*$/i, "").trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanDeepSeekTitle(og || document.title)
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

export const isPrivateDeepSeek = (title: string, pathname: string, search: string): boolean => {
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  return Boolean(
    document.querySelector('[aria-label*="Incognito" i], [aria-label*="Temporary" i], [aria-label*="incognito" i]'),
  )
}

export type DeepSeekPage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      url?: string
      startedAt: number
    }
  | { kind: "browse" }

export const getDeepSeekPage = (): DeepSeekPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateDeepSeek(title, pathname, search)

  const chatIndex = segs.findIndex((part) => part === "s" || part === "chat")
  const id = chatIndex >= 0 ? segs[chatIndex + 1] : segs[0]

  if (!segs.length || segs[0] === "a" || segs.includes("chat") || segs.includes("s")) {
    return {
      kind: "chat",
      title: isGenericTitle(title) ? undefined : title,
      private: privateChat,
      url: id && id !== "a" && id !== "chat" && id !== "s" ? href.split("?")[0] : undefined,
      startedAt: touchSession(id ?? "new"),
    }
  }

  return { kind: "browse" }
}
