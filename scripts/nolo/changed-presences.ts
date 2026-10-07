import type {
  ChangedFile,
  ChangedPresence,
  ChangedPresencesReport,
  PresenceAction,
} from "./types"

const PRESENCE_FILE_PATTERN = /^src\/([A-Z#])\/([^/]+)(?:\/|$)/

const ACTION_PRIORITY: Record<PresenceAction, number> = {
  removed: 1,
  modified: 2,
  added: 3,
}

const normalizePath = (value?: string): string | null => value?.replaceAll("\\", "/") ?? null

export const presencePathFromFile = (filename?: string): string | null => {
  const match = normalizePath(filename)?.match(PRESENCE_FILE_PATTERN)
  return match ? `${match[1]}/${match[2]}` : null
}

export const slugFromPresencePath = (presencePath: string): string => {
  const name = presencePath.split("/").at(-1) ?? presencePath
  return name.toLowerCase().replace(/\s+/g, "-")
}

const addFile = (record: ChangedPresence, filename: string | null, collection: "files" | "previousFiles"): void => {
  if (!filename || record[collection].includes(filename)) return
  record[collection].push(filename)
}

const ensureRecord = (records: Map<string, ChangedPresence>, id: string, action: PresenceAction): ChangedPresence => {
  const existing = records.get(id)
  if (existing) {
    if (ACTION_PRIORITY[action] > ACTION_PRIORITY[existing.action]) existing.action = action
    return existing
  }

  const record: ChangedPresence = {
    id,
    slug: slugFromPresencePath(id),
    action,
    files: [],
    previousFiles: [],
  }
  records.set(id, record)
  return record
}

export const resolveChangedPresences = (
  files: ChangedFile[],
  { baseSha = null, headSha = null }: { baseSha?: string | null; headSha?: string | null } = {},
): ChangedPresencesReport => {
  const records = new Map<string, ChangedPresence>()

  for (const file of files) {
    const filename = normalizePath(file.filename)
    const previousFilename = normalizePath(file.previous_filename)
    const currentPresence = filename ? presencePathFromFile(filename) : null
    const previousPresence = previousFilename ? presencePathFromFile(previousFilename) : null

    if (!currentPresence && !previousPresence) continue

    if (previousPresence && previousPresence !== currentPresence) {
      const removed = ensureRecord(records, previousPresence, "removed")
      addFile(removed, previousFilename, "previousFiles")
      removed.renamedTo = currentPresence ?? undefined

      if (currentPresence && filename) {
        const added = ensureRecord(records, currentPresence, "added")
        addFile(added, filename, "files")
        added.renamedFrom = previousPresence
      }
      continue
    }

    const presence = currentPresence ?? previousPresence
    if (!presence) continue

    const action: PresenceAction = currentPresence
      ? file.status === "added" || file.status === "copied"
        ? "added"
        : file.status === "removed" || file.status === "deleted"
          ? "removed"
          : "modified"
      : "removed"
    const record = ensureRecord(records, presence, action)

    addFile(record, filename, "files")
    addFile(record, previousFilename, "previousFiles")
  }

  for (const record of records.values()) {
    if (record.files.length > 0 && record.action === "removed") record.action = "modified"
    record.files.sort()
    record.previousFiles.sort()
  }

  return {
    schemaVersion: 2,
    baseSha,
    headSha,
    presences: [...records.values()].sort((a, b) => a.id.localeCompare(b.id)),
  }
}

export const presenceIds = (report: ChangedPresencesReport): string[] => report.presences.map((presence) => presence.id)
