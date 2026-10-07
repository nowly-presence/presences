import { readFileSync, appendFileSync } from "node:fs"
import type { ChangedPresencesReport } from "./types"

const getArg = (name: string): string => {
  const index = process.argv.indexOf(`--${name}`)
  const value = process.argv[index + 1]
  if (!value) throw new Error(`Missing required argument --${name}`)
  return value
}

const report = JSON.parse(readFileSync(getArg("input"), "utf-8")) as ChangedPresencesReport
const changed = [...new Set(report.presences.filter(presence => presence.action !== "removed").map(presence => presence.slug))].sort()
const removed = [...new Set(report.presences.filter(presence => presence.action === "removed").map(presence => presence.slug))].sort()
const output = process.env.GITHUB_OUTPUT
if (!output) throw new Error("GITHUB_OUTPUT is required")

appendFileSync(output, `slugs<<NOLO_SLUGS\n${changed.join("\n")}\nNOLO_SLUGS\nremoved<<NOLO_REMOVED\n${removed.join("\n")}\nNOLO_REMOVED\n`, "utf-8")
console.log(`Publishing ${changed.length} changed and ${removed.length} removed presence(s).`)
