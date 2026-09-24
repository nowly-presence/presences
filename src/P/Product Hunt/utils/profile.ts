export const findProfileName = (): string | undefined =>
  document.querySelector("h1")?.textContent?.trim() || undefined

export const findProfileAvatar = (): string | undefined =>
  document.querySelector<HTMLImageElement>("img.rounded-full")?.src || undefined
