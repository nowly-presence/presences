import { getPathSegments } from "./dom"
import type enUS from "../locales/en-US.json"

const RESERVED_GITHUB_PATHS = new Set([
  "about",
  "account",
  "apps",
  "billing",
  "business",
  "codespaces",
  "collections",
  "contact",
  "customer-stories",
  "dashboard",
  "enterprise",
  "events",
  "explore",
  "features",
  "feed",
  "gist",
  "github-copilot",
  "issues",
  "join",
  "login",
  "marketplace",
  "mcp",
  "new",
  "notifications",
  "organizations",
  "orgs",
  "pricing",
  "pulls",
  "readme",
  "repositories",
  "repos",
  "search",
  "security",
  "settings",
  "signup",
  "site",
  "sponsors",
  "topics",
  "trending",
])

export const isGitHubReservedPath = (part: string): boolean => RESERVED_GITHUB_PATHS.has(part.toLowerCase())

export const getIssueSection = (pathname: string, strings: typeof enUS): string | undefined => {
  const section = getPathSegments(pathname)[1]
  if (section === "assigned") return strings.assigned
  if (section === "created") return strings.created
  if (section === "mentioned") return strings.mentioned
  if (section === "recent") return strings.recent
  return undefined
}

export const getGitHubFallbackDetails = (pathname: string, strings: typeof enUS): string => {
  if (pathname.startsWith("/pulls")) return strings.checkingPullRequests
  if (pathname.startsWith("/issues")) return strings.checkingIssues
  if (pathname.startsWith("/notifications")) return strings.checkingNotifications
  if (pathname.startsWith("/marketplace")) return strings.browsingMarketplace
  if (pathname.startsWith("/explore")) return strings.exploringGitHub
  if (pathname.startsWith("/settings")) return strings.changingSettings
  if (pathname.startsWith("/search")) return strings.searchingGitHub
  return strings.browsingGitHub
}
