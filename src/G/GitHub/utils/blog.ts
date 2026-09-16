import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { createButton, cleanTitle, getMetaContent } from "./dom"
import { getMetaImage, toDiscordImage } from "./images"
import type enUS from "../locales/en-US.json"

export const handleBlog = async (
  presence: PresenceInstance,
  pathname: string,
  href: string,
): Promise<void> => {
  const strings = await presence.getStrings<typeof enUS>()

  if (pathname === "/" || pathname === "") {
    await presence.setActivity({
      details: strings.readingGitHubBlog,
      largeImageKey: Assets.Logo,
      largeImageText: "GitHub Blog",
      type: PresenceType.Watching,
    })
    return
  }

  const title = getArticleTitle()
  const image = await toDiscordImage(getMetaImage())

  await presence.setActivity({
    details: strings.readingArticle,
    state: title,
    largeImageKey: image || Assets.Logo,
    largeImageText: title || "GitHub Blog",
    type: PresenceType.Watching,
    buttons: [createButton(strings.readArticle, href)],
  })
}

export const getArticleTitle = (): string => {
  const h1 = document.querySelector<HTMLHeadingElement>("h1")?.textContent?.trim()
  return cleanTitle(h1 || getMetaContent("og:title") || document.title) || "GitHub Blog"
}
