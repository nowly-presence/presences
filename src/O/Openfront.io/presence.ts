import { PresenceType } from "@nowly/sdk"
import { getMapThumbnailUrl, getPlayerName, getProfileId, getSpectatorUrl, getVisiblePageId, normalizeMapId } from "./utils/activity"
import { getCurrentGame, type Game, type Tag } from "./utils/game"
import type enUS from "./locales/en-US.json"

type Strings = typeof enUS
type Activity = Parameters<typeof presence.setActivity>[0]

const presence = new Presence()
const maxStateLength = 128

const getPageDetails = (pageId: string | undefined, strings: Strings): string => {
  switch (pageId) {
    case "page-news":
      return strings.browsingNews
    case "page-single-player":
      return strings.browsingSinglePlayer
    case "page-host-lobby":
      return strings.hostingLobby
    case "page-join-lobby":
      return strings.joiningLobby
    case "page-matchmaking":
      return strings.searchingMatch
    case "page-ranked":
      return strings.browsingRanked
    case "page-item-store":
      return strings.browsingStore
    case "page-inventory":
      return strings.browsingInventory
    case "page-settings":
    case "page-language":
      return strings.browsingSettings
    case "page-leaderboard":
      return strings.browsingLeaderboard
    case "page-clan":
      return strings.browsingClans
    case "page-account":
      return strings.browsingAccount
    case "page-stats":
    case "page-detailed-view":
      return strings.browsingStats
    case "page-profile":
      return strings.browsingProfile
    case "page-help":
    case "page-troubleshooting":
      return strings.browsingHelp
    default:
      return strings.browsingHome
  }
}

const getDetails = (game: Game, strings: Strings): string => {
  if (game.phase === "lobby") return game.hosting ? strings.hostingLobby : strings.inLobby
  if (game.phase === "finished") {
    if (game.outcome === "victory") return strings.victory
    if (game.outcome === "defeat") return strings.defeat
    if (game.outcome === "cancelled") return strings.gameCancelled

    return strings.gameOver
  }
  if (game.kind === "replay") return strings.watchingReplay
  if (game.eliminated) return strings.eliminated
  if (game.kind === "singleplayer") return strings.playingSolo

  return game.spectating ? strings.spectating : strings.playing
}

const getModeLabel = (game: Game, strings: Strings): string | undefined => {
  if (game.gameMode !== "Team") return game.gameMode ? strings.modeFfa : undefined

  switch (game.teams) {
    case "Duos":
      return strings.modeDuos
    case "Trios":
      return strings.modeTrios
    case "Quads":
      return strings.modeQuads
    case "Humans Vs Nations":
      return strings.modeHumansVsNations
    default:
      return typeof game.teams === "number" ? presence.formatString(strings.modeTeamCount, { count: String(game.teams) }) : strings.modeTeams
  }
}

const getTagLabel = (tag: Tag, strings: Strings): string => {
  switch (tag) {
    case "compact":
      return strings.tagCompact
    case "crowded":
      return strings.tagCrowded
    case "randomSpawn":
      return strings.tagRandomSpawn
    case "hardNations":
      return strings.tagHardNations
    case "noAlliances":
      return strings.tagNoAlliances
    case "noNukes":
      return strings.tagNoNukes
    case "peaceTime":
      return strings.tagPeaceTime
    case "waterNukes":
      return strings.tagWaterNukes
    case "doomsday":
      return strings.tagDoomsday
  }
}

const getDifficultyLabel = (difficulty: string | undefined, strings: Strings): string | undefined => {
  const names: Record<string, string> = {
    Easy: strings.difficultyEasy,
    Medium: strings.difficultyMedium,
    Hard: strings.difficultyHard,
    Impossible: strings.difficultyImpossible
  }
  const name = difficulty ? names[difficulty] : undefined
  return name ? presence.formatString(strings.difficultyLabel, { difficulty: name }) : undefined
}

