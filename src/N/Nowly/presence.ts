import { createCachedImageProxyUrl, PresenceType } from "@nowly/sdk"
import { findPageTitle, getNowlyPage, getPresenceLogo, truncateActivityText } from "./utils/page"
import type enUS from "./locales/en-US.json"

const presence = new Presence()

const getActivityDetails = (kind: string, title: string | undefined, strings: typeof enUS): string => {
  switch (kind) {
    case "home": return strings.exploringNowly
    case "library": return strings.browsingLibrary
    case "presence": return strings.viewingPresence
    case "author": return strings.viewingContributor
    case "desktop": return strings.exploringDesktop
    case "extension": return strings.exploringExtension
    case "canary": return strings.exploringCanary
    case "changelog": return strings.readingChangelog
    case "release": return strings.readingRelease
    case "support": return strings.gettingSupport
    case "status": return strings.checkingStatus
    case "branding": return strings.browsingBranding
    case "privacy": return strings.readingPrivacy
    case "consent": return strings.managingConsent
    case "terms": return strings.readingTerms
    case "cookies": return strings.readingCookies
    case "legalNotice": return strings.readingLegalNotice
    case "uninstall": return strings.readingUninstallGuide
    case "docsHome": return strings.openingDocs
    case "docsArticle": return strings.readingDocs
    case "docsChangelog": return strings.readingDocsChangelog
    case "docsRelease": return strings.readingDocsRelease
    default: return title ? presence.formatString(strings.viewingPage, { title }) : strings.browsingNowly
  }
}

presence.on("UpdateData", async () => {
  const page = getNowlyPage()
  if (!page) {
    presence.clearActivity()
    return
  }

  const strings = await presence.getStrings<typeof enUS>()
  const title = findPageTitle()
  const details = getActivityDetails(page.kind, title, strings)
  const state = page.kind === "presence" || page.kind === "author" || page.kind.startsWith("docs") || page.kind === "release"
    ? title || page.slug
    : title && page.kind === "websitePage"
      ? title
      : undefined
  const url = new URL(window.location.href)
  url.search = ""
  url.hash = ""
  const presenceLogo = page.kind === "presence" && page.slug ? getPresenceLogo(page.slug) : undefined
  const largeImageKey = presenceLogo
    ? (await createCachedImageProxyUrl("nowly", presenceLogo)) || Assets.Logo
    : Assets.Logo

  await presence.setActivity({
    details: truncateActivityText(details),
    state: state ? truncateActivityText(state) : undefined,
    largeImageKey,
    largeImageText: title ? truncateActivityText(title) : "Nowly",
    smallImageKey: presenceLogo ? Assets.Logo : undefined,
    smallImageText: presenceLogo ? "Nowly" : undefined,
    type: PresenceType.Watching,
    buttons: [{ label: strings.openNowly, url: url.href }],
  })
})
