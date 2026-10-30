import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { getAliasIssues, type AliasPresence } from "./aliases"

const BASE_DIR = process.argv[2] || "."
const OUTPUT_FILE = process.argv[3] || ""

type PresenceEntry = AliasPresence & { path: string }

type PresenceResult = {
  slug: string
  path: string
  status: "success" | "failure"
  errors: string[]
  warnings: string[]
}

type Output = {
  results: PresenceResult[]
  summary: {
    total: number
    passed: number
    failed: number
    errors: string[]
  }
  overall: "success" | "failure"
}

const selectedPresencePaths = (): Set<string> | null => {
  const raw = process.env.CHANGED_PRESENCES_JSON
  if (!raw) return null

  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || parsed.some(path => typeof path !== "string")) {
    throw new Error("CHANGED_PRESENCES_JSON must be a JSON array of presence paths")
  }

  return new Set(parsed)
}

const slug = (name: string): string => name.toLowerCase().replace(/\s+/g, "-")

// Every presence of the snapshot is loaded so changed presences are compared
// against the whole catalog, not only against the other changed presences.
const discoverPresences = (srcDir: string): PresenceEntry[] => {
  const presences: PresenceEntry[] = []

  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[A-Z#]$/.test(entry.name)) continue
    const letterDir = join(srcDir, entry.name)
    for (const sub of readdirSync(letterDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue
      const metaPath = join(letterDir, sub.name, "metadata.json")
      if (!existsSync(metaPath)) continue

      let metadata: Record<string, any> = {}
      try {
        metadata = JSON.parse(readFileSync(metaPath, "utf-8"))
      } catch {
        // invalid JSON is reported by the metadata validation
      }

      presences.push({ slug: slug(sub.name), path: `${entry.name}/${sub.name}`, metadata })
    }
  }

  return presences
}

const main = (): void => {
  const srcDir = join(BASE_DIR, "src")
  if (!existsSync(srcDir)) throw new Error(`src/ directory not found in ${BASE_DIR}`)

  const selectedPaths = selectedPresencePaths()
  const presences = discoverPresences(srcDir)
  const results: PresenceResult[] = presences
    .filter(presence => !selectedPaths || selectedPaths.has(presence.path))
    .map(presence => {
      const errors = getAliasIssues(presence, presences)
      return {
        slug: presence.slug,
        path: presence.path,
        status: errors.length > 0 ? "failure" : "success",
        errors,
        warnings: [],
      }
    })

  const failed = results.filter(result => result.status === "failure").length
  const output: Output = {
    results,
    summary: {
      total: results.length,
      passed: results.length - failed,
      failed,
      errors: results.flatMap(result => result.errors),
    },
    overall: failed > 0 ? "failure" : "success",
  }

  const json = JSON.stringify(output, null, 2)
  if (OUTPUT_FILE) writeFileSync(OUTPUT_FILE, json, "utf-8")
  console.log(json)
}

try {
  main()
} catch (err) {
  console.error(JSON.stringify({ overall: "failure" as const, fatal: err instanceof Error ? err.message : String(err) }))
  process.exit(1)
}
