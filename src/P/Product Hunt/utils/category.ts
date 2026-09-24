export const findCategoryName = (): string | undefined =>
  document.querySelector("h1")?.textContent?.trim() || undefined
