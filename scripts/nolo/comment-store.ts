import { isLegacyNoloReport, NOLO_REPORT_MARKER } from "./render-report"

const NOLO_BOT_LOGIN = "nowly-nolo[bot]"

type Comment = {
  id: number
  body?: string
  user?: { login?: string }
}

type GithubClient = {
  paginate: (request: unknown, parameters: Record<string, unknown>) => Promise<Comment[]>
  rest: {
    issues: {
      listComments: unknown
      createComment: (parameters: { owner: string; repo: string; issue_number: number; body: string }) => Promise<{ data: Comment }>
      updateComment: (parameters: { owner: string; repo: string; comment_id: number; body: string }) => Promise<{ data: Comment }>
      deleteComment: (parameters: { owner: string; repo: string; comment_id: number }) => Promise<unknown>
    }
  }
}

const isNoloComment = (comment: Comment): boolean => comment.user?.login === NOLO_BOT_LOGIN
const isCanonicalComment = (comment: Comment): boolean => isNoloComment(comment) && comment.body?.includes(NOLO_REPORT_MARKER) === true

const sortById = (comments: Comment[]): Comment[] => [...comments].sort((a, b) => a.id - b.id)

const listComments = async (github: GithubClient, owner: string, repo: string, issueNumber: number): Promise<Comment[]> =>
  github.paginate(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  })

export const upsertNoloComment = async ({
  github,
  owner,
  repo,
  issueNumber,
  body,
}: {
  github: GithubClient
  owner: string
  repo: string
  issueNumber: number
  body: string
}): Promise<number> => {
  const existing = await listComments(github, owner, repo, issueNumber)
  const canonical = sortById(existing.filter(isCanonicalComment))[0]
  const comment = canonical
    ? canonical.body === body
      ? canonical
      : (await github.rest.issues.updateComment({ owner, repo, comment_id: canonical.id, body })).data
    : (await github.rest.issues.createComment({ owner, repo, issue_number: issueNumber, body })).data

  const reconciled = await listComments(github, owner, repo, issueNumber)
  const canonicalComments = sortById(reconciled.filter(isCanonicalComment))
  const keeper = canonicalComments[0] ?? comment

  if (keeper.body !== body) {
    await github.rest.issues.updateComment({ owner, repo, comment_id: keeper.id, body })
  }

  const staleComments = reconciled.filter(other => {
    if (other.id === keeper.id || !isNoloComment(other)) return false
    return isCanonicalComment(other) || isLegacyNoloReport(other.body)
  })

  for (const staleComment of staleComments) {
    await github.rest.issues.deleteComment({ owner, repo, comment_id: staleComment.id })
  }

  return keeper.id
}
