export type PresenceAction = "added" | "modified" | "removed"

export type ChangedFile = {
  filename?: string
  previous_filename?: string
  status?: string
}

export type ChangedPresence = {
  id: string
  slug: string
  action: PresenceAction
  files: string[]
  previousFiles: string[]
  renamedFrom?: string
  renamedTo?: string
}

export type ChangedPresencesReport = {
  schemaVersion: 2
  baseSha: string | null
  headSha: string | null
  presences: ChangedPresence[]
}

export type ValidationStatus = "success" | "failure" | "skipped"

export type NoloValidation = {
  status: ValidationStatus
  summary: string
  errors: string[]
  warnings: string[]
}

export type NoloPresenceReport = ChangedPresence & {
  name: string
  description?: string
  category?: string
  color?: string
  world: string
  runAt: string
  validations: {
    assets: NoloValidation
    locales: NoloValidation
  }
}

export type NoloReportData = {
  schemaVersion: 2
  pullRequest: number
  baseSha: string
  headSha: string
  headRef: string
  headRepository: string
  presences: NoloPresenceReport[]
  generatedAt?: string
}
