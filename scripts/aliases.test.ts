import assert from "node:assert/strict"
import { test } from "node:test"
import { getAliasIssues } from "./aliases"

const presence = (slug: string, aliases?: unknown) => ({
  slug,
  metadata: aliases === undefined ? {} : { aliases },
})

test("accepts unique aliases and rejects malformed entries", () => {
  assert.deepEqual(getAliasIssues(presence("openfront.io", ["openfront"]), [presence("youtube", ["yt"])]), [])
  assert.deepEqual(getAliasIssues(presence("example", "example-site"), []), ["metadata.aliases must be an array of strings"])
  assert.deepEqual(getAliasIssues(presence("example", ["Example", "example", "ex", "ex"]), []), [
    'Alias "Example" must use lowercase letters, digits, dots or hyphens (max 80 characters)',
    'Alias "example" duplicates the presence slug',
    'Alias "ex" is listed more than once',
  ])
})

test("rejects aliases and slugs already used by another presence", () => {
  const catalog = [presence("youtube", ["yt"]), presence("openfront.io", ["openfront"])]

  assert.deepEqual(getAliasIssues(presence("example", ["youtube", "yt"]), catalog), [
    'Alias "youtube" is already the slug of "youtube"',
    'Alias "yt" is already an alias of "youtube"',
  ])
  assert.deepEqual(getAliasIssues(presence("openfront"), catalog), [
    'Slug "openfront" is already an alias of "openfront.io"',
  ])
})
