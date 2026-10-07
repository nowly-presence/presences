import { readFileSync, writeFileSync } from "node:fs"
import { renderNoloReport } from "./render-report"
import type { NoloReportData } from "./types"

const getArg = (name: string): string => {
  const index = process.argv.indexOf(`--${name}`)
  const value = process.argv[index + 1]
  if (!value) throw new Error(`Missing required argument --${name}`)
  return value
}

const report = JSON.parse(readFileSync(getArg("input"), "utf-8")) as NoloReportData
writeFileSync(getArg("output"), renderNoloReport(report), "utf-8")
