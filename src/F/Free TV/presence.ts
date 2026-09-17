import { createMediaTimestamps, PresenceType } from "@nowly/sdk"
import { getLatestFreeTvEvent, installFreeTvBridge } from "./utils/bridge"
import { findVideo, getMode, getTitle, isVideoPlaying } from "./utils/dom"
import type enUS from "./locales/en-US.json"

installFreeTvBridge()

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
      "en-US": "When enabled, your Discord presence also shows when you browse Free TV - not only when a channel or movie is playing.",
      "fr-FR": "Lorsque cette option est activée, votre présence Discord s'affiche aussi lorsque vous parcourez Free TV, pas seulement pendant la lecture d'une chaîne ou d'un film.",
      "es-ES": "Si está activada, tu presencia de Discord también se muestra al explorar Free TV, no solo al ver un canal o una película.",
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
    const event = getLatestFreeTvEvent()
    const fallbackTitle = getTitle()

    const state = mode === "live"
      ? (event.channelName && event.programName
        ? presence.formatString(strings.liveState, { channel: event.channelName, program: event.programName })
        : event.channelName || event.programName || fallbackTitle)
      : (event.programName || fallbackTitle)

    const video = findVideo()

    await presence.setActivity({
      details: mode === "live" ? strings.watchingLive : strings.watchingVod,
      state,
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

  const browsingDetails: Record<string, string> = {
    home: strings.browsingHome,
    channels: strings.browsingChannels,
    vodHub: strings.browsingVodHub,
    tvGuide: strings.browsingTvGuide,
    myList: strings.browsingMyList,
    detail: strings.viewingDetail,
  }

  await presence.setActivity({
    details: browsingDetails[mode] ?? strings.browsingHome,
    largeImageKey: Assets.Logo,
    largeImageText: "Free TV",
    smallImageKey: Assets.Icon,
    type: PresenceType.Watching,
  })
})
