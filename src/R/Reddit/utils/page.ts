const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export type RedditPage =
  | { kind: "post"; subreddit: string; url: string }
  | { kind: "subreddit"; subreddit: string; url: string }
  | { kind: "profile"; user: string }
  | { kind: "search"; query?: string }
  | { kind: "messages" }
  | { kind: "home" }
  | { kind: "other" }

export const getRedditPage = (): RedditPage => {
  const { pathname, href, search } = document.location
  const segs = parts(pathname)
  const first = segs[0] ?? ""
  const second = segs[1] ?? ""
  const third = segs[2] ?? ""

  if (first === "message" || first === "chat" || first === "mail") return { kind: "messages" }
  if (first === "search") {
    return { kind: "search", query: new URLSearchParams(search).get("q") ?? undefined }
  }
  if ((first === "user" || first === "u") && second) {
    return { kind: "profile", user: second }
  }
  if ((first === "r" || first === "r") && second) {
    if (third === "comments" || segs.includes("comments")) {
      return { kind: "post", subreddit: second, url: href.split("?")[0] ?? href }
    }
    return { kind: "subreddit", subreddit: second, url: `${location.origin}/r/${second}` }
  }
  if (!first || first === "home" || first === "popular" || first === "all") return { kind: "home" }
  return { kind: "other" }
}
