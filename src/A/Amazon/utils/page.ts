const cleanAmazonTitle = (title: string): string =>
  title
    .replace(/\s*:\s*Amazon\..*$/i, "")
    .replace(/\s*[-–|]\s*Amazon\..*$/i, "")
    .replace(/\s*Amazon\.(com|fr|de|co\.uk|es|it|ca|co\.jp|in|nl|com\.au|com\.be).*$/i, "")
    .trim()

const humanize = (value?: string): string | undefined => {
  if (!value) return undefined
  const cleaned = decodeURIComponent(value).replace(/[-_+]/g, " ").replace(/\s+/g, " ").trim()
  return cleaned || undefined
}

const DISCORD_IMAGE_KEY_MAX_LENGTH = 300

export const toDiscordImage = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl?.startsWith("https://")) return undefined
  const withoutQuery = imageUrl.split("?")[0] ?? imageUrl
  const candidate = withoutQuery.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? withoutQuery : imageUrl
  return candidate.length <= DISCORD_IMAGE_KEY_MAX_LENGTH ? candidate : undefined
}

export const getAmazonProductImage = (): string | undefined => {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
  const fromOg = toDiscordImage(og)
  if (fromOg) return fromOg

  const landing = document.querySelector<HTMLImageElement>("#landingImage, #imgBlkFront, #main-image, #ivLargeImage img")
  const src = landing?.getAttribute("data-old-hires") || landing?.currentSrc || landing?.src
  return toDiscordImage(src)
}

export type AmazonPage =
  | { kind: "product"; title?: string; url: string }
  | { kind: "search" }
  | { kind: "cart" }
  | { kind: "wishlist" }
  | { kind: "orders" }
  | { kind: "deals" }
  | { kind: "bestsellers" }
  | { kind: "store"; name?: string }
  | { kind: "category"; name?: string }
  | { kind: "home" }
  | { kind: "other" }

export const getAmazonPage = (): AmazonPage => {
  const { pathname, search } = document.location
  const title = cleanAmazonTitle(document.title)
  const segs = pathname.split("/").filter(Boolean)
  const path = pathname.toLowerCase()

  if (/\/(?:gp\/product|dp|gp\/aw\/d)\//i.test(pathname)) {
    const productTitle = title && title.length > 1 && !/^amazon/i.test(title) ? title : undefined
    return { kind: "product", title: productTitle, url: document.location.href.split("?")[0] ?? document.location.href }
  }

  if ((pathname === "/s" || pathname.startsWith("/s/")) && (search.includes("k=") || search.includes("i="))) {
    return { kind: "search" }
  }

  if (path.includes("/cart") || path.includes("/gp/cart") || path.includes("/gp/aw/c")) return { kind: "cart" }
  if (path.includes("wishlist") || path.includes("/gp/registry") || path.includes("/hz/wishlist")) return { kind: "wishlist" }
  if (path.includes("order-history") || path.includes("/gp/css/order") || path.includes("/your-orders")) return { kind: "orders" }
  if (path.includes("/deals") || path.includes("goldbox") || path.includes("/gp/goldbox") || path.includes("todaysdeals")) {
    return { kind: "deals" }
  }
  if (path.includes("bestsellers") || path.includes("new-releases") || path.includes("movers-and-shakers")) {
    return { kind: "bestsellers" }
  }
  if (path.includes("/stores/") || segs[0] === "stores") return { kind: "store", name: title || humanize(segs[1]) }
  if (path.includes("/gp/browse") || path.includes("/b/") || segs[0] === "b") {
    return { kind: "category", name: title }
  }
  if (!segs.length) return { kind: "home" }
  return { kind: "other" }
}
