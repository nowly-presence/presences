import { withImgixSize } from "./image"

export const findProductName = (): string | undefined =>
  document.querySelector("h1")?.textContent?.trim() || undefined

export const findProductTagline = (): string | undefined =>
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content?.trim() || undefined

// Product Hunt's own data-test attribute says "-thumbnail" but this is the square app logo/icon next to the h1, not a banner.
export const findProductLogo = (): string | undefined => {
  const src = document.querySelector<HTMLImageElement>('img[data-test$="-thumbnail"]')?.src
  return src ? withImgixSize(src, 300) : undefined
}
