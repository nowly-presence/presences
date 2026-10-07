import { writeFileSync } from "node:fs"

type PullRequestFile = {
  filename: string
  previous_filename?: string
  status?: string
}

type PullRequest = {
  base: { sha: string }
  head: { sha: string; ref: string; repo: { full_name: string } }
}

const getArg = (name: string): string => {
  const index = process.argv.indexOf(`--${name}`)
  const value = process.argv[index + 1]
  if (!value) throw new Error(`Missing required argument --${name}`)
  return value
}

const repository = process.env.GITHUB_REPOSITORY
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
if (!repository || !token) throw new Error("GITHUB_REPOSITORY and GH_TOKEN are required")

const pullRequest = getArg("pull-request")
const output = getArg("output")
const contextOutput = process.argv.includes("--context-output") ? getArg("context-output") : null
const headers = {
  accept: "application/vnd.github+json",
  authorization: `Bearer ${token}`,
  "x-github-api-version": "2026-03-10",
}

const pullResponse = await fetch(`https://api.github.com/repos/${repository}/pulls/${pullRequest}`, { headers })
if (!pullResponse.ok) throw new Error(`GitHub pull request API failed with HTTP ${pullResponse.status}`)
const pull = await pullResponse.json() as PullRequest

if (contextOutput) {
  writeFileSync(contextOutput, `${JSON.stringify({
    baseSha: pull.base.sha,
    headSha: pull.head.sha,
    headRef: pull.head.ref,
    headRepository: pull.head.repo.full_name,
  }, null, 2)}\n`, "utf-8")
}

const files: PullRequestFile[] = []
for (let page = 1; ; page += 1) {
  const response = await fetch(`https://api.github.com/repos/${repository}/pulls/${pullRequest}/files?per_page=100&page=${page}`, { headers })
  if (!response.ok) throw new Error(`GitHub file API failed with HTTP ${response.status}`)

  const pageFiles = await response.json() as PullRequestFile[]
  files.push(...pageFiles)
  if (pageFiles.length < 100) break
}

writeFileSync(output, `${JSON.stringify(files, null, 2)}\n`, "utf-8")
