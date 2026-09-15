import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { createButton, getPathSegments, getTitle, getVisibleText } from "./dom"
import { getMetaImage, toDiscordImage } from "./images"
import { ProductAssets } from "./products"
import type enUS from "../locales/en-US.json"

export const handleMcpPage = async (
  presence: PresenceInstance,
  pathname: string,
  href: string,
): Promise<boolean> => {
  const [first, owner, server] = getPathSegments(pathname)
  if (first !== "mcp") return false

  const strings = await presence.getStrings<typeof enUS>()

  if (!owner || !server) {
    await presence.setActivity({
      details: strings.browsingMcpServers,
      state: getTitle("GitHub MCP Registry"),
      largeImageKey: ProductAssets.McpLogo,
      largeImageText: "GitHub MCP",
      type: PresenceType.Watching,
    })
    return true
  }

  const image = await toDiscordImage(getMcpLogo() || getMetaImage())
  const name = getMcpName(server)

  await presence.setActivity({
    details: strings.viewingMcpServer,
    state: name,
    largeImageKey: image || ProductAssets.McpLogo,
    largeImageText: name,
    type: PresenceType.Watching,
    buttons: [createButton(strings.viewMcpServer, href)],
  })

  return true
}

const getMcpLogo = (): string | undefined =>
  document.querySelector<HTMLImageElement>('aside img[alt$=" logo"]')?.src
    || document.querySelector<HTMLImageElement>('aside img[class*="logo"]')?.src

const getMcpName = (fallback: string): string =>
  getVisibleText('[class*="About-module__heading"]')
    || getTitle(fallback.replace(/-/g, " "))
