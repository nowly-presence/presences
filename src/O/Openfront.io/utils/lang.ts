import { getAssetUrl } from "./activity"

type Translations = {
  map?: Record<string, unknown>
  win_modal?: Record<string, unknown>
}

const loaded = new Map<string, Translations>()
const loading = new Set<string>()

// The game's own translation files give map names and end-of-game titles in the player's
// language, so new maps and wording need no change here. The first calls return nothing
// while the files load.
const load = async (lang: string): Promise<void> => {
  const url = getAssetUrl(`lang/${lang}.json`)

  if (!url) return

  loading.add(lang)

  try {
    const response = await fetch(url)
    if (response.ok) loaded.set(lang, (await response.json()) as Translations)
  } catch {
    // Retried on a later tick.
  } finally {
    loading.delete(lang)
  }
}

// English first, then the page language: the page translates its own titles.
const getLanguages = (): string[] => {
  const pageLang = document.documentElement.lang
  return pageLang && pageLang !== "en" ? ["en", pageLang] : ["en"]
}

const getTables = (): Translations[] => {
  const tables: Translations[] = []

  for (const lang of getLanguages()) {
    const table = loaded.get(lang)
    if (table) tables.push(table)
    else if (!loading.has(lang)) void load(lang)
  }

  return tables
}

const text = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined)

export const getMapName = (mapId: string): string | undefined =>
  getTables()
    .map((table) => text(table.map?.[mapId]))
    .find(Boolean)

// Reverse lookup: the API sends the display name, the assets are keyed by id.
export const getMapId = (mapName: string): string | undefined => {
  const wanted = mapName.toLowerCase()

  for (const table of getTables()) {
    const entry = Object.entries(table.map ?? {}).find(([, name]) => text(name)?.toLowerCase() === wanted)

    if (entry) return entry[0]
  }

  return undefined
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// "{player} has won!" -> /^(.+) has won!$/
const toPattern = (template: string): RegExp => new RegExp(`^${escapeRegExp(template).replace(/\\\{\w+\\\}/g, "(.+)")}$`, "i")

export const matchesWinModal = (title: string, keys: string[]): boolean => {
  const clean = title.replace(/\s+/g, " ").trim()
  return getTables().some((table) =>
    keys.some((key) => {
      const template = text(table.win_modal?.[key])
      return template !== undefined && toPattern(template).test(clean)
    })
  )
}
