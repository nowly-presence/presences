export const findForumTopicTitle = (): string | undefined =>
  document.querySelector("h1")?.textContent?.trim() || undefined
