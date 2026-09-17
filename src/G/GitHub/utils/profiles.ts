import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { createButton, getTitle } from "./dom"
import { getAvatarImage, getMetaImage, toDiscordImage } from "./images"
import type enUS from "../locales/en-US.json"

const PROFILE_TAB_DETAILS: Record<string, keyof typeof enUS> = {
  stars: "viewingProfileStars",
  packages: "viewingProfilePackages",
  projects: "viewingProfileProjects",
  repositories: "viewingProfileRepositories",
}

const getProfileTabDetails = (search: string, strings: typeof enUS): string => {
  const tab = new URLSearchParams(search).get("tab") ?? ""
  const key = PROFILE_TAB_DETAILS[tab]
  return key ? strings[key] : strings.viewingProfile
}

export const handleProfilePage = async (
  presence: PresenceInstance,
  username: string,
  href: string,
  search: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()
  const avatar = await toDiscordImage(getAvatarImage(username) || getMetaImage())
  const title = getProfileTitle(username)

  await presence.setActivity({
    details: getProfileTabDetails(search, strings),
    state: title,
    largeImageKey: avatar || Assets.Logo,
    largeImageText: title,
    type: PresenceType.Watching,
    buttons: getProfileButtons(href, strings),
  })
}

const getProfileTitle = (username: string): string => {
  const title = getTitle(username)
  if (!title || title === "GitHub") return username
  return title.replace(/\s+\(@[^)]+\)$/, "") || username
}

const getProfileButtons = (href: string, strings: typeof enUS): Array<{ label: string, url: string }> => {
  const buttons = [createButton(strings.viewProfile, href)]
  const sponsor = document.querySelector<HTMLAnchorElement>("#sponsor-profile-button, a[href^='/sponsors/'][aria-label^='Sponsor']")

  if (sponsor?.href || sponsor?.getAttribute("href")) {
    buttons.push(createButton(strings.sponsor, sponsor.href || sponsor.getAttribute("href") || ""))
  }

  return buttons.slice(0, 2)
}
