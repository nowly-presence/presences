const parts = (pathname: string): string[] =>
  pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part))

export const cleanHboMaxTitle = (title: string): string =>
  title.replace(/\s*[-–|]\s*HBO Max\s*$/i, "").replace(/\s*[-–|]\s*Max\s*$/i, "").trim()

export const getVideo = (): HTMLVideoElement | undefined =>
  document.querySelector("video") ?? undefined

export type HboMaxPage =
  | { kind: "watch"; title?: string }
  | { kind: "show"; title?: string }
  | { kind: "movie"; title?: string }
  | { kind: "search" }
  | { kind: "myList" }
  | { kind: "home" }
  | { kind: "other" }

export const getHboMaxPage = (): HboMaxPage => {
  const segs = parts(document.location.pathname)
  const first = segs[0] ?? ""
  const title = cleanHboMaxTitle(document.title)

  if (first === "video") return { kind: "watch", title }
  if (first === "show") return { kind: "show", title }
  if (first === "movie") return { kind: "movie", title }
  if (first === "search") return { kind: "search" }
  if (first === "my-list") return { kind: "myList" }
  if (!first || first === "home") return { kind: "home" }
  return { kind: "other" }
}

export const isWatchPage = (pathname: string): boolean => parts(pathname)[0] === "video"
