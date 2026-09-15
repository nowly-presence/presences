const GENERIC_TITLES = new Set(["le chat", "mistral", "mistral ai", "chat"])
const PRIVACY_LABEL = /private|incognito|temporary|temporaire|privado|priv[ée]/i

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

export const cleanLeChatTitle = (title: string): string =>
  title
    .replace(/\s*[-–|]\s*Le Chat\s*$/i, "")
    .replace(/\s*[-–|]\s*Mistral(?: AI)?\s*$/i, "")
    .trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanLeChatTitle(og || document.title)
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

export const isPrivateLeChat = (title: string, pathname: string, search: string): boolean => {
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  return Boolean(
    document.querySelector(
      '[aria-label*="Private" i], [aria-label*="Incognito" i], [aria-label*="priv" i], [aria-label*="Temporary" i]',
    ),
  )
}

export type LeChatPage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      url?: string
      startedAt: number
    }
  | { kind: "browse" }

export const getLeChatPage = (): LeChatPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateLeChat(title, pathname, search)
  const first = segs[0] ?? ""

  if (!first || first === "chat" || first === "chats") {
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
