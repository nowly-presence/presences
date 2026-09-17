const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean)

const cleanLinkedInTitle = (title: string): string =>
  title
    .replace(/\s*\|\s*LinkedIn\s*$/i, "")
    .replace(/\s*[-–]\s*LinkedIn\s*$/i, "")
    .trim()

// LinkedIn ships hashed/obfuscated class names (CSS-in-JS), so class-based
// selectors aren't stable - document.title is the reliable source here.
const profileImage = (): string | undefined =>
  Array.from(document.querySelectorAll<HTMLImageElement>("img"))
    .find((img) => /profile-displayphoto|profile-framedphoto/.test(img.src))
    ?.src

const companyImage = (): string | undefined =>
  Array.from(document.querySelectorAll<HTMLImageElement>("img"))
    .find((img) => /company-logo/.test(img.src))
    ?.src

export type LinkedInPage =
  | { kind: "profile"; name?: string; url: string; image?: string }
  | { kind: "company"; name?: string; url: string; image?: string }
  | { kind: "school"; name?: string; url: string; image?: string }
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
  | { kind: "post"; url: string }
  | { kind: "article"; title?: string }
  | { kind: "games" }
  | { kind: "settings" }
  | { kind: "other" }

export const getLinkedInPage = (): LinkedInPage => {
  const segs = parts(document.location.pathname)
  const title = cleanLinkedInTitle(document.title)
  const first = segs[0] ?? ""

  if (first === "in" && segs[1]) {
    return {
      kind: "profile",
      name: title || segs[1].replace(/-/g, " "),
      url: `${location.origin}/in/${segs[1]}/`,
      image: profileImage(),
    }
  }
  if (first === "company" && segs[1]) {
    return {
      kind: "company",
      name: title || segs[1].replace(/-/g, " "),
      url: `${location.origin}/company/${segs[1]}/`,
      image: companyImage(),
    }
  }
  if (first === "school" && segs[1]) {
    return {
      kind: "school",
      name: title || segs[1].replace(/-/g, " "),
      url: `${location.origin}/school/${segs[1]}/`,
      image: companyImage(),
    }
  }
  if (first === "showcase" && segs[1]) {
    return {
      kind: "company",
      name: title || segs[1].replace(/-/g, " "),
      url: `${location.origin}/showcase/${segs[1]}/`,
      image: companyImage(),
    }
  }
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
  if (first === "games") return { kind: "games" }
  if (first === "mypreferences") return { kind: "settings" }
  if (
    (first === "feed" && (segs[1] === "update" || segs.includes("update")))
    || first === "posts"
  ) {
    return { kind: "post", url: document.location.href.split("?")[0] ?? document.location.href }
  }
  if (first === "pulse") return { kind: "article", title }
  if (!first || first === "feed") return { kind: "feed" }
  return { kind: "other" }
}
