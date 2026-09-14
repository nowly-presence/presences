import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { getIssueSection } from "./routes"
import type enUS from "../locales/en-US.json"

export const handleDashboardPage = async (
  presence: PresenceInstance,
  pathname: string,
  search: string,
): Promise<boolean> => {
  const strings = await presence.getStrings<typeof enUS>()

  if (pathname === "/" || pathname === "" || pathname === "/feed") {
    await setLogoActivity(presence, strings.browsingFeed)
    return true
  }

  if (pathname === "/repos") {
    await setLogoActivity(presence, strings.browsingRepositories)
    return true
  }

  if (pathname === "/pulls/inbox") {
    await setLogoActivity(presence, strings.checkingPullRequests, strings.inbox)
    return true
  }

  if (pathname.startsWith("/issues/")) {
    const section = getIssueSection(pathname, strings)
    if (!section) return false

    await setLogoActivity(presence, strings.checkingIssues, section)
    return true
  }

  if (pathname === "/notifications" && (search.includes("is%3Aunread") || search.includes("is:unread"))) {
    await setLogoActivity(presence, strings.checkingNotifications, strings.unread)
    return true
  }

  return false
}

const setLogoActivity = async (
  presence: PresenceInstance,
  details: string,
  state?: string,
): Promise<void> => {
  await presence.setActivity({
    details,
    state,
    largeImageKey: Assets.Logo,
    largeImageText: "GitHub",
    type: PresenceType.Watching,
  })
}
