import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { ChangedPresencesReport, NoloPresenceReport, NoloReportData, NoloValidation } from "./types"

type ValidatorResult = {
  path?: string
  status?: "success" | "failure"
  errors?: string[]
  warnings?: string[]
}

type ValidatorOutput = {
  results?: ValidatorResult[]
}

const args = new Map<string, string>()
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index]
  const value = process.argv[index + 1]
  if (key?.startsWith("--") && value) args.set(key.slice(2), value)
}

const requiredArg = (name: string): string => {
  const value = args.get(name)
  if (!value) throw new Error(`Missing required argument --${name}`)
  return value
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf-8")) as T

const validationFrom = (
  output: ValidatorOutput,
  presencePath: string,
  removed: boolean,
  label: string,
): NoloValidation => {
  if (removed) {
    return { status: "skipped", summary: `${label} validation is not applicable to a removed presence.`, errors: [], warnings: [] }
  }

  const result = output.results?.find(entry => entry.path === presencePath)
  if (!result) {
    return { status: "skipped", summary: `No ${label.toLowerCase()} data was found for this presence.`, errors: [], warnings: [] }
  }

  const errors = result.errors ?? []
  const warnings = result.warnings ?? []
  return {
    status: result.status === "failure" ? "failure" : "success",
    summary: errors.length > 0 ? `${errors.length} issue(s) require attention.` : "No issues found.",
    errors,
    warnings,
  }
}

const metadataValidation = (root: string, presencePath: string, removed: boolean): {
  metadata: NoloValidation
  values: Record<string, unknown>
} => {
  if (removed) {
    return {
      metadata: { status: "skipped", summary: "Metadata validation is not applicable to a removed presence.", errors: [], warnings: [] },
      values: {},
    }
  }

  const metadataPath = join(root, "src", presencePath, "metadata.json")
  if (!existsSync(metadataPath)) {
    return {
      metadata: { status: "failure", summary: "metadata.json is missing.", errors: ["metadata.json is missing."], warnings: [] },
      values: {},
    }
  }

  try {
    const values = readJson<Record<string, unknown>>(metadataPath)
    return {
      metadata: { status: "success", summary: "Metadata is valid JSON.", errors: [], warnings: [] },
      values,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON"
    return {
      metadata: { status: "failure", summary: "metadata.json could not be parsed.", errors: [message], warnings: [] },
      values: {},
    }
  }
}

const main = (): void => {
  const root = requiredArg("root")
  const changes = readJson<ChangedPresencesReport>(requiredArg("changes"))
  const assets = readJson<ValidatorOutput>(requiredArg("assets"))
  const locales = readJson<ValidatorOutput>(requiredArg("locales"))
  const outputPath = requiredArg("output")
  const pullRequest = Number(requiredArg("pull-request"))
  const headRef = requiredArg("head-ref")
  const headRepository = requiredArg("head-repository")

  const presences: NoloPresenceReport[] = changes.presences.map(presence => {
    const removed = presence.action === "removed"
    const { metadata, values } = metadataValidation(root, presence.id, removed)
    const fallbackName = presence.id.split("/").at(-1) ?? presence.slug

    return {
      ...presence,
      name: typeof values.name === "string" ? values.name : fallbackName,
      description: typeof values.description === "object" && values.description !== null
        ? String((values.description as Record<string, unknown>)["en-US"] ?? "") || undefined
        : undefined,
      category: typeof values.category === "string" ? values.category : undefined,
      color: typeof values.color === "string" ? values.color : undefined,
      world: typeof values.world === "string" ? values.world : "isolated",
      runAt: typeof values.runAt === "string" ? values.runAt : "document_idle",
      validations: {
        metadata,
        assets: validationFrom(assets, presence.id, removed, "Assets"),
        locales: validationFrom(locales, presence.id, removed, "Locales"),
      },
    }
  })

  const report: NoloReportData = {
    schemaVersion: 2,
    pullRequest,
    baseSha: changes.baseSha ?? "unknown",
    headSha: changes.headSha ?? "unknown",
    headRef,
    headRepository,
    presences,
  }

  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8")
}

main()
