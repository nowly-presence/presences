import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

test("publication matrix is unique, sorted and excludes removed presences", () => {
  const dir = mkdtempSync(join(tmpdir(), "nowly-matrix-"))
  const input = join(dir, "changes.json")
  const output = join(dir, "output.txt")
  try {
    for (const presences of [
      [{ slug: "youtube", action: "modified" }, { slug: "netflix", action: "added" }, { slug: "youtube", action: "modified" }, { slug: "removed", action: "removed" }],
      [{ slug: "removed", action: "removed" }],
      [],
    ]) {
      writeFileSync(input, JSON.stringify({ presences }))
      writeFileSync(output, "")
      execFileSync(process.execPath, ["--import", "tsx", fileURLToPath(new URL("publish-selection.ts", import.meta.url)), "--input", input], {
        env: { ...process.env, GITHUB_OUTPUT: output },
      })
      const result = readFileSync(output, "utf-8")
      const matrix = JSON.parse(result.match(/^matrix=(.*)$/m)![1])
      assert.deepEqual(matrix, presences.some((presence) => presence.action !== "removed") ? ["netflix", "youtube"] : [])
      if (presences.length) assert.match(result, /removed<<NOLO_REMOVED\nremoved\n/)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
