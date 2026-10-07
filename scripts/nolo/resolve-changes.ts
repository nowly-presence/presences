import { readFileSync, writeFileSync } from "node:fs"
import { presenceIds, resolveChangedPresences } from "./changed-presences"
import type { ChangedFile } from "./types"

const getArg = (name: string): string => {
  const index = process.argv.indexOf(`--${name}`)
  const value = process.argv[index + 1]
  if (!value) throw new Error(`Missing required argument --${name}`)
  return value
}

const files = JSON.parse(readFileSync(getArg("files"), "utf-8")) as ChangedFile[]
const report = resolveChangedPresences(files, {
  baseSha: process.env.BASE_SHA ?? null,
  headSha: process.env.HEAD_SHA ?? null,
})

writeFileSync(getArg("output"), `${JSON.stringify(report, null, 2)}\n`, "utf-8")

const selectionOutput = process.argv.includes("--selection-output") ? getArg("selection-output") : null
if (selectionOutput) {
  writeFileSync(selectionOutput, `${JSON.stringify(presenceIds(report))}\n`, "utf-8")
}

console.log(`Resolved ${report.presences.length} changed presence(s).`)
