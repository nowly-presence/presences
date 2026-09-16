import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { cleanTitle, createButton, getPathSegments, getTitle } from "./dom"
import { getAvatarImage, getMetaImage, toDiscordImage } from "./images"
import type enUS from "../locales/en-US.json"

export const handleGist = async (
  presence: PresenceInstance,
  pathname: string,
  href: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()
  const [first, second] = getPathSegments(pathname)

  if (pathname === "/" || pathname === "") {
    await presence.setActivity({
      details: strings.browsingGist,
      largeImageKey: Assets.Logo,
      largeImageText: "GitHub Gist",
      type: PresenceType.Watching,
    })
    return
  }

  if (pathname === "/discover") {
    await presence.setActivity({
      details: strings.discoveringGists,
      largeImageKey: Assets.Logo,
      largeImageText: "GitHub Gist",
      type: PresenceType.Watching,
      buttons: [createButton(strings.exploreGists, href)],
    })
    return
  }

  if (first && !second) {
    const avatar = await toDiscordImage(getAvatarImage(first))

    await presence.setActivity({
      details: presence.formatString(strings.browsingUserGist, { user: first }),
      largeImageKey: avatar || Assets.Logo,
      largeImageText: first,
      type: PresenceType.Watching,
      buttons: [createButton(strings.viewGists, href)],
    })
    return
  }

  if (first && second) {
    const avatar = await toDiscordImage(getAvatarImage(first) || getMetaImage())
    const secret = isSecretGist()

    await presence.setActivity({
      details: secret ? strings.viewingSecretGist : strings.viewingGist,
      state: getGistTitle(),
      largeImageKey: avatar || Assets.Logo,
      largeImageText: first,
      type: PresenceType.Watching,
      buttons: secret ? undefined : [createButton(strings.viewGist, href)],
    })
    return
  }

  await presence.setActivity({
    details: strings.browsingGist,
    largeImageKey: Assets.Logo,
    largeImageText: "GitHub Gist",
    type: PresenceType.Watching,
  })
}

export const getGistTitle = (): string => {
  const title = getTitle("Gist")
  return cleanTitle(title)
    .replace(/\s*-\s*GitHub Gist\s*$/i, "")
    .replace(/\s*\u00b7\s*GitHub\s*$/i, "")
    .trim() || "Gist"
}

export const isSecretGist = (): boolean => {
  const labels = [
    document.querySelector('[title="Secret gist"]')?.textContent,
    document.querySelector('[aria-label="Secret gist"]')?.textContent,
    document.querySelector(".gist-secret")?.textContent,
  ]

  if (labels.some(Boolean)) return true

  const pageText = document.body?.textContent?.slice(0, 1000) || ""
  return /\bsecret gist\b/i.test(`${document.title} ${pageText}`)
}
