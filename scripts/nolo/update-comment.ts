import { readFileSync } from "node:fs"
import { upsertNoloComment } from "./comment-store"
import type { NoloReportData } from "./types"

type Comment = { id: number; body?: string; user?: { login?: string } }

type ApiResponse<T> = {
  data: T
  headers: Headers
}

const repository = process.env.GITHUB_REPOSITORY
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
if (!repository || !token) throw new Error("GITHUB_REPOSITORY and GH_TOKEN are required")

const pullRequest = Number(process.env.PULL_REQUEST_NUMBER)
if (!Number.isInteger(pullRequest) || pullRequest <= 0) throw new Error("PULL_REQUEST_NUMBER must be a positive integer")

const [owner, repo] = repository.split("/")
if (!owner || !repo) throw new Error(`Invalid repository name: ${repository}`)

const headers = {
  accept: "application/vnd.github+json",
  authorization: `Bearer ${token}`,
  "content-type": "application/json",
  "x-github-api-version": "2026-03-10",
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> => {
  const response = await fetch(`https://api.github.com${path}`, { ...init, headers: { ...headers, ...init.headers } })
  const text = await response.text()
  const data = text ? JSON.parse(text) as T : undefined as T
  if (!response.ok) throw new Error(`GitHub API ${init.method ?? "GET"} ${path} failed with HTTP ${response.status}: ${text}`)
  return { data, headers: response.headers }
}

const listComments = async (issueNumber: number): Promise<Comment[]> => {
  const comments: Comment[] = []
  for (let page = 1; ; page += 1) {
    const { data } = await request<Comment[]>(`/repos/${repository}/issues/${issueNumber}/comments?per_page=100&page=${page}`)
    comments.push(...data)
    if (data.length < 100) return comments
  }
}

const github = {
  paginate: async (_request: unknown, parameters: Record<string, unknown>): Promise<Comment[]> =>
    listComments(Number(parameters.issue_number)),
  rest: {
    issues: {
      listComments: {},
      createComment: async (parameters: { owner: string; repo: string; issue_number: number; body: string }) =>
        request<Comment>(`/repos/${parameters.owner}/${parameters.repo}/issues/${parameters.issue_number}/comments`, {
          method: "POST",
          body: JSON.stringify({ body: parameters.body }),
        }),
      updateComment: async (parameters: { owner: string; repo: string; comment_id: number; body: string }) =>
        request<Comment>(`/repos/${parameters.owner}/${parameters.repo}/issues/comments/${parameters.comment_id}`, {
          method: "PATCH",
          body: JSON.stringify({ body: parameters.body }),
        }),
      deleteComment: async (parameters: { owner: string; repo: string; comment_id: number }) =>
        request<unknown>(`/repos/${parameters.owner}/${parameters.repo}/issues/comments/${parameters.comment_id}`, { method: "DELETE" }),
    },
  },
}

const applyLabels = async (report: NoloReportData): Promise<void> => {
  const managedLabels = new Set(["new", "update", "delete"])
  const expectedLabels = new Set<string>()

  for (const presence of report.presences) {
    expectedLabels.add(presence.action === "added" ? "new" : presence.action === "removed" ? "delete" : "update")
  }

  const { data: existing } = await request<Array<{ name: string }>>(`/repos/${repository}/issues/${pullRequest}/labels?per_page=100`)
  const existingNames = new Set(existing.map(label => label.name))

  const labelsToAdd = [...expectedLabels].filter(label => !existingNames.has(label))
  if (labelsToAdd.length > 0) {
    await request(`/repos/${repository}/issues/${pullRequest}/labels`, {
      method: "POST",
      body: JSON.stringify({ labels: labelsToAdd }),
    })
  }

  for (const label of existingNames) {
    if (!managedLabels.has(label) || expectedLabels.has(label)) continue
    await request(`/repos/${repository}/issues/${pullRequest}/labels/${encodeURIComponent(label)}`, { method: "DELETE" })
  }
}

const updateCheck = async (report: NoloReportData, body: string): Promise<void> => {
  const checkName = "Nolo / PR report"
  const externalId = `nolo-pr-${pullRequest}`
  const failed = report.presences.some(presence =>
    Object.values(presence.validations).some(validation => validation.status === "failure"),
  )
  const conclusion = failed ? "failure" : "success"
  const output = {
    title: failed ? "Nolo found issues" : "Nolo validation passed",
    summary: body.replace(/<!--.*?-->/gs, "").slice(0, 60_000),
  }
  const { data } = await request<{ check_runs: Array<{ id: number; external_id?: string }> }>(
    `/repos/${repository}/commits/${report.headSha}/check-runs?check_name=${encodeURIComponent(checkName)}&per_page=100`,
  )
  const existing = data.check_runs.find(run => run.external_id === externalId)
  const payload = { name: checkName, head_sha: report.headSha, status: "completed", conclusion, external_id: externalId, output }

  if (existing) {
    await request(`/repos/${repository}/check-runs/${existing.id}`, { method: "PATCH", body: JSON.stringify(payload) })
  } else {
    await request(`/repos/${repository}/check-runs`, { method: "POST", body: JSON.stringify(payload) })
  }
}

const main = async (): Promise<void> => {
  const report = JSON.parse(readFileSync(process.argv[2] ?? "", "utf-8")) as NoloReportData
  const { data: pull } = await request<{ head: { sha: string } }>(`/repos/${repository}/pulls/${pullRequest}`)

  if (pull.head.sha !== report.headSha) {
    console.log(`Skipped stale Nolo report for ${report.headSha}; current head is ${pull.head.sha}.`)
    return
  }

  const body = readFileSync(process.argv[3] ?? "", "utf-8")
  const commentId = await upsertNoloComment({ github, owner, repo, issueNumber: pullRequest, body })
  await applyLabels(report)
  await updateCheck(report, body)
  console.log(`Updated Nolo report comment ${commentId} for ${report.presences.length} presence(s).`)
}

await main()
