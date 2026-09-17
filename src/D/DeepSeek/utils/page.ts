const GENERIC_TITLES = new Set(["deepseek", "chat", "new chat"])

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
  return cleanDeepSeekTitle(document.title || og || "")
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

export type DeepSeekPage =
  | {
      kind: "chat"
      title?: string
      startedAt: number
    }
  | { kind: "browse" }

export const getDeepSeekPage = (): DeepSeekPage => {
  const { pathname } = document.location
  const segs = parts(pathname)
  const title = pageTitle()

  // Real conversations live at /a/chat/s/<id> - the id always follows "s".
  const sIndex = segs.indexOf("s")
  const id = sIndex >= 0 ? segs[sIndex + 1] : undefined

  if (!segs.length || segs[0] === "a" || segs.includes("chat") || segs.includes("s")) {
    return {
      kind: "chat",
      // Without a real conversation id, the page title is DeepSeek's marketing
      // tagline ("DeepSeek - Into the Unknown"), never an actual chat title.
      title: id && !isGenericTitle(title) ? title : undefined,
      startedAt: touchSession(id ?? "new"),
    }
  }

  return { kind: "browse" }
}
