export type ChessPageKind =
  | "game"
  | "puzzle"
  | "analysis"
  | "lesson"
  | "profile"
  | "watch"
  | "events"
  | "tv"
  | "streamers"
  | "settings"
  | "other"

export const getChessPageKind = (pathname: string): ChessPageKind => {
  if (/\/(?:game|live)\//.test(pathname) || /^\/daily(?:\/|$)/.test(pathname) || pathname.startsWith("/play/online")) return "game"
  if (pathname.includes("/puzzles")) return "puzzle"
  if (pathname.includes("/analysis")) return "analysis"
  if (pathname.includes("/lessons") || pathname.includes("/learn")) return "lesson"
  if (pathname === "/watch" || pathname.startsWith("/watch/")) return "watch"
  if (pathname === "/events" || pathname.startsWith("/events/")) return "events"
  if (pathname === "/tv" || pathname.startsWith("/tv/")) return "tv"
  if (pathname === "/streamers" || pathname.startsWith("/streamers/")) return "streamers"
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return "settings"
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
