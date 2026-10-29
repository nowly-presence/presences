import { PresenceType } from "@nowly/sdk"
import { getMapThumbnailUrl, getPlayerName, getProfileId, normalizeMapId } from "./utils/activity"
import { getCurrentGame, getLoadedMapId } from "./utils/game"
import type enUS from "./locales/en-US.json"

const presence = new Presence()

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const game = await getCurrentGame((message) => presence.info(message))

  if (!game) {
    presence.clearActivity()
    return
  }

  const mapName = game.map
  const playerName = getPlayerName()
  const profileId = getProfileId()
  // Only the game path: the page URL can carry private lobby parameters (?lobby&s=...).
  const spectatorUrl = new URL(window.location.pathname, window.location.origin)
  spectatorUrl.searchParams.set("spectate", "")
  // The loaded map file names the real asset folder (tournament maps differ from their display name).
  const mapId = getLoadedMapId() || (mapName ? normalizeMapId(mapName) : undefined)
  const thumbnailUrl = mapId ? getMapThumbnailUrl(mapId) : undefined
  const activity: Parameters<typeof presence.setActivity>[0] = {
    details: game.spectating ? strings.spectating : strings.playing,
    state: mapName ? presence.formatString(strings.onMap, { map: mapName }) : undefined,
    largeImageKey: thumbnailUrl || Assets.Logo,
    largeImageText: mapName || "OpenFront.io",
    smallImageKey: "play",
    smallImageText: playerName ? presence.formatString(strings.playingAs, { name: playerName }) : undefined,
    type: PresenceType.Playing,
    buttons: [],
  }

  if (game.startTimestamp) activity.startTimestamp = game.startTimestamp

  // Public free-for-all matches stay unspectatable, as in the game's own lobby sharing:
  // a live link would allow ghosting and stream sniping.
  const isPublicFfa = game.gameType === "Public" && game.gameMode !== "Team"
  if (ctx.settings.allowSpectate && !isPublicFfa) {
    activity.buttons?.push({ label: strings.spectate, url: spectatorUrl.href })
  }

  if (ctx.settings.shareProfile && profileId) {
    activity.buttons?.push({
      label: strings.viewProfile,
      url: `https://openfront.io/player/${encodeURIComponent(profileId)}`,
    })
  }

  await presence.setActivity(activity)
})
