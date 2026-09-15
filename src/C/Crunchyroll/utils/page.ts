const LOCALES = new Set([
  "en", "fr", "es", "de", "it", "pt", "ru", "ar", "ja", "ko", "hi", "pl", "tr", "nl", "sv", "fi", "uk",
])

const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export const stripLocale = (segs: string[]): string[] => {
  const first = segs[0]?.toLowerCase() ?? ""
  if (!first) return segs
  if (LOCALES.has(first) || first.startsWith("es-") || first.startsWith("pt-")) return segs.slice(1)
  return segs
}

export const cleanCrunchyrollTitle = (title: string): string =>
  title
    .replace(/\s*[-–|]\s*Watch on Crunchyroll.*$/i, "")
    .replace(/\s*[-–|]\s*Crunchyroll.*$/i, "")
    .trim()

export const getVideo = (): HTMLVideoElement | undefined =>
  document.querySelector("video") ?? undefined

export type CrunchyrollPage =
  | { kind: "watch"; title?: string }
  | { kind: "series"; title?: string }
  | { kind: "manga"; title?: string }
  | { kind: "news"; title?: string }
  | { kind: "search" }
  | { kind: "watchlist" }
  | { kind: "history" }
  | { kind: "calendar" }
  | { kind: "games" }
  | { kind: "music" }
  | { kind: "home" }
  | { kind: "other" }

export const getCrunchyrollPage = (): CrunchyrollPage => {
  const segs = stripLocale(parts(document.location.pathname))
  const first = segs[0] ?? ""
  const title = cleanCrunchyrollTitle(document.title)

  if (first === "watch") return { kind: "watch", title }
  if (first === "series") return { kind: "series", title }
  if (first === "comics" || first === "manga") return { kind: "manga", title }
  if (first === "news" || first === "article") return { kind: "news", title }
  if (first === "search") return { kind: "search" }
  if (first === "watchlist" || first === "crunchylists") return { kind: "watchlist" }
  if (first === "history") return { kind: "history" }
  if (first === "simulcastcalendar" || first === "simulcast") return { kind: "calendar" }
  if (first === "games" || first === "game") return { kind: "games" }
  if (first === "music" || first === "artist") return { kind: "music" }
  if (!first || first === "videos" || first === "home") return { kind: "home" }
  return { kind: "other" }
}

export const isWatchPage = (pathname: string): boolean =>
  stripLocale(parts(pathname)).includes("watch")
