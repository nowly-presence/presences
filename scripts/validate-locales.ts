import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join, extname } from "path";

const BASE_DIR = process.argv[2] || ".";
const OUTPUT_FILE = process.argv[3] || "";

const LOCALES = ["en-US", "fr-FR", "es-ES"] as const;
const BASE_LOCALE = "en-US";

const slug = (name: string): string => name.toLowerCase().replace(/\s+/g, "-");

type LocaleKeyReport = {
  locale: string
  missingKeys: string[]
  extraKeys: string[]
}

type PresenceResult = {
  slug: string
  path: string
  name: string
  status: "success" | "failure"
  localeReports: LocaleKeyReport[]
  usedKeysMissingFromBase: string[]
  unusedBaseKeys: string[]
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
    warnings: string[]
  }
  overall: "success" | "failure"
}

const walkTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return []
  const files: string[] = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "locales" || entry.name === "assets") continue
      files.push(...walkTsFiles(full))
    } else if (extname(entry.name) === ".ts") {
      files.push(full)
    }
  }

  return files
}

const extractUsedKeys = (dir: string): Set<string> => {
  const used = new Set<string>()
  const pattern = /\bstrings\.([A-Za-z_$][A-Za-z0-9_$]*)/g

  for (const file of walkTsFiles(dir)) {
    const source = readFileSync(file, "utf-8")
    for (const match of source.matchAll(pattern)) {
      used.add(match[1])
    }
  }

  return used
}

const loadLocaleKeys = (dir: string, locale: string): Set<string> | null => {
  const path = join(dir, "locales", `${locale}.json`)
  if (!existsSync(path)) return null

  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8"))
    return new Set(Object.keys(parsed))
  } catch {
    return null
  }
}

const validatePresence = (dir: string, slugName: string, presencePath: string, name: string): PresenceResult | null => {
  const localesDir = join(dir, "locales")
  if (!existsSync(localesDir)) return null

  const errors: string[] = []
  const warnings: string[] = []

  const baseKeys = loadLocaleKeys(dir, BASE_LOCALE)
  if (!baseKeys) {
    errors.push(`locales/${BASE_LOCALE}.json is missing or invalid JSON`)
  }

  const localeReports: LocaleKeyReport[] = []

  for (const locale of LOCALES) {
    if (locale === BASE_LOCALE) continue
    const keys = loadLocaleKeys(dir, locale)

    if (!keys) {
      errors.push(`locales/${locale}.json is missing or invalid JSON`)
      continue
    }

    if (!baseKeys) continue

    const missingKeys = [...baseKeys].filter(k => !keys.has(k))
    const extraKeys = [...keys].filter(k => !baseKeys.has(k))

    if (missingKeys.length > 0) {
      errors.push(`locales/${locale}.json is missing key(s): ${missingKeys.join(", ")}`)
    }
    if (extraKeys.length > 0) {
      warnings.push(`locales/${locale}.json has extra key(s) not in ${BASE_LOCALE}: ${extraKeys.join(", ")}`)
    }

    localeReports.push({ locale, missingKeys, extraKeys })
  }

  const usedKeys = extractUsedKeys(dir)
  const usedKeysMissingFromBase = baseKeys ? [...usedKeys].filter(k => !baseKeys.has(k)) : [...usedKeys]
  const unusedBaseKeys = baseKeys ? [...baseKeys].filter(k => !usedKeys.has(k)) : []

  if (usedKeysMissingFromBase.length > 0) {
    errors.push(`presence.ts references key(s) not present in locales/${BASE_LOCALE}.json: ${usedKeysMissingFromBase.join(", ")}`)
  }
  if (unusedBaseKeys.length > 0) {
    warnings.push(`locales/${BASE_LOCALE}.json defines unused key(s): ${unusedBaseKeys.join(", ")}`)
  }

  return {
    slug: slugName,
    path: presencePath,
    name,
    status: errors.length > 0 ? "failure" : "success",
    localeReports,
    usedKeysMissingFromBase,
    unusedBaseKeys,
    errors,
    warnings,
  }
}

const main = async (): Promise<void> => {
  const srcDir = join(BASE_DIR, "src")
  type PresenceInfo = { dir: string; slug: string; dirName: string; path: string; name: string }

  const presences: PresenceInfo[] = []

  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[A-Z#]$/.test(entry.name)) continue
    const letterDir = join(srcDir, entry.name)
    for (const sub of readdirSync(letterDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue
      const metaPath = join(letterDir, sub.name, "metadata.json")
      if (!existsSync(metaPath)) continue

      let name = sub.name
      try {
        name = JSON.parse(readFileSync(metaPath, "utf-8")).name ?? sub.name
      } catch {
        // keep folder name as fallback
      }

      presences.push({ dir: join(letterDir, sub.name), slug: slug(sub.name), dirName: sub.name, path: `${entry.name}/${sub.name}`, name })
    }
  }

  const changedDirs: string[] = process.env.CHANGED_DIRS
    ? process.env.CHANGED_DIRS.split(",").map(s => s.trim()).filter(Boolean)
    : presences.map(p => p.dirName)

  const results: PresenceResult[] = []
  for (const p of presences) {
    if (!changedDirs.includes(p.dirName)) continue
    const r = validatePresence(p.dir, p.slug, p.path, p.name)
    if (r) results.push(r)
  }

  const passed = results.filter(r => r.status === "success").length
  const failed = results.filter(r => r.status === "failure").length
  const allErrors = results.flatMap(r => r.errors)
  const allWarnings = results.flatMap(r => r.warnings)

  const output: Output = {
    results,
    summary: {
      total: results.length,
      passed,
      failed,
      errors: allErrors,
      warnings: allWarnings,
    },
    overall: failed > 0 ? "failure" : "success",
  }

  const json = JSON.stringify(output, null, 2)

  if (OUTPUT_FILE) {
    writeFileSync(OUTPUT_FILE, json, "utf-8")
  }

  console.log(json)
}

main().catch((err: Error): never => {
  console.error(JSON.stringify({ overall: "failure" as const, fatal: err.message }))
  process.exit(1)
})
