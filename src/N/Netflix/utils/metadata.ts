import { createCachedImageProxyUrl } from "@nowly/sdk"

// Netflix exposes a same-origin member API that returns rich metadata for a
// given video id. Presences run as content scripts on netflix.com, so this
// fetch is same-origin and carries the user's session - far more reliable than
// scraping the obfuscated player DOM.
const METADATA_ENDPOINT = "https://www.netflix.com/nq/website/memberapi/release/metadata?movieid="

export type NetflixBoxart = { w: number; h: number; url: string }

export type NetflixEpisode = {
  episodeId: number
  seq: number
  title: string
  synopsis: string
}

export type NetflixSeason = {
  seq: number
  episodes: NetflixEpisode[]
}

export type NetflixVideo = {
  id: number
  title: string
  synopsis?: string
  type: "show" | "movie"
  boxart?: NetflixBoxart[]
  // show only
  currentEpisode?: number
  seasons?: NetflixSeason[]
  // movie only
  year?: number
  runtime?: number
}

export type NetflixMetadata = { video: NetflixVideo }

// Pull the numeric video id from any Netflix URL shape.
export const getVideoId = (href: string): string | null => {
  const match
    = href.match(/\/watch\/(\d+)/)
    ?? href.match(/\/title\/(\d+)/)
    ?? href.match(/[?&]jbv=(\d+)/)
  return match?.[1] ?? null
}

const RETRY_DELAY_MS = 15_000

let cache: { url: string; data?: NetflixMetadata; failedAt?: number } | null = null
let pending: Promise<void> | null = null

// Fetch once per URL, serialized so rapid UpdateData ticks don't spam the API.
export const fetchMetadata = async (id: string): Promise<NetflixMetadata | undefined> => {
  const url = document.location.href

  if (cache?.url === url && (cache.data || (cache.failedAt && Date.now() - cache.failedAt < RETRY_DELAY_MS))) return cache.data

  if (!pending) {
    cache = { url }
    pending = fetch(`${METADATA_ENDPOINT}${id}`)
      .then(res => (res.ok ? res.json() : undefined))
      .then((data: NetflixMetadata | undefined) => {
        if (cache?.url !== url) return
        if (data?.video) cache.data = data
        else cache.failedAt = Date.now()
      })
      .catch(() => {
        if (cache?.url === url) cache.failedAt = Date.now()
      })
      .finally(() => {
        pending = null
      })
  }

  await pending
  return cache?.data
}

export const clearMetadata = (): void => {
  cache = null
}

// Discord can't hotlink Netflix's boxart CDN directly, so route it through the proxy.
// Several boxart sizes are listed; try the ones closest to the card size and
// fall back to the next candidate when the proxy rejects one.
const TARGET_BOXART_WIDTH = 480
const MAX_BOXART_ATTEMPTS = 3

export const getBoxart = async (video: NetflixVideo | undefined): Promise<string | undefined> => {
  const candidates = (video?.boxart ?? [])
    .filter(art => typeof art?.url === "string" && art.url.startsWith("https://"))
    .sort((a, b) => Math.abs((a.w || 0) - TARGET_BOXART_WIDTH) - Math.abs((b.w || 0) - TARGET_BOXART_WIDTH))
    .slice(0, MAX_BOXART_ATTEMPTS)

  for (const art of candidates) {
    const proxied = await createCachedImageProxyUrl("netflix", art.url)
    if (proxied) return proxied
  }
  return undefined
}

export const findCurrentEpisode = (
  video: NetflixVideo,
): { season: NetflixSeason; episode: NetflixEpisode } | null => {
  const season = video.seasons?.find(s =>
    s.episodes.some(e => e.episodeId === video.currentEpisode),
  )
  const episode = season?.episodes.find(e => e.episodeId === video.currentEpisode)
  return season && episode ? { season, episode } : null
}
