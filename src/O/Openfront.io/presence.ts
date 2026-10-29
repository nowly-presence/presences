import { PresenceType } from "@nowly/sdk"
import { getMapThumbnailUrl, getPlayerName, getProfileId, getVisiblePageId, normalizeMapId } from "./utils/activity"
import { getCurrentGame, type Game } from "./utils/game"
import type enUS from "./locales/en-US.json"

type Strings = typeof enUS
type Activity = Parameters<typeof presence.setActivity>[0]

const presence = new Presence()

const getPageDetails = (pageId: string | undefined, strings: Strings): string => {
  switch (pageId) {
    case "page-news": return strings.browsingNews
    case "page-single-player": return strings.browsingSinglePlayer
    case "page-host-lobby": return strings.hostingLobby
    case "page-join-lobby": return strings.joiningLobby
    case "page-matchmaking": return strings.searchingMatch
    case "page-ranked": return strings.browsingRanked
    case "page-item-store": return strings.browsingStore
    case "page-inventory": return strings.browsingInventory
    case "page-settings":
    case "page-language": return strings.browsingSettings
    case "page-leaderboard": return strings.browsingLeaderboard
    case "page-clan": return strings.browsingClans
    case "page-account": return strings.browsingAccount
    case "page-stats":
    case "page-detailed-view": return strings.browsingStats
    case "page-profile": return strings.browsingProfile
    case "page-help":
    case "page-troubleshooting": return strings.browsingHelp
    default: return strings.browsingHome
  }
}

const getDetails = (game: Game, strings: Strings): string => {
  if (game.phase === "lobby") return game.hosting ? strings.hostingLobby : strings.inLobby
  if (game.phase === "finished") return strings.gameOver
  if (game.kind === "replay") return strings.watchingReplay
  if (game.kind === "singleplayer") return strings.playingSolo
  return game.spectating ? strings.spectating : strings.playing
}

const getState = (game: Game, strings: Strings): string | undefined => {
  const parts: string[] = []
  if (game.map) parts.push(presence.formatString(strings.onMap, { map: game.map }))
  if (game.gameMode) parts.push(game.gameMode === "Team" ? strings.modeTeams : strings.modeFfa)
  if (game.rankedType) parts.push(strings.ranked)

  if (game.playerCount !== undefined && game.kind !== "singleplayer") {
    const showLimit = game.phase === "lobby" && game.maxPlayers !== undefined
    parts.push(presence.formatString(showLimit ? strings.playersOutOf : strings.playersCount, {
      count: String(game.playerCount),
      max: String(game.maxPlayers ?? ""),
    }))
  }

  return parts.length > 0 ? parts.join(" · ") : undefined
}

const getGameActivity = (game: Game, strings: Strings, settings: { allowSpectate?: boolean, shareProfile?: boolean }): Activity => {
  const mapId = game.mapId || (game.map ? normalizeMapId(game.map) : undefined)
  const thumbnailUrl = mapId ? getMapThumbnailUrl(mapId) : undefined
  const playerName = getPlayerName()
  const waiting = game.phase === "lobby" || game.phase === "finished"

  const activity: Activity = {
    details: getDetails(game, strings),
    state: getState(game, strings),
    largeImageKey: thumbnailUrl || Assets.Logo,
    largeImageText: game.map || "OpenFront.io",
    smallImageKey: waiting ? "pause" : "play",
    smallImageText: playerName ? presence.formatString(strings.playingAs, { name: playerName }) : undefined,
    type: game.kind === "replay" || game.spectating ? PresenceType.Watching : PresenceType.Playing,
    buttons: [],
  }

  if (game.phase === "lobby") {
    // Lobbies count down to their start, running games count up.
    if (game.startsAt && game.startsAt > Date.now()) activity.endTimestamp = Math.floor(game.startsAt / 1000)
  } else if (game.startTimestamp) {
    activity.startTimestamp = game.startTimestamp
  }

  // Only the game path is shared: the page URL can carry private lobby parameters (?lobby&s=...).
  // Public free-for-all matches stay unspectatable, as in the game's own lobby sharing:
  // a live link would allow ghosting and stream sniping.
  const isPublicFfa = game.gameType === "Public" && game.gameMode !== "Team"
  if (game.kind === "multiplayer" && game.gameId && game.phase !== "finished" && settings.allowSpectate && !isPublicFfa) {
    const spectatorUrl = new URL(window.location.pathname, window.location.origin)
    spectatorUrl.searchParams.set("spectate", "")
    activity.buttons?.push({ label: strings.spectate, url: spectatorUrl.href })
  }

  if (game.kind === "replay" && game.gameId) {
    const origin = window.location.origin.replace("//replay.", "//")
    activity.buttons?.push({ label: strings.watchReplay, url: `${origin}/game/${encodeURIComponent(game.gameId)}` })
  }

  const profileId = getProfileId()
  if (settings.shareProfile && profileId) {
    activity.buttons?.push({
      label: strings.viewProfile,
      url: `https://openfront.io/player/${encodeURIComponent(profileId)}`,
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
    largeImageText: "OpenFront.io",
    smallImageKey: "search",
    type: PresenceType.Playing,
  })
})
