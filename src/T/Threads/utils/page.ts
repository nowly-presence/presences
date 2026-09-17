const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

const DISCORD_IMAGE_KEY_MAX_LENGTH = 300

export const toDiscordImage = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl?.startsWith("https://")) return undefined
  return imageUrl.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? imageUrl : undefined
}

// og:image reflects the profile picture on profile pages and the media
// thumbnail on post pages - a stable source across Threads' SPA.
export const getPageImage = (): string | undefined =>
  toDiscordImage(document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? undefined)

export type ThreadsPage =
  | { kind: "post"; url: string }
  | { kind: "profile"; user: string; url: string }
  | { kind: "search"; query?: string }
  | { kind: "following" }
  | { kind: "saved" }
  | { kind: "liked" }
  | { kind: "activity" }
  | { kind: "home" }
  | { kind: "other" }

export const getThreadsPage = (): ThreadsPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const first = segs[0] ?? ""
  const second = segs[1] ?? ""

  if (first === "search") {
    return { kind: "search", query: new URLSearchParams(search).get("q") ?? second }
  }

  if (first === "following") return { kind: "following" }
  if (first === "saved") return { kind: "saved" }
  if (first === "liked") return { kind: "liked" }
  if (first === "activity") return { kind: "activity" }

  if (first === "t" && second) {
    return { kind: "post", url: href.split("?")[0] ?? href }
  }

  if (first.startsWith("@") || (first && second === "post")) {
    const user = first.replace(/^@/, "")
    if (second === "post" || segs[2] === "post") {
      return { kind: "post", url: href.split("?")[0] ?? href }
    }
    return { kind: "profile", user, url: `${location.origin}/@${user}` }
  }

  if (!first) return { kind: "home" }
  return { kind: "other" }
}
