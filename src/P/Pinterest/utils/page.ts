import type enUS from "../locales/en-US.json"

type PinterestStrings = typeof enUS

export type PinterestPage = {
  details: string
  state?: string
  kind: "general" | "pin" | "videoPin" | "profile" | "search"
  video?: HTMLVideoElement
  creator?: string
  profileUrl?: string
}

const getCreator = (): string | undefined =>
  document.querySelector<HTMLElement>(
    '[data-test-id="creator-profile-name"], [data-test-id="username"], [data-test-id="profile-name"]',
  )?.textContent?.trim()

const getPinTitle = (): string | undefined => {
  const text = document.querySelector<HTMLElement>('[data-test-id="leaf-snippet"]')?.textContent
  if (!text) return undefined

  try {
    return JSON.parse(text).headline as string | undefined
  } catch {
    return undefined
  }
}

export const getPinterestPage = (
  pathname: string,
  href: string,
  strings: PinterestStrings,
): PinterestPage => {
  const creator = getCreator()
  const video = document.querySelector<HTMLVideoElement>("video") || undefined
  const query = document.querySelector<HTMLInputElement>('input[aria-label="Search"], input[aria-label="search"]')?.value.trim()

  if (query) {
    return {
      details: pathname.includes("/search/") ? strings.searchResults : strings.searching,
      state: query,
      kind: "search",
    }
  }

  if (pathname === "/today" || pathname === "/today/") {
    return { details: strings.today, kind: "general" }
  }
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return { details: strings.settings, kind: "general" }
  }

  const profileSection = pathname.match(/^\/[^/]+\/_(pins|boards|collages)\/?$/)?.[1]
  if (profileSection) {
    const details = profileSection === "pins"
      ? strings.viewingPins
      : profileSection === "boards"
        ? strings.viewingBoards
        : strings.viewingCollages

    return {
      details,
      state: creator,
      kind: "profile",
      profileUrl: href.split("?")[0],
    }
  }

  if (pathname.includes("/pin/")) {
    return {
      details: video ? strings.viewingVideoPin : getPinTitle() || strings.viewingPin,
      state: creator
        ? (video ? strings.videoBy : strings.pinBy).replace("{name}", creator)
        : undefined,
      kind: video ? "videoPin" : "pin",
      video,
      creator,
      profileUrl: document.querySelector<HTMLAnchorElement>('[data-test-id="official-user-attribution"] a')?.href,
    }
  }

  if (document.querySelector('[data-test-id="profile-name"]')) {
    return {
      details: strings.viewingProfile,
      state: creator || undefined,
      kind: "profile",
      profileUrl: href.split("?")[0],
    }
  }

  if (pathname.includes("/ideas/")) {
    const ideaTitle = document.querySelector<HTMLElement>('[data-test-id="ideas-hub-page-header"], [data-test-id="control-ideas-redesign-header"]')?.textContent?.trim()
    return { details: strings.viewingIdeas, state: ideaTitle, kind: "general" }
  }

  if (pathname.startsWith("/idea-pin-builder") || pathname.startsWith("/pin-creation-tool")) {
    return { details: strings.creatingPin, kind: "general" }
  }

  if (pathname.startsWith("/collage-creation-tool")) {
    return { details: strings.creatingCollage, kind: "general" }
  }

  if (pathname === "/") return { details: strings.home, kind: "general" }
  return { details: strings.browsing, kind: "general" }
}
