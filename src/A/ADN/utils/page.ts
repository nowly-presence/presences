const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export const cleanAdnTitle = (title: string): string =>
  title
    .replace(/\s*[-–|]\s*ADN\s*$/i, "")
    .replace(/\s*[-–|]\s*Anime Digital Network\s*$/i, "")
    .trim()

export const getVideo = (): HTMLVideoElement | undefined =>
  document.querySelector("video.vjs-tech") ?? document.querySelector("video") ?? undefined

type LdJsonEpisode = {
  name?: string
  thumbnailUrl?: string
  episodeNumber?: number | string
  partOfSeason?: { seasonNumber?: number | string }
  partOfSeries?: { name?: string; url?: string }
}

const parseEpisodeLd = (): LdJsonEpisode | undefined => {
  const raw = document.querySelector('script[type="application/ld+json"]')?.textContent
  if (!raw) return undefined
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data[0] : data
  } catch {
    return undefined
  }
}

const metaContent = (property: string): string | undefined =>
  document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content ?? undefined

const DISCORD_IMAGE_KEY_MAX_LENGTH = 300

export const toDiscordImage = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl?.startsWith("https://")) return undefined
  return imageUrl.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? imageUrl : undefined
}

export const getEpisodeCover = (): string | undefined => {
  const ld = parseEpisodeLd()
  return toDiscordImage(ld?.thumbnailUrl) ?? toDiscordImage(metaContent("og:image"))
}

// ADN's document.title doesn't reliably split series/episode - the page's own
// JSON-LD structured data does, and is far more stable than scraping classes.
export const getWatchInfo = (): {
  series?: string
  episode?: string
  season?: number
  episodeNumber?: number
  seriesUrl?: string
} => {
  const ld = parseEpisodeLd()
  const series = ld?.partOfSeries?.name ?? metaContent("og:title")?.split(" - ")[0]
  const seriesUrl = ld?.partOfSeries?.url
  const season = ld?.partOfSeason?.seasonNumber ? Number(ld.partOfSeason.seasonNumber) : undefined
  const episodeNumber = ld?.episodeNumber ? Number(ld.episodeNumber) : undefined

  let episode = ld?.name?.trim()
  if (episode && series) episode = episode.replace(series, "").replace(/^[\s:\-–—|]+/, "").trim() || undefined
  if (episode && /^[ée]pisode\s*\d+$/i.test(episode)) episode = undefined

  return { series, episode, season, episodeNumber, seriesUrl }
}

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
