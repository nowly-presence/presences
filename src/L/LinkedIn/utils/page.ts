const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean)

const cleanLinkedInTitle = (title: string): string =>
  title
    .replace(/\s*\|\s*LinkedIn\s*$/i, "")
    .replace(/\s*[-–]\s*LinkedIn\s*$/i, "")
    .trim()

export type LinkedInPage =
  | { kind: "profile"; name?: string }
  | { kind: "company"; name?: string }
  | { kind: "school"; name?: string }
  | { kind: "jobs" }
  | { kind: "job"; title?: string }
  | { kind: "messaging" }
  | { kind: "feed" }
  | { kind: "search" }
  | { kind: "notifications" }
  | { kind: "network" }
  | { kind: "learning" }
  | { kind: "groups"; name?: string }
  | { kind: "events"; name?: string }
  | { kind: "post" }
  | { kind: "article"; title?: string }
  | { kind: "other" }

export const getLinkedInPage = (): LinkedInPage => {
  const segs = parts(document.location.pathname)
  const title = cleanLinkedInTitle(document.title)
  const first = segs[0] ?? ""

  if (first === "in" && segs[1]) return { kind: "profile", name: title || segs[1] }
  if (first === "company" && segs[1]) return { kind: "company", name: title || segs[1].replace(/-/g, " ") }
  if (first === "school" && segs[1]) return { kind: "school", name: title || segs[1].replace(/-/g, " ") }
  if (first === "showcase" && segs[1]) return { kind: "company", name: title || segs[1].replace(/-/g, " ") }
  if (first === "jobs") {
    if (segs[1] === "view") return { kind: "job", title }
    return { kind: "jobs" }
  }
  if (first === "messaging") return { kind: "messaging" }
  if (first === "search") return { kind: "search" }
  if (first === "notifications") return { kind: "notifications" }
  if (first === "mynetwork") return { kind: "network" }
  if (first === "learning") return { kind: "learning" }
  if (first === "groups") return { kind: "groups", name: title }
  if (first === "events") return { kind: "events", name: title }
  if (first === "feed" && (segs[1] === "update" || segs.includes("update"))) return { kind: "post" }
  if (first === "posts" || first === "pulse") return { kind: "article", title }
  if (!first || first === "feed") return { kind: "feed" }
  return { kind: "other" }
}
