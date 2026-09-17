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

const metaContent = (property: string): string | undefined =>
  document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content ?? undefined

const DISCORD_IMAGE_KEY_MAX_LENGTH = 300

export const toDiscordImage = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl?.startsWith("https://")) return undefined
  return imageUrl.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? imageUrl : undefined
}

// Crunchyroll exposes the episode's cover via og:image.
export const getEpisodeCover = (): string | undefined => toDiscordImage(metaContent("og:image"))

// The series page link is rendered above the episode title as `.show-title-link`.
export const getSeriesUrl = (): string | undefined =>
  document.querySelector<HTMLAnchorElement>(".show-title-link")?.href || undefined

type LdJsonEpisode = {
  "@id"?: string
  episodeNumber?: number
  partOfSeason?: { seasonNumber?: number }
}

// The show/episode names and season/episode numbers aren't reliably reflected
// in document.title on this SPA - read the live DOM and the page's own
// structured data (JSON-LD) instead.
export const getWatchInfo = (): { show?: string; episode?: string; season?: number; episodeNumber?: number } => {
  const show = document.querySelector("a > h4")?.textContent?.trim() || undefined
  let episode = document.querySelector("h1.title")?.textContent?.trim() || undefined

  let season: number | undefined
  let episodeNumber: number | undefined
  for (const script of document.head?.querySelectorAll('script[type="application/ld+json"]') ?? []) {
    try {
      const json = JSON.parse(script.innerHTML) as LdJsonEpisode
      if (json?.["@id"]) {
        episodeNumber = json.episodeNumber
        season = json.partOfSeason?.seasonNumber
        break
      }
    } catch {
      // Ignore malformed structured data.
    }
  }

  if (season !== undefined && episodeNumber !== undefined) {
    episode = episode?.replace(`E${episodeNumber} - `, "")
  }

  return { show, episode, season, episodeNumber }
}

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
