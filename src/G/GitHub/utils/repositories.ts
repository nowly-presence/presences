import { PresenceType, type PresenceInstance } from "@nowly/sdk"
import { createButton, getPathSegments, getTitle } from "./dom"
import { getAvatarImage, getGitHubAvatarImage, toDiscordImage } from "./images"
import type enUS from "../locales/en-US.json"

type Strings = typeof enUS
type FormatString = PresenceInstance["formatString"]

export type RepositoryInfo = {
  owner: string
  repo: string
  name: string
}

export const handleRepositoryPage = async (
  presence: PresenceInstance,
  pathname: string,
  href: string,
  owner: string,
  repo: string,
  showPrivateRepositories: boolean,
): Promise<boolean> => {
  const repository = getRepositoryInfo(owner, repo)
  if (!repository) return false

  const isPrivate = isPrivateRepository()
  if (isPrivate && !showPrivateRepositories) {
    presence.clearActivity()
    return true
  }

  const strings = await presence.getStrings<typeof enUS>()
  const formatString = presence.formatString.bind(presence)
  const image = await toDiscordImage(getAvatarImage(owner))
  const section = getRepositorySection(pathname, strings, formatString)
  const pullRequestAuthor = getPullRequestAuthor(pathname)
  const pullRequestAuthorImage = pullRequestAuthor
    ? await toDiscordImage(getAvatarImage(pullRequestAuthor) || getGitHubAvatarImage(pullRequestAuthor))
    : undefined

  await presence.setActivity({
    details: getRepositoryDetails(section, strings),
    state: repository.name,
    largeImageKey: pullRequestAuthorImage || image || Assets.Logo,
    largeImageText: pullRequestAuthor || repository.name,
    smallImageKey: pullRequestAuthorImage && image ? image : undefined,
    smallImageText: pullRequestAuthorImage && image ? repository.owner : undefined,
    type: PresenceType.Watching,
    buttons: isPrivate ? undefined : getRepositoryButtons(pathname, href, repository, strings),
  })

  return true
}

const getRepositoryButtons = (
  pathname: string,
  href: string,
  repository: RepositoryInfo,
  strings: Strings,
): Array<{ label: string, url: string }> => {
  const buttons = []
  const contextual = getRepositoryContextButton(pathname, href, strings)

  if (contextual) buttons.push(contextual)
  buttons.push(createButton(strings.viewRepository, `https://github.com/${repository.owner}/${repository.repo}`))

  return buttons.slice(0, 2)
}

const getRepositoryContextButton = (
  pathname: string,
  href: string,
  strings: Strings,
): { label: string, url: string } | undefined => {
  const [, , section, subSection] = getPathSegments(pathname)
  if (section === "pull" && subSection && /^\d+$/.test(subSection)) return createButton(strings.viewPullRequest, href)
  if (section === "issues" && subSection && /^\d+$/.test(subSection)) return createButton(strings.viewIssue, href)
  return undefined
}

export const getRepositoryInfo = (owner: string, repo: string): RepositoryInfo | undefined => {
  const nwo = document.querySelector<HTMLMetaElement>('meta[name="octolytics-dimension-repository_nwo"]')?.content
  const fromMeta = nwo?.match(/^([^/]+)\/([^/]+)$/)
  if (fromMeta) return createRepositoryInfo(fromMeta[1], fromMeta[2])

  const title = getTitle()
  const fromTitle = title.match(/^([^/\s]+)\s*\/\s*([^\s:]+)(?:\s*:\s*)?/)
  if (fromTitle && equalsIgnoreCase(fromTitle[1], owner) && equalsIgnoreCase(fromTitle[2], repo)) {
    return createRepositoryInfo(fromTitle[1], fromTitle[2])
  }

  return createRepositoryInfo(owner, repo)
}

export const isPrivateRepository = (): boolean => {
  const publicMeta = document.querySelector<HTMLMetaElement>('meta[name="octolytics-dimension-repository_public"]')?.content
  if (publicMeta === "false") return true
  if (publicMeta === "true") return false

  const candidates = [
    document.querySelector('[title="Private"]')?.textContent,
    document.querySelector('[aria-label="Private repository"]')?.textContent,
    document.querySelector('[data-testid="repository-visibility-label"]')?.textContent,
    document.querySelector(".Label")?.textContent,
  ]

  return candidates.some((candidate) => candidate?.trim().toLowerCase() === "private")
}

