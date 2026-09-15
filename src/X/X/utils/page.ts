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

export type XPage =
  | { kind: "status"; user: string; url: string }
  | { kind: "profile"; user: string; url: string }
  | { kind: "search"; query?: string }
  | { kind: "messages" }
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

  if (first === "home" || !first) return { kind: "home" }

  if (first && !RESERVED.has(first)) {
    return { kind: "profile", user: first, url: `${location.origin}/${first}` }
  }

  return { kind: "other" }
}
