const LOCALES = new Set([
  "en", "fr", "es", "de", "it", "pt", "nl", "pl", "tr", "sv", "da", "fi", "no", "hu", "cs", "ro", "sk",
])

const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

const stripLocale = (segs: string[]): string[] => {
  const first = segs[0]?.toLowerCase() ?? ""
  if (first.length === 2 && LOCALES.has(first)) return segs.slice(1)
  return segs
}

export const cleanMaxTitle = (title: string): string =>
  title.replace(/\s*[-–|]\s*Max\s*$/i, "").replace(/\s*\|\s*HBO Max\s*$/i, "").trim()

export const getVideo = (): HTMLVideoElement | undefined =>
  document.querySelector("video") ?? undefined

export type MaxPage =
  | { kind: "watch"; title?: string }
  | { kind: "show"; title?: string }
  | { kind: "movie"; title?: string }
  | { kind: "sport"; title?: string }
  | { kind: "genre"; title?: string }
  | { kind: "search" }
  | { kind: "myList" }
  | { kind: "home" }
  | { kind: "other" }

export const getMaxPage = (): MaxPage => {
  const segs = stripLocale(parts(document.location.pathname))
  const first = segs[0] ?? ""
  const second = segs[1] ?? ""
  const title = cleanMaxTitle(document.title)

  if (first === "video" && second === "watch") return { kind: "watch", title }
  if (first === "watch" || first === "player") return { kind: "watch", title }
  if (first === "show" || first === "shows" || first === "series") return { kind: "show", title }
  if (first === "movie" || first === "movies") return { kind: "movie", title }
  if (first === "mini-series") return { kind: "show", title }
  if (first === "sport" || first === "sports") return { kind: "sport", title }
  if (first === "genre" || first === "topic") return { kind: "genre", title }
  if (first === "search") return { kind: "search" }
  if (first === "my-list" || first === "mylist") return { kind: "myList" }
  if (!first || first === "home" || first === "originals") return { kind: "home" }
  return { kind: "other" }
}

export const isWatchPage = (pathname: string): boolean => {
  const segs = stripLocale(parts(pathname))
  return segs.includes("watch") || segs.includes("player")
}
