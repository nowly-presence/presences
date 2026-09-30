export type ChessPageKind = "game" | "puzzle" | "analysis" | "lesson" | "profile" | "other"

export const getChessPageKind = (pathname: string): ChessPageKind => {
  if (/\/(?:game|daily|live)\//.test(pathname)) return "game"
  if (pathname.includes("/puzzles")) return "puzzle"
  if (pathname.includes("/analysis")) return "analysis"
  if (pathname.includes("/lessons") || pathname.includes("/learn")) return "lesson"
  if (/\/member\//.test(pathname)) return "profile"
  return "other"
}

export const getChessPageTitle = (): string | undefined =>
  document.querySelector<HTMLElement>("h1")?.textContent?.trim()
  || document.querySelector<HTMLElement>(".game-over-header, .game-title, .title-wrapper")?.textContent?.trim()

export const getChessOpponent = (): string | undefined =>
  document.querySelector<HTMLElement>("[data-cy='opponent-name'], .player-tagline")?.textContent?.trim()

export const getChessProfileName = (): string | undefined =>
  document.querySelector<HTMLElement>(".username, h1")?.textContent?.trim()

export const getChessProfileImage = (): string | undefined => {
  const avatar = document.querySelector<HTMLImageElement>(".profile-avatar img, .avatar img")
  return avatar?.src?.startsWith("https://") ? avatar.src : undefined
}
