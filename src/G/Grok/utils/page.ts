const GENERIC_TITLES = new Set(["grok", "xai", "grok.com"])
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

export const cleanGrokTitle = (title: string): string =>
  title.replace(/\s*[-–|]\s*Grok\s*$/i, "").trim()

const pageTitle = (): string => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  return cleanGrokTitle(document.title || og || "")
}

const isGenericTitle = (title: string): boolean => !title || GENERIC_TITLES.has(title.toLowerCase())

export const isPrivateGrok = (title: string, pathname: string, search: string): boolean => {
  // The private-chat toggle's filled incognito icon is only visible (no
  // opacity-0) while private chat is the active mode - language-independent,
  // unlike its aria-label text.
  const incognitoFill = document.querySelector<HTMLElement>('[data-testid="pi-incognito-fill"]')
  if (incognitoFill && !incognitoFill.className.includes("opacity-0")) return true
  if (PRIVACY_LABEL.test(`${pathname}${search}`)) return true
  if (PRIVACY_LABEL.test(title)) return true
  return Boolean(
    document.querySelector('[aria-label*="Private" i], [aria-label*="Incognito" i], [aria-label*="Temporary" i]'),
  )
}

const projectTitle = (): string => {
  const heading = document.querySelector("h1.text-center.text-fg-primary")?.textContent
  return (heading ?? "").trim()
}

const activePluginsTab = (): "connectors" | "skills" | undefined => {
  const dialog = document.querySelector('div[data-analytics-name="plugins-dialog"]')
  if (!dialog) return undefined
  const activeTab = dialog.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim().toLowerCase()
  if (!activeTab) return "connectors"
  return activeTab.includes("comp") ? "skills" : "connectors"
}

const isWritingSkill = (): boolean => Boolean(document.querySelector('div[data-analytics-name="write-skill"]'))

export type GrokBrowseActivity =
  | "automations"
  | "library"
  | "media"
  | "projects"
  | "apps"
  | "files"
  | "connectors"
  | "skills"
  | "other"

export type GrokPage =
  | {
      kind: "chat"
      title?: string
      private: boolean
      startedAt: number
    }
  | { kind: "imagine"; editing: boolean }
  | { kind: "project"; title?: string }
  | { kind: "writingSkill" }
  | { kind: "browse"; activity: GrokBrowseActivity }

const LIBRARY_TABS: Record<string, GrokBrowseActivity> = {
  media: "media",
  library: "projects",
  apps: "apps",
  files: "files",
}

export const getGrokPage = (): GrokPage => {
  const { pathname, search } = document.location
  const segs = parts(pathname)
  const title = pageTitle()
  const privateChat = isPrivateGrok(title, pathname, search)
  const first = segs[0] ?? ""

  // Plugins/skills/write-skill are modals that don't change the URL - detect
  // them from the DOM regardless of the current route.
  if (isWritingSkill()) return { kind: "writingSkill" }
  const pluginsTab = activePluginsTab()
  if (pluginsTab) return { kind: "browse", activity: pluginsTab }

  if (first === "imagine") {
    return { kind: "imagine", editing: segs[1] === "post" }
  }

  if (first === "automations") return { kind: "browse", activity: "automations" }

  if (first === "library") {
    const tab = new URLSearchParams(search).get("tab") ?? ""
    return { kind: "browse", activity: LIBRARY_TABS[tab] ?? "library" }
  }

  if (first === "project" && segs[1]) {
    const chatId = new URLSearchParams(search).get("chat")
    if (chatId) {
      return {
        kind: "chat",
        title: !isGenericTitle(title) ? title : undefined,
        private: privateChat,
        startedAt: touchSession(chatId),
      }
    }
    const name = projectTitle()
    return { kind: "project", title: isGenericTitle(name) ? undefined : name }
  }

  if (!first || first === "chat" || first === "c") {
    const id = first === "chat" || first === "c" ? segs[1] : undefined
    return {
      kind: "chat",
      // Without a real conversation id, the page title can still show
      // marketing copy - never trust it as a chat title.
      title: id && !isGenericTitle(title) ? title : undefined,
      private: privateChat,
      startedAt: touchSession(id ?? "new"),
    }
  }

  return { kind: "browse", activity: "other" }
}
