const RESERVED = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "direct",
  "explore",
  "accounts",
  "tv",
  "about",
  "developer",
  "legal",
  "lite",
  "nametag",
])

const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export type InstagramPage =
  | { kind: "post"; url: string }
  | { kind: "reel"; url: string }
  | { kind: "story"; user?: string }
  | { kind: "profile"; user: string; url: string }
  | { kind: "messages" }
  | { kind: "explore" }
  | { kind: "home" }
  | { kind: "other" }

export const getInstagramPage = (): InstagramPage => {
  const { pathname, href } = document.location
  const segs = parts(pathname)
  const first = segs[0] ?? ""
  const second = segs[1] ?? ""

  if (first === "direct") return { kind: "messages" }
  if (first === "p" && second) return { kind: "post", url: href.split("?")[0] ?? href }
  if ((first === "reel" || first === "reels") && second) return { kind: "reel", url: href.split("?")[0] ?? href }
  if (first === "stories") return { kind: "story", user: second || undefined }
  if (first === "explore") return { kind: "explore" }
  if (!first) return { kind: "home" }
  if (!RESERVED.has(first)) {
    return { kind: "profile", user: first, url: `${location.origin}/${first}` }
  }
  return { kind: "other" }
}
