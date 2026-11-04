import { PresenceType, type PresenceData } from "@nowly/sdk"
import type baseStrings from "./locales/fr-FR.json"

const presence = new Presence()
const isEnabled = (value: unknown): boolean => value === true || value === "true"
let currentPath = ""
let pageStartedAt = Math.floor(Date.now() / 1000)

const readText = (selector: string): string | undefined =>
  document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() || undefined

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof baseStrings>()
  const { pathname } = window.location
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const pageUrl = `${window.location.origin}${pathname}`
  if (pathname !== currentPath) {
    currentPath = pathname
    pageStartedAt = Math.floor(Date.now() / 1000)
  }

  if (pathname.startsWith("/search")) {
    const recherche = readText("#ti6dpd")
    if (!recherche) {
      presence.clearActivity()
      return
    }
    const data: PresenceData = {
      details: presence.formatString(strings.googleSearchDetails, { recherche }),
      largeImageKey: Assets.Logo,
      largeImageText: "Google",
      type: PresenceType.Watching,
    }
    data.startTimestamp = pageStartedAt
    if (showButtons) data.buttons = [{ label: strings.googleSearchButton, url: pageUrl }]
    await presence.setActivity(data)
    return
  }

  if (isEnabled(ctx.settings.showBrowsing)) {
    await presence.setActivity({ details: "Google", state: strings.browsing, largeImageKey: Assets.Logo, type: PresenceType.Watching })
    return
  }
  presence.clearActivity()
})
