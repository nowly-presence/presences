const mapThumbnailPattern = /\/maps\/([^/]+)\/thumbnail/

let rememberedMapId: string | undefined

const readMapId = (selector: string): string | undefined => {
  for (const image of document.querySelectorAll<HTMLImageElement>(selector)) {
    const id = image.getAttribute("src")?.match(mapThumbnailPattern)?.[1]

    if (id) return id
  }

  return undefined
}

// The solo menu marks its chosen map card; the lobby modals show the lobby's map.
// Only open modals count: a closing one resets its selection.
export const getMenuMapId = (): string | undefined =>
  readMapId('single-player-modal:not(.hidden) [aria-selected="true"] img[src*="/maps/"]') ??
  readMapId('host-lobby-modal:not(.hidden) img[src*="/maps/"]') ??
  readMapId('join-lobby-modal:not(.hidden) img[src*="/maps/"]')

// Games never name their map to the page, so the menu choice is remembered until the game ends.
export const trackMenuSelection = (): void => {
  const id = getMenuMapId()
  if (id) rememberedMapId = id
}

export const getRememberedMapId = (): string | undefined => rememberedMapId

export const forgetMenuSelection = (): void => {
  rememberedMapId = undefined
}

// A fast pick-then-start would slip between two updates.
document.addEventListener("click", () => window.setTimeout(trackMenuSelection, 100), true)
