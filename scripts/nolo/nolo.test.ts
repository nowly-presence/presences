import assert from "node:assert/strict"
import test from "node:test"
import { upsertNoloComment } from "./comment-store"
import { resolveChangedPresences } from "./changed-presences"
import { renderNoloReport } from "./render-report"
import type { NoloReportData } from "./types"

test("resolveChangedPresences keeps only exact changed presence paths", () => {
  const report = resolveChangedPresences([
    { filename: "README.md", status: "modified" },
    { filename: "src/P/Prime Video/presence.ts", status: "modified" },
    { filename: "src/Y/YouTube/presence.ts", status: "modified" },
  ], { baseSha: "base", headSha: "head" })

  assert.deepEqual(report.presences.map(presence => presence.id), ["P/Prime Video", "Y/YouTube"])
  assert.equal(report.presences[0]?.slug, "prime-video")
  assert.deepEqual(report.presences[0]?.files, ["src/P/Prime Video/presence.ts"])
})

test("resolveChangedPresences represents cross-presence renames explicitly", () => {
  const report = resolveChangedPresences([{
    filename: "src/Y/YouTube/presence.ts",
    previous_filename: "src/P/Prime Video/presence.ts",
    status: "renamed",
  }])

  assert.deepEqual(report.presences.map(presence => [presence.id, presence.action]), [
    ["P/Prime Video", "removed"],
    ["Y/YouTube", "added"],
  ])
})

test("renderNoloReport produces a professional single-presence report", () => {
  const report: NoloReportData = {
    schemaVersion: 2,
    pullRequest: 33,
    baseSha: "base",
    headSha: "1234567890abcdef",
    headRef: "fix/prime-video",
    headRepository: "nowly-presence/presences",
    presences: [{
      id: "P/Prime Video",
      slug: "prime-video",
      action: "modified",
      files: ["src/P/Prime Video/presence.ts"],
      previousFiles: [],
      name: "Prime Video",
      category: "streaming",
      world: "isolated",
      runAt: "document_idle",
      validations: {
        metadata: { status: "success", summary: "Metadata is valid JSON.", errors: [], warnings: [] },
        assets: { status: "success", summary: "No issues found.", errors: [], warnings: [] },
        locales: { status: "success", summary: "No issues found.", errors: [], warnings: [] },
      },
    }],
  }

  const body = renderNoloReport(report)
  assert.equal((body.match(/## Prime Video/g) ?? []).length, 1)
  assert.match(body, /Presences affected \| 1 presence/)
  assert.match(body, /No issues found\./)
  assert.doesNotMatch(body, /YouTube|Fresh pixels|Beep boop/)
})

test("upsertNoloComment converges legacy and duplicate comments to one report", async () => {
  const comments = [
    { id: 10, body: "# Presence Preview\nOld report", user: { login: "nowly-nolo[bot]" } },
    { id: 11, body: "<!-- nolo:report:v2 -->\nOld canonical", user: { login: "nowly-nolo[bot]" } },
    { id: 12, body: "<!-- nolo:report:v2 -->\nDuplicate canonical", user: { login: "nowly-nolo[bot]" } },
    { id: 13, body: "# Presence Preview\nHuman comment", user: { login: "maintainer" } },
  ]
  let nextId = 20
  const github = {
    paginate: async () => comments,
    rest: {
      issues: {
        listComments: {},
        createComment: async ({ body }: { body: string }) => {
          const comment = { id: nextId++, body, user: { login: "nowly-nolo[bot]" } }
          comments.push(comment)
          return { data: comment }
        },
        updateComment: async ({ comment_id, body }: { comment_id: number; body: string }) => {
          const comment = comments.find(item => item.id === comment_id)
          assert.ok(comment)
          comment.body = body
          return { data: comment }
        },
        deleteComment: async ({ comment_id }: { comment_id: number }) => {
          const index = comments.findIndex(item => item.id === comment_id)
          if (index >= 0) comments.splice(index, 1)
          return { data: null }
        },
      },
    },
  } as Parameters<typeof upsertNoloComment>[0]["github"]

  const body = "<!-- nolo:report:v2 -->\nNew report"
  const keeper = await upsertNoloComment({ github, owner: "nowly-presence", repo: "presences", issueNumber: 33, body })

  assert.equal(keeper, 11)
  assert.deepEqual(comments.filter(comment => comment.user.login === "nowly-nolo[bot]").map(comment => comment.id), [11])
  assert.equal(comments.find(comment => comment.id === 11)?.body, body)
  assert.equal(comments.some(comment => comment.id === 13), true)
})
