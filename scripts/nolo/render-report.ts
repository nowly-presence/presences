import type { NoloPresenceReport, NoloReportData, NoloValidation } from "./types"

export const NOLO_REPORT_MARKER = "<!-- nolo:report:v2 -->"

const LEGACY_REPORT_HEADINGS = [
  "# Presence Preview",
  "## 🖼️ Activity asset preview",
  "## 🌐 Locale validation",
] as const

const escapeInline = (value: string): string => value.replaceAll("`", "\\`").replaceAll("\n", " ").trim()
const escapeTable = (value: string): string => escapeInline(value).replaceAll("|", "\\|")

const actionLabel = (presence: NoloPresenceReport): string => {
  if (presence.action === "added") return "New presence"
  if (presence.action === "removed") return "Removed presence"
  return "Updated presence"
}

const validationLabel = (validation: NoloValidation): string => {
  if (validation.status === "success") return "Passed"
  if (validation.status === "failure") return "Failed"
  return "Skipped"
}

const renderValidation = (name: string, validation: NoloValidation): string => {
  let body = `| ${name} | ${validationLabel(validation)} | ${escapeTable(validation.summary)} |\n`

  for (const error of validation.errors) {
    body += `\n> **${name} error:** ${escapeInline(error)}\n`
  }
  for (const warning of validation.warnings) {
    body += `\n> **${name} warning:** ${escapeInline(warning)}\n`
  }

  return body
}

const renderFiles = (presence: NoloPresenceReport): string => {
  const files = presence.files.length > 0 ? presence.files : presence.previousFiles
  const visibleFiles = files.slice(0, 20)
  let body = visibleFiles.map(file => `- \`${escapeInline(file)}\``).join("\n")

  if (files.length > visibleFiles.length) {
    body += `\n- _${files.length - visibleFiles.length} additional file(s) omitted_`
  }

  return body || "- No file details available"
}

const renderPresence = (presence: NoloPresenceReport): string => {
  let body = `## ${escapeInline(presence.name)} (\`${escapeInline(presence.slug)}\`)\n\n`
  body += "| Field | Value |\n|---|---|\n"
  body += `| Status | ${actionLabel(presence)} |\n`
  if (presence.category || presence.color) {
    const info = [presence.category, presence.color].filter(Boolean).map(value => `\`${escapeTable(value!)}\``).join(" · ")
    body += `| Category | ${info} |\n`
  }
  body += `| Runtime | \`${escapeTable(presence.world)}\` · \`${escapeTable(presence.runAt)}\` |\n\n`
  body += "### Validation\n\n| Check | Result | Details |\n|---|---|---|\n"
  body += renderValidation("Metadata", presence.validations.metadata)
  body += renderValidation("Assets", presence.validations.assets)
  body += renderValidation("Locales", presence.validations.locales)
  body += "\n### Changed files\n\n"
  body += `${renderFiles(presence)}\n\n---\n\n`
  return body
}

export const renderNoloReport = (report: NoloReportData): string => {
  const count = report.presences.length
  const presenceWord = count === 1 ? "presence" : "presences"
  let body = `${NOLO_REPORT_MARKER}\n\n# Nolo review report\n\n`
  body += `Automated review for pull request #${report.pullRequest}.\n\n`
  body += `| Scope | Value |\n|---|---|\n`
  body += `| Presences affected | ${count} ${presenceWord} |\n`
  body += `| Commit reviewed | [\`${report.headSha.slice(0, 7)}\`](https://github.com/${report.headRepository}/commit/${report.headSha}) |\n\n`

  if (count === 0) {
    body += "No presence directory was changed in this revision. Nolo did not run presence-specific validation.\n\n"
  } else {
    body += report.presences.map(renderPresence).join("")
  }

  body += `<sub>Nolo generated this report from the exact pull request commit. The report is updated in place when the pull request changes.</sub>`
  return body
}

export const isLegacyNoloReport = (body: string | undefined): boolean =>
  Boolean(body && LEGACY_REPORT_HEADINGS.some(heading => body.startsWith(heading)))
