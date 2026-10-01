import type enUS from "../locales/en-US.json"

type WebtoonStrings = typeof enUS

export type WebtoonPage = {
  details: string
  state?: string
  isSpecific: boolean
  isSearch?: boolean
  buttonUrl?: string
  image?: string
}

const getText = (...selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const value = document.querySelector<HTMLElement>(selector)?.textContent?.trim()
    if (value) return value
  }

  return undefined
}

const getSeriesImage = (): string | undefined => {
  const image = document.querySelector<HTMLImageElement>(
    ".detail_info .thmb img, .detail_info .thumbnail img, .detail_header .thmb img, .info .thumbnail img, img[alt*='comic' i], img[alt*='WEBTOON' i]",
  )?.currentSrc
    || document.querySelector<HTMLImageElement>(
      ".detail_info .thmb img, .detail_info .thumbnail img, .detail_header .thmb img, .info .thumbnail img, img[alt*='comic' i], img[alt*='WEBTOON' i]",
    )?.src
    || document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content

  return image?.startsWith("https://") ? image : undefined
}

const getSeriesButtonUrl = (): string => document.location.href.split("#")[0] ?? document.location.href

export const getWebtoonPage = (pathname: string, strings: WebtoonStrings): WebtoonPage => {
  if (pathname.includes("/viewer")) {
    const title = getText("div.subj_info > a.subj", ".subj")
    const episode = getText("div.subj_info > .subj_episode")
    const chapterTitle = getText(".tx")
    const state = [episode, chapterTitle].filter(Boolean).join(" · ") || undefined

    return {
      details: title
        ? strings.reading.replace("{title}", title)
        : strings.readingGeneric,
      state,
      isSpecific: true,
      buttonUrl: getSeriesButtonUrl(),
      image: getSeriesImage(),
    }
  }

  if (pathname.includes("/list")) {
    return {
      details: strings.viewingSeries,
      state: getText(".subj", "h1"),
      isSpecific: true,
      buttonUrl: getSeriesButtonUrl(),
      image: getSeriesImage(),
    }
  }

  if (pathname.includes("/dailySchedule")) {
    const activeStatus = document.querySelector("ul > li.completed.on")
      ? strings.completedSeries
      : strings.ongoingSeries

    return { details: strings.browsingSchedule, state: activeStatus, isSpecific: true }
  }

  if (pathname.includes("/ranking")) {
    return { details: strings.ranking, isSpecific: true }
  }

  if (pathname.includes("/originals")) {
    return { details: strings.originals, isSpecific: true }
  }

  if (pathname === "/canvas" || pathname.startsWith("/canvas/")) {
    return { details: strings.canvas, isSpecific: true }
  }

  if (pathname.includes("/top")) {
    return { details: strings.popularSeries, isSpecific: true }
  }

  if (pathname.includes("/genre")) {
    return { details: strings.browsingGenres, isSpecific: true }
  }

  if (pathname.includes("/search")) {
    return {
      details: strings.searching,
      state: document.querySelector<HTMLInputElement>("input[type='search'], input[name='keyword']")?.value.trim() || undefined,
      isSpecific: true,
      isSearch: true,
    }
  }

  if (pathname.includes("/about")) {
    return { details: strings.about, isSpecific: true }
  }

  return { details: strings.browsing, isSpecific: pathname !== "/" }
}
