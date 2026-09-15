const DISCORD_IMAGE_KEY_MAX_LENGTH = 300

export const cleanWikipediaTitle = (title: string): string =>
  title.replace(/\s*[-–—]\s*Wikip[eé]dia.*$/i, "").trim()

const absoluteHttps = (src?: string): string | undefined => {
  if (!src) return undefined
  if (src.startsWith("//")) return `https:${src}`
  if (src.startsWith("https://")) return src
  return undefined
}

const toDiscordImage = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined
  const withoutQuery = imageUrl.split("?")[0] ?? imageUrl
  const candidate = withoutQuery.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? withoutQuery : imageUrl
  return candidate.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? candidate : undefined
}

const isLeadPhoto = (src: string): boolean =>
  !/\.svg($|\?)/i.test(src)
  && !/wikipedia[-_]?logo|wikimedia-logo|wiki\.png/i.test(src)

export const getWikipediaLeadImage = (): string | undefined => {
  const candidates = document.querySelectorAll<HTMLImageElement>(
    ".infobox-image img, .infobox img.mw-file-element, table.infobox a.image img, .infobox img",
  )

  for (const img of candidates) {
    const width = img.naturalWidth || Number(img.getAttribute("width")) || 0
    if (width > 0 && width < 80) continue
    const image = toDiscordImage(absoluteHttps(img.currentSrc || img.src))
    if (image && isLeadPhoto(image)) return image
  }

  const og = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
  const fromOg = toDiscordImage(absoluteHttps(og))
  if (fromOg && isLeadPhoto(fromOg)) return fromOg
  return undefined
}

export const pageUrl = (): string =>
  document.location.href.split("?")[0] ?? document.location.href

const wikiSlug = (): string | undefined => {
  const segs = document.location.pathname.split("/").filter(Boolean)
  const wikiIndex = segs.indexOf("wiki")
  if (wikiIndex === -1) return undefined
  return segs[wikiIndex + 1]
}

export type WikipediaPage =
  | { kind: "article"; title: string }
  | { kind: "category"; title?: string }
  | { kind: "search" }
  | { kind: "portal"; title?: string }
  | { kind: "file"; title?: string }
  | { kind: "talk"; title?: string }
  | { kind: "special"; title?: string }
  | { kind: "home" }
  | { kind: "other" }

export const getWikipediaPage = (): WikipediaPage => {
  const { pathname, search } = document.location
  const slug = wikiSlug()
  const title = cleanWikipediaTitle(document.title)

  if (pathname.includes("/w/index.php") && new URLSearchParams(search).has("search")) return { kind: "search" }
  if (!slug) return pathname.endsWith("/wiki/") || pathname.endsWith("/wiki") ? { kind: "home" } : { kind: "other" }

  const decoded = decodeURIComponent(slug.replace(/_/g, " "))
  if (slug === "Main_Page" || slug === "Portada" || slug === "Accueil" || slug.startsWith("Wikipédia:Accueil") || slug.startsWith("Wikipedia:Main")) {
    return { kind: "home" }
  }
  if (slug.startsWith("Special:") || slug.startsWith("Spécial:") || slug.startsWith("Especial:")) {
    if (/search|recherche|buscar/i.test(slug)) return { kind: "search" }
    return { kind: "special", title: title || decoded }
  }
  if (slug.startsWith("Category:") || slug.startsWith("Catégorie:") || slug.startsWith("Categoría:")) {
    return { kind: "category", title: title || decoded }
  }
  if (slug.startsWith("Portal:") || slug.startsWith("Portail:")) return { kind: "portal", title: title || decoded }
  if (slug.startsWith("File:") || slug.startsWith("Fichier:") || slug.startsWith("Archivo:")) {
    return { kind: "file", title: title || decoded }
  }
  if (slug.startsWith("Talk:") || slug.startsWith("Discussion:") || slug.startsWith("Discusión:")) {
    return { kind: "talk", title: title || decoded }
  }

  return { kind: "article", title: title && !/wikip/i.test(title) ? title : decoded }
}
