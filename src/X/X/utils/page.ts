const RESERVED = new Set([
  "home",
  "explore",
  "notifications",
  "messages",
  "i",
  "settings",
  "search",
  "compose",
  "login",
  "logout",
  "intent",
  "hashtag",
  "tos",
  "privacy",
  "jobs",
  "about",
  "signup",
  "share",
  "following",
  "followers",
])

const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

const DISCORD_IMAGE_KEY_MAX_LENGTH = 300

export const toDiscordImage = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl?.startsWith("https://")) return undefined
  return imageUrl.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? imageUrl : undefined
}

// og:image reflects the profile picture on profile pages and the post's
// media (or a link-preview image) on status pages - a stable source on X's SPA.
export const getPageImage = (): string | undefined =>
  toDiscordImage(document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? undefined)

export type XPage =
  | { kind: "status"; user: string; url: string }
  | { kind: "profile"; user: string; url: string }
  | { kind: "search"; query?: string }
  | { kind: "messages" }
  | { kind: "explore" }
  | { kind: "notifications" }
  | { kind: "bookmarks" }
  | { kind: "likes" }
  | { kind: "lists" }
  | { kind: "settings" }
  | { kind: "home" }
  | { kind: "other" }

export const getXPage = (): XPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const first = segs[0] ?? ""
  const second = segs[1] ?? ""
  const third = segs[2] ?? ""

  if (first === "messages" || (first === "i" && second === "chat")) {
    return { kind: "messages" }
  }

  if (first === "search") {
    return { kind: "search", query: new URLSearchParams(search).get("q") ?? undefined }
  }

  if (first && second === "status" && third) {
    return { kind: "status", user: first, url: href.split("?")[0] ?? href }
  }

  if (first === "explore") return { kind: "explore" }
  if (first === "notifications") return { kind: "notifications" }
  if (first === "settings") return { kind: "settings" }
  if (first === "i" && second === "bookmarks") return { kind: "bookmarks" }
  if (first === "i" && second === "lists") return { kind: "lists" }
  if (second === "likes") return { kind: "likes" }
  if (second === "lists") return { kind: "lists" }

  if (first === "home" || !first) return { kind: "home" }

  if (first && !RESERVED.has(first)) {
    return { kind: "profile", user: first, url: `${location.origin}/${first}` }
  }

  return { kind: "other" }
}
