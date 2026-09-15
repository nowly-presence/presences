const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean)

export const cleanNotionTitle = (title: string): string =>
  title.replace(/\s*[-–|]\s*Notion\s*$/i, "").trim()

export type NotionPage =
  | { kind: "page"; title?: string }
  | { kind: "templates" }
  | { kind: "calendar" }
  | { kind: "home" }
  | { kind: "settings" }
  | { kind: "search" }
  | { kind: "other" }

const SKIP = new Set(["login", "signup", "onboarding", "product", "pricing", "enterprise", "help", "about"])

export const getNotionPage = (): NotionPage => {
  const segs = parts(document.location.pathname)
  const first = segs[0] ?? ""
  const title = cleanNotionTitle(document.title)
  const search = document.location.search

  if (first === "templates" || first === "template") return { kind: "templates" }
  if (first === "calendar") return { kind: "calendar" }
  if (first === "search" || search.includes("s=")) return { kind: "search" }
  if (first === "settings" || pathnameHasSettings(segs)) return { kind: "settings" }
  if (!first || first === "home") return { kind: "home" }
  if (SKIP.has(first)) return { kind: "other" }

  const last = segs[segs.length - 1] ?? ""
  if (last.length > 8 && title && title.toLowerCase() !== "notion") return { kind: "page", title }
  if (last.length > 8) return { kind: "page", title: title || undefined }
  return { kind: "other" }
}

const pathnameHasSettings = (segs: string[]): boolean =>
  segs.includes("settings") || segs.includes("preferences")
