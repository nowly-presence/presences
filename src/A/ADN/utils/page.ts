const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export const cleanAdnTitle = (title: string): string =>
  title
    .replace(/\s*[-–|]\s*ADN\s*$/i, "")
    .replace(/\s*[-–|]\s*Anime Digital Network\s*$/i, "")
    .trim()

export const getVideo = (): HTMLVideoElement | undefined =>
  document.querySelector("video") ?? undefined

export type AdnPage =
  | { kind: "watch"; title?: string }
  | { kind: "series"; title?: string }
  | { kind: "catalog"; name?: string }
  | { kind: "search" }
  | { kind: "schedule" }
  | { kind: "simulcast" }
  | { kind: "movies" }
  | { kind: "watchlist" }
  | { kind: "home" }
  | { kind: "other" }

export const getAdnPage = (): AdnPage => {
  const segs = parts(document.location.pathname)
  const first = segs[0] ?? ""
  const title = cleanAdnTitle(document.title)

  if (first === "video" && segs.length >= 3) return { kind: "watch", title }
  if (first === "video") return { kind: "series", title }
  if (first === "catalogue" || first === "catalog") return { kind: "catalog", name: title || segs[1]?.replace(/-/g, " ") }
  if (first === "recherche" || first === "search") return { kind: "search" }
  if (first === "planning" || first === "calendrier") return { kind: "schedule" }
  if (first === "simulcast") return { kind: "simulcast" }
  if (first === "films" || first === "movies") return { kind: "movies" }
  if (first === "ma-liste" || first === "watchlist" || first === "favoris") return { kind: "watchlist" }
  if (!first) return { kind: "home" }
  return { kind: "other" }
}

export const isWatchPage = (pathname: string): boolean => {
  const segs = parts(pathname)
  return segs[0] === "video" && segs.length >= 3
}
