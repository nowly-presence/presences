const GENERIC_TITLES = new Set(["vibe", "le chat", "mistral", "mistral ai", "chat"])
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

export const cleanVibeTitle = (title: string): string =>
  title
    .replace(/\s*[-–|]\s*Vibe\s*$/i, "")
    .replace(/\s*[-–|]\s*Le Chat\s*$/i, "")
    .replace(/\s*[-–|]\s*Mistral(?: AI)?\s*$/i, "")
    .trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanVibeTitle(document.title || og || "")
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

export const isPrivateVibe = (title: string, pathname: string, search: string): boolean => {
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  return Boolean(
    document.querySelector(
      '[aria-label*="Private" i], [aria-label*="Incognito" i], [aria-label*="priv" i], [aria-label*="Temporary" i]',
    ),
  )
}

const connectorTitle = (): string => (document.querySelector("h1")?.textContent ?? "").trim()

// The instructions dialog has a stable form id regardless of UI language.
const isInstructionsOpen = (): boolean => Boolean(document.querySelector("form#instructions-form"))

export type VibeBrowseActivity =
  | "work"
  | "code"
  | "codeExtensions"
  | "memories"
  | "connectors"
  | "libraries"
  | "agents"
  | "agentsShared"
  | "agentsMine"
  | "skills"
  | "knowledge"
  | "tasks"
  | "other"

export type VibePage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      startedAt: number
    }
  | { kind: "project"; title?: string }
  | { kind: "connector"; title?: string }
  | { kind: "library"; title?: string }
  | { kind: "instructions" }
  | { kind: "browse"; activity: VibeBrowseActivity }

export const getVibePage = (): VibePage => {
  const { pathname, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateVibe(title, pathname, search)
  const first = segs[0] ?? ""

  // The instructions dialog can open on top of any page - detect it from the
  // DOM regardless of the current route.
  if (isInstructionsOpen()) return { kind: "instructions" }

  if (first === "chat" && segs[1] === "projects" && segs[2]) {
    return { kind: "project", title: isGenericTitle(title) ? undefined : title }
  }

  if (!first || first === "chat" || first === "chats") {
    const id = first === "chat" || first === "chats" ? segs[1] : undefined
    return {
      kind: "chat",
      // Without a real conversation id, the page title can still show
      // marketing copy - never trust it as a chat title.
      title: id && !isGenericTitle(title) ? title : undefined,
      private: privateChat,
      startedAt: touchSession(id ?? "new"),
    }
  }

  if (first === "work") return { kind: "browse", activity: "work" }

  if (first === "code") {
    return { kind: "browse", activity: segs[1] === "extensions" ? "codeExtensions" : "code" }
  }

  if (first === "memories") return { kind: "browse", activity: "memories" }

  if (first === "connections") {
    if (segs[1]) {
      const name = connectorTitle()
      return { kind: "connector", title: isGenericTitle(name) ? undefined : name }
    }
    return { kind: "browse", activity: "connectors" }
  }

  if (first === "libraries") {
    if (segs[1]) return { kind: "library", title: isGenericTitle(title) ? undefined : title }
    return { kind: "browse", activity: "libraries" }
  }

  if (first === "agents") {
    const tab = new URLSearchParams(search).get("tab")
    if (tab === "shared") return { kind: "browse", activity: "agentsShared" }
    if (tab === "mine") return { kind: "browse", activity: "agentsMine" }
    return { kind: "browse", activity: "agents" }
  }

  if (first === "skills") return { kind: "browse", activity: "skills" }
  if (first === "knowledge") return { kind: "browse", activity: "knowledge" }
  if (first === "tasks") return { kind: "browse", activity: "tasks" }

  return { kind: "browse", activity: "other" }
}