export const getRepositorySection = (pathname: string, strings: Strings, formatString: FormatString): string | undefined => {
  const [, , section, subSection, extraSection] = getPathSegments(pathname)

  if (!section) return "Code"
  if (section === "issues") return getIssueSection(subSection, strings, formatString)
  if (section === "pulls" || section === "pull") return getPullRequestSection(subSection, extraSection, strings, formatString)
  if (section === "actions") return "Actions"
  if (section === "projects") return "Projects"
  if (section === "security") return "Security"
  if (section === "pulse") return "Pulse"
  if (section === "graphs") return "Insights"
  if (section === "wiki") return "Wiki"
  if (section === "discussions") return "Discussions"
  if (section === "releases") return "Releases"
  if (section === "packages") return "Packages"
  if (section === "settings") return "Repository settings"
  if (section === "blob") return strings.viewingFile
  if (section === "tree") return strings.browsingFiles
  if (section === "edit") return strings.editingFile
  if (section === "commit") return strings.viewingCommit
  if (section === "commits") return strings.viewingCommits
  if (section === "compare") return strings.creatingPullRequest
  if (section === "milestones") return "Milestones"
  if (section === "labels") return "Labels"
  if (section === "branches") return "Branches"
  if (section === "tags") return "Tags"
  if (section === "forks") return "Forks"

  return titleCase(section.replace(/-/g, " "))
}

const createRepositoryInfo = (owner: string, repo: string): RepositoryInfo => ({
  owner,
  repo,
  name: `${owner}/${repo}`,
})

const getRepositoryDetails = (section: string | undefined, strings: Strings): string => {
  if (!section || section === "Code") return strings.browsingRepository

  const repositorySectionDetails: Record<string, string> = {
    "Issues": strings.viewingRepoIssues,
    "Pull requests": strings.viewingRepoPulls,
    "Actions": strings.viewingRepoActions,
    "Projects": strings.viewingRepoProjects,
    "Security": strings.viewingRepoSecurity,
    "Pulse": strings.viewingRepoPulse,
    "Insights": strings.viewingRepoInsights,
    "Wiki": strings.viewingRepoWiki,
    "Discussions": strings.viewingRepoDiscussions,
    "Releases": strings.viewingRepoReleases,
    "Packages": strings.viewingRepoPackages,
    "Repository settings": strings.viewingRepoSettings,
    "Milestones": strings.viewingRepoMilestones,
    "Labels": strings.viewingRepoLabels,
    "Branches": strings.viewingRepoBranches,
    "Tags": strings.viewingRepoTags,
    "Forks": strings.viewingRepoForks,
  }

  return repositorySectionDetails[section] || section
}

const getIssueSection = (issuePath: string | undefined, strings: Strings, formatString: FormatString): string => {
  if (!issuePath) return "Issues"
  if (issuePath === "new") return strings.creatingIssue
  if (issuePath === "templates" || issuePath === "choose") return strings.choosingIssueTemplate
  if (issuePath === "assigned") return strings.assignedIssues
  if (issuePath === "created_by") return strings.createdIssues
  if (/^\d+$/.test(issuePath)) return formatString(strings.viewingIssue, { number: issuePath })
  return "Issues"
}

const getPullRequestSection = (
  pullPath: string | undefined,
  viewPath: string | undefined,
  strings: Strings,
  formatString: FormatString,
): string => {
  if (!pullPath) return "Pull requests"
  if (/^\d+$/.test(pullPath)) return getPullRequestView(pullPath, viewPath, strings, formatString)
  return "Pull requests"
}

const getPullRequestView = (pullNumber: string, viewPath: string | undefined, strings: Strings, formatString: FormatString): string => {
  if (viewPath === "changes" || viewPath === "files") return formatString(strings.reviewingPrChanges, { number: pullNumber })
  if (viewPath === "commits") return formatString(strings.viewingPrCommits, { number: pullNumber })
  if (viewPath === "checks") return formatString(strings.viewingPrChecks, { number: pullNumber })
  return formatString(strings.viewingPullRequest, { number: pullNumber })
}

const getPullRequestAuthor = (pathname: string): string | undefined => {
  const [, , section, pullNumber] = getPathSegments(pathname)
  if (section !== "pull" || !pullNumber || !/^\d+$/.test(pullNumber)) return undefined

  const candidates = [
    document.querySelector<HTMLElement>(".gh-header-meta .author")?.textContent,
    document.querySelector<HTMLElement>(".gh-header-meta a[data-hovercard-type='user']")?.textContent,
    document.querySelector<HTMLElement>("a.author[data-hovercard-type='user']")?.textContent,
    document.querySelector<HTMLElement>("[data-hovercard-type='user'].author")?.textContent,
    document.querySelector<HTMLAnchorElement>(".timeline-comment-header a.author")?.getAttribute("href"),
    document.querySelector<HTMLImageElement>(".timeline-comment-avatar img.avatar")?.alt,
  ]

  for (const candidate of candidates) {
    const username = normalizeGitHubUsername(candidate)
    if (username) return username
  }

  return undefined
}

const normalizeGitHubUsername = (value: string | undefined | null): string | undefined => {
  const username = value?.trim().replace(/^@/, "").replace(/^\//, "").split("/")[0]
  if (!username || !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) return undefined
  return username
}

const equalsIgnoreCase = (a: string, b: string): boolean => a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0

const titleCase = (value: string): string => value.replace(/\b\w/g, (letter) => letter.toUpperCase())