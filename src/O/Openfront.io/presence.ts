import { PresenceType } from "@nowly/sdk"
import { getMapThumbnailUrl, getPlayerName, getProfileId } from "./utils/activity"
import { getCurrentGame } from "./utils/game"
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
  const spectatorUrl = new URL(window.location.href)
  spectatorUrl.searchParams.set("spectate", "")
  const thumbnailUrl = mapName ? getMapThumbnailUrl(mapName) : undefined
  const activity: Parameters<typeof presence.setActivity>[0] = {
    details: window.location.search.includes("spectate") ? strings.spectating : strings.playing,
    state: mapName ? presence.formatString(strings.onMap, { map: mapName }) : undefined,
    largeImageKey: thumbnailUrl || Assets.Logo,
    largeImageText: mapName || "OpenFront.io",
    smallImageText: playerName ? presence.formatString(strings.playingAs, { name: playerName }) : undefined,
    type: PresenceType.Playing,
    buttons: [],
  }

  if (ctx.settings.allowSpectate) {
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
