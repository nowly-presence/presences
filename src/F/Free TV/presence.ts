import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { findVideo, getMode, getTitle, isVideoPlaying } from "./utils/dom"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "When enabled, your presence will also show when browsing Free TV without watching a channel or a movie.",
      "fr-FR": "Quand activé, ta présence s'affichera aussi lorsque tu navigues sur Free TV sans regarder de chaîne ou de film.",
      "es-ES": "Cuando está activado, tu presencia también se mostrará al navegar por Free TV sin ver un canal o una película.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const mode = getMode(document.location.pathname)

  if (mode === "hidden") {
    presence.clearActivity()
    return
  }

  const strings = await presence.getStrings<typeof enUS>()

  if (mode === "live" || mode === "vod") {
    const video = findVideo()
    const title = getTitle()

    await presence.setActivity({
      details: mode === "live" ? strings.watchingLive : strings.watchingVod,
      state: title,
      largeImageKey: Assets.Logo,
      largeImageText: "Free TV",
      smallImageKey: Assets.Icon,
      type: PresenceType.Watching,
      ...(isVideoPlaying(video) ? createMediaTimestamps(video!) : {}),
    })
    return
  }

  if (!ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: strings.browsing,
    largeImageKey: Assets.Logo,
    largeImageText: "Free TV",
    smallImageKey: Assets.Icon,
    type: PresenceType.Watching,
  })
})
