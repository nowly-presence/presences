export const getPathSegments = (): string[] =>
  location.pathname.replace(/\/$/, "").split("/").filter(Boolean)

export const isOnHomePage = (): boolean => {
  const parts = getPathSegments()
  return parts.length === 0 || parts[0] === "leaderboard"
}

export const isOnProductPage = (): boolean => getPathSegments()[0] === "products"

export const isOnCategoriesListPage = (): boolean => {
  const parts = getPathSegments()
  return parts.length === 1 && parts[0] === "categories"
}

export const isOnCategoryPage = (): boolean => {
  const parts = getPathSegments()
  return parts.length >= 2 && parts[0] === "categories"
}

export const isOnLaunchGuidePage = (): boolean => getPathSegments()[0] === "launch"

export const isOnForumsListPage = (): boolean => {
  const parts = getPathSegments()
  return parts.length === 1 && parts[0] === "forums"
}

export const isOnForumTopicPage = (): boolean => {
  const parts = getPathSegments()
  return parts.length >= 2 && parts[0] === "p"
}

export const isOnSubmitPage = (): boolean => getPathSegments()[0] === "posts"

export const isOnProfilePage = (): boolean => (getPathSegments()[0] ?? "").startsWith("@")

export const getProfileSubTab = (): string | undefined => getPathSegments()[1]
