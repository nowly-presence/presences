import type enUS from "../locales/en-US.json"

type WebtoonStrings = typeof enUS

export type WebtoonPage = {
  details: string
  state?: string
  isSpecific: boolean
  isSearch?: boolean
}

const getText = (...selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const value = document.querySelector<HTMLElement>(selector)?.textContent?.trim()
    if (value) return value
  }

  return undefined
}

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
    }
  }

  if (pathname.includes("/list")) {
    return {
      details: strings.viewingSeries,
      state: getText(".subj", "h1"),
      isSpecific: true,
    }
  }

  if (pathname.includes("/dailySchedule")) {
    const activeStatus = document.querySelector("ul > li.completed.on")
      ? strings.completedSeries
      : strings.ongoingSeries

    return { details: strings.browsingSchedule, state: activeStatus, isSpecific: true }
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
