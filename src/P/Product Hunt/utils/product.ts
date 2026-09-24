export const findProductName = (): string | undefined =>
  document.querySelector("h1")?.textContent?.trim() || undefined

export const findProductTagline = (): string | undefined =>
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content?.trim() || undefined

export const findProductThumbnail = (): string | undefined =>
  document.querySelector<HTMLImageElement>('img[data-test$="-thumbnail"]')?.src || undefined