const getStatsLabels = (game: Game, strings: Strings): string[] => {
  const { stats } = game

  if (!stats) return []

  const labels: string[] = []
  if (stats.rank !== undefined) labels.push(presence.formatString(strings.statRank, { rank: String(stats.rank) }))
  if (stats.territory) labels.push(presence.formatString(strings.statTerritory, { percent: stats.territory }))
  if (stats.troops) labels.push(presence.formatString(strings.statTroops, { troops: stats.troops }))
  if (stats.gold) labels.push(presence.formatString(strings.statGold, { gold: stats.gold }))
  return labels
}

const getState = (game: Game, strings: Strings): string | undefined => {
  const parts: string[] = []
  if (game.map) parts.push(presence.formatString(strings.onMap, { map: game.map }))

  const mode = getModeLabel(game, strings)
  if (mode) parts.push(mode)
  if (game.rankedType) parts.push(strings.ranked)

  if (game.playerCount !== undefined && game.kind !== "singleplayer") {
    const showLimit = game.phase === "lobby" && game.maxPlayers !== undefined
    parts.push(
      presence.formatString(showLimit ? strings.playersOutOf : strings.playersCount, {
        count: String(game.playerCount),
        max: String(game.maxPlayers ?? "")
      })
    )
  }

  parts.push(...getStatsLabels(game, strings))

  const state = parts.join(" · ")

  if (!state) return undefined

  return state.length > maxStateLength ? `${state.slice(0, maxStateLength - 1)}…` : state
}

const getGameActivity = (game: Game, strings: Strings, settings: {
  allowSpectate?: boolean
  shareProfile?: boolean
}): Activity => {
  const mapId = game.mapId || (game.map ? normalizeMapId(game.map) : undefined)
  const thumbnailUrl = mapId ? getMapThumbnailUrl(mapId) : undefined
  const playerName = getPlayerName()
  const waiting = game.phase === "lobby" || game.phase === "finished"
  const tooltip = [
    game.map,
    getDifficultyLabel(game.difficulty, strings),
    ...(game.tags ?? []).map((tag) => getTagLabel(tag, strings))
  ]

  const activity: Activity = {
    details: getDetails(game, strings),
    state: getState(game, strings),
    largeImageKey: thumbnailUrl || Assets.Logo,
    largeImageText: tooltip.filter(Boolean).join(" · ") || "Openfront.io",
    smallImageKey: waiting ? "pause" : "play",
    smallImageText: playerName ? presence.formatString(strings.playingAs, { name: playerName }) : undefined,
    type: game.kind === "replay" || game.spectating ? PresenceType.Watching : PresenceType.Playing,
    buttons: []
  }

  if (game.phase === "lobby") {
    // Lobbies count down to their start, running games count up.
    if (game.startsAt && game.startsAt > Date.now()) activity.endTimestamp = Math.floor(game.startsAt / 1000)
  } else if (game.startTimestamp) {
    activity.startTimestamp = game.startTimestamp
  }

  const spectatorUrl = settings.allowSpectate ? getSpectatorUrl(game) : undefined

  if (spectatorUrl) {
    activity.buttons?.push({
      label: strings.spectate,
      url: spectatorUrl
    })
  }

  if (game.kind === "replay" && game.gameId) {
    const origin = window.location.origin.replace("//replay.", "//")
    activity.buttons?.push({
      label: strings.watchReplay,
      url: `${origin}/game/${encodeURIComponent(game.gameId)}`
    })
  }

  const profileId = getProfileId()

  if (settings.shareProfile && profileId) {
    activity.buttons?.push({
      label: strings.viewProfile,
      url: `https://openfront.io/player/${encodeURIComponent(profileId)}`
    })
  }

  return activity
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<Strings>()

  const pageId = getVisiblePageId()
  const game = await getCurrentGame(pageId, (message) => presence.info(message))

  if (game) {
    await presence.setActivity(getGameActivity(game, strings, ctx.settings))
    return
  }

  // Queueing for a ranked or public match is an activity, not casual browsing.
  const searching = pageId === "page-matchmaking"

  if (!searching && !ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: getPageDetails(pageId, strings),
    largeImageKey: Assets.Logo,
    largeImageText: "Openfront.io",
    smallImageKey: "search",
    type: PresenceType.Playing
  })
})
