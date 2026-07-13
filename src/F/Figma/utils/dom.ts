export type FigmaMode = "design" | "figjam" | "slides" | "make" | "buzz" | "sites" | "home" | "other"

const MODE_BY_SEGMENT: Record<string, FigmaMode> = {
  design: "design",
  file: "design",
  board: "figjam",
  slides: "slides",
  make: "make",
  buzz: "buzz",
  sites: "sites",
}

export const getFigmaMode = (pathname: string): FigmaMode => {
  const segments = pathname.split("/").filter(Boolean)
  const first = segments[0]

  if (!first || first === "files") return "home"

  return MODE_BY_SEGMENT[first] ?? "other"
}

export const getFileName = (pathname: string, title: string): string | undefined => {
  const segments = pathname.split("/").filter(Boolean)
  const nameSegment = segments[2]

  if (nameSegment) {
    try {
      const decoded = decodeURIComponent(nameSegment).replace(/-/g, " ").trim()
      if (decoded) return decoded
    } catch {
      // fall through to title-based extraction
    }
  }

  const titleMatch = title.match(/^(.+?)\s+[–-]\s+Figma$/)
  return titleMatch?.[1]?.trim()
}
