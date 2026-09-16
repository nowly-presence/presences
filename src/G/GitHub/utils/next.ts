import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { createButton, getPathSegments, getTitle } from "./dom"
import { ProductAssets } from "./products"
import type enUS from "../locales/en-US.json"

export const handleGitHubNext = async (
  presence: PresenceInstance,
  pathname: string,
  href: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()
  const [first, second] = getPathSegments(pathname)

  if (pathname === "/" || pathname === "") {
    await setNextActivity(presence, strings, strings.browsingGitHubNext)
    return
  }

  if (first === "projects" && second) {
    await setNextActivity(presence, strings, strings.viewingGitHubNextProject, getTitle(projectName(second)), href)
    return
  }

  if (first === "posts" && second) {
    await setNextActivity(presence, strings, strings.readingGitHubNextPost, getTitle(postName(second)), href)
    return
  }

  if (pathname === "/talks") {
    await setNextActivity(presence, strings, strings.browsingGitHubNextTalks)
    return
  }

  if (first === "talks" && second) {
    await setNextActivity(presence, strings, strings.watchingGitHubNextTalk, getTitle(talkName(second)), href)
    return
  }

  await setNextActivity(presence, strings, strings.browsingGitHubNext, getTitle("GitHub Next"), href)
}

const setNextActivity = async (
  presence: PresenceInstance,
  strings: typeof enUS,
  details: string,
  state?: string,
  href?: string,
): Promise<void> => {
  await presence.setActivity({
    details,
    state,
    largeImageKey: ProductAssets.GitHubNextLogo,
    largeImageText: "GitHub Next",
    type: PresenceType.Watching,
    buttons: href ? [createButton(strings.viewOnGitHubNext, href)] : undefined,
  })
}

const projectName = (slug: string): string =>
  slug.replace(/-/g, " ")

const postName = (slug: string): string =>
  slug.replace(/-/g, " ")

const talkName = (slug: string): string =>
  slug.replace(/-/g, " ")
