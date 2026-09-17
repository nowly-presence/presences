const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export const cleanSteamTitle = (title: string): string =>
  title
    .replace(/\s*::\s*Steam.*$/i, "")
    .replace(/\s*[-–|]\s*Steam.*$/i, "")
    .replace(/^Steam Community\s*::\s*/i, "")
    .replace(/^Welcome to Steam$/i, "")
    .trim()

const humanize = (value?: string): string | undefined => {
  if (!value) return undefined
  const cleaned = value.replace(/[-_+]/g, " ").replace(/\s+/g, " ").trim()
  return cleaned || undefined
}

export type SteamPage =
  | { kind: "home" }
  | { kind: "app"; title?: string; url: string }
  | { kind: "bundle"; title?: string; url: string }
  | { kind: "package"; title?: string; url: string }
  | { kind: "category"; name?: string }
  | { kind: "charts" }
  | { kind: "news" }
  | { kind: "points" }
  | { kind: "stats" }
  | { kind: "wishlist" }
  | { kind: "specials" }
  | { kind: "demos" }
  | { kind: "search" }
  | { kind: "curator"; name?: string }
  | { kind: "developer"; name?: string }
  | { kind: "publisher"; name?: string }
  | { kind: "franchise"; name?: string }
  | { kind: "community" }
  | { kind: "discussions" }
  | { kind: "market"; title?: string }
  | { kind: "workshop" }
  | { kind: "workshopItem"; title?: string }
  | { kind: "hub"; title?: string }
  | { kind: "group"; title?: string }
  | { kind: "profile"; title?: string }
  | { kind: "other" }

const pageUrl = (href: string): string => href.split("?")[0] ?? href

const storePage = (segs: string[], title: string, href: string): SteamPage => {
  const first = segs[0] ?? ""
  const second = segs[1]

  if (!first || first === "explore") return { kind: "home" }

  if (first === "agecheck" && segs[1] === "app") {
    return { kind: "app", title: title || humanize(segs[3]), url: pageUrl(href) }
  }

  if (first === "app" && second) {
    return { kind: "app", title: title || humanize(segs[2]), url: pageUrl(href) }
  }

  if (first === "bundle" && second) {
    return { kind: "bundle", title: title || humanize(segs[2]), url: pageUrl(href) }
  }

  if (first === "sub" && second) {
    return { kind: "package", title: title || humanize(segs[2]), url: pageUrl(href) }
  }

  if (first === "search") return { kind: "search" }
  if (first === "genre" || first === "category" || first === "tags") {
    return { kind: "category", name: title || humanize(second) }
  }
  if (first === "charts") return { kind: "charts" }
  if (first === "news" || first === "newshub") return { kind: "news" }
  if (first === "points") return { kind: "points" }
  if (first === "stats") return { kind: "stats" }
  if (first === "wishlist") return { kind: "wishlist" }
  if (first === "specials" || first === "sale") return { kind: "specials" }
  if (first === "demos") return { kind: "demos" }
  if (first === "curator") return { kind: "curator", name: title || humanize(segs[2] ?? second) }
  if (first === "developer") return { kind: "developer", name: title || humanize(second) }
  if (first === "publisher") return { kind: "publisher", name: title || humanize(second) }
  if (first === "franchise") return { kind: "franchise", name: title || humanize(second) }

  return { kind: "other" }
}

const communityPage = (segs: string[], title: string): SteamPage => {
  const first = segs[0] ?? ""
  const second = segs[1]

  if (!first) return { kind: "community" }
  if (first === "discussions") return { kind: "discussions" }
  if (first === "market") return { kind: "market", title: title || humanize(segs[3]) }
  if (first === "workshop") return { kind: "workshop" }
  if (first === "sharedfiles") return { kind: "workshopItem", title }
  if (first === "groups" || first === "gid") return { kind: "group", title: title || humanize(second) }
  if (first === "app" && second) return { kind: "hub", title: title || humanize(segs[2] ?? second) }
  if (first === "id" || first === "profiles") {
    return { kind: "profile", title: title || humanize(second) }
  }
  return { kind: "community" }
}

export const getSteamPage = (): SteamPage => {
  const { pathname, href, hostname } = document.location
  const segs = parts(pathname)
  const title = cleanSteamTitle(document.title)

  if (hostname === "store.steampowered.com") return storePage(segs, title, href)
  return communityPage(segs, title)
}

export const isSpecificSteamPage = (page: SteamPage): boolean => page.kind !== "other"
