const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export type ThreadsPage =
  | { kind: "post"; url: string }
  | { kind: "profile"; user: string; url: string }
  | { kind: "search"; query?: string }
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
