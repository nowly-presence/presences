import { withImgixSize } from "./image"

export const findProfileName = (): string | undefined =>
  document.querySelector("h1")?.textContent?.trim() || undefined

export const findProfileAvatar = (): string | undefined => {
  const src = document.querySelector<HTMLImageElement>("img.rounded-full")?.src
  return src ? withImgixSize(src, 300) : undefined
}
