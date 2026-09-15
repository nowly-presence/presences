import { createMediaTimestamps, PresenceType, type PresenceData } from "@nowly/sdk"
import { getMediaElement, getMediaSessionTrack, toDiscordImage } from "./utils/track"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  privacy: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Privacy mode",
      "fr-FR": "Mode privé",
      "es-ES": "Modo privado",
    },
    description: {
      "en-US": "Hide the track title, artist, artwork, and buttons.",
      "fr-FR": "Masque le titre, l'artiste, la pochette et les boutons.",
      "es-ES": "Oculta el título, artista, portada y botones.",
    },
  },
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "Show activity while you browse SoundCloud with no track detected.",
      "fr-FR": "Affiche l'activité lorsque vous parcourez SoundCloud sans titre détecté.",
      "es-ES": "Muestra actividad al explorar SoundCloud sin una pista detectada.",
    },
  },
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show buttons",
      "fr-FR": "Afficher les boutons",
      "es-ES": "Mostrar botones",
    },
    description: {
      "en-US": "Show a button to open the current page.",
      "fr-FR": "Affiche un bouton pour ouvrir la page en cours.",
      "es-ES": "Muestra un botón para abrir la página actual.",
    },
  },
})

const presence = new Presence(settings)

const isEnabled = (value: unknown): boolean => value === true || value === "true"

const browsingDetails = (pathname: string, strings: typeof enUS): string => {
  if (pathname.startsWith("/search") || pathname.startsWith("/you/search")) return strings.searching
  if (pathname.startsWith("/discover")) return strings.browsingDiscover
  if (pathname.split("/").filter(Boolean).length === 1) return strings.viewingProfile
  return strings.browsingSoundCloud
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const privacy = isEnabled(ctx.settings.privacy)
  const showButtons = !("showButtons" in ctx.settings) || isEnabled(ctx.settings.showButtons)
  const showBrowsing = isEnabled(ctx.settings.showBrowsing)
  const media = getMediaElement()
  const track = getMediaSessionTrack(document.location.href.split("?")[0] ?? document.location.href)

  if (track) {
    const playing = media ? !media.paused : track.playing
    const data: PresenceData = {
      details: privacy ? strings.listeningToMusic : track.title,
      state: privacy ? undefined : track.artist,
      largeImageKey: privacy ? Assets.Logo : toDiscordImage(track.artwork) ?? Assets.Logo,
      largeImageText: privacy ? "SoundCloud" : track.title,
      smallImageKey: playing ? "play" : "pause",
      smallImageText: playing ? strings.playing : strings.paused,
      type: PresenceType.Listening,
    }

    if (playing && media) Object.assign(data, createMediaTimestamps(media))

    if (!privacy && showButtons) {
      data.buttons = [{ label: strings.listen, url: track.url }]
    }

    await presence.setActivity(data)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: browsingDetails(document.location.pathname, strings),
    largeImageKey: Assets.Logo,
    largeImageText: "SoundCloud",
    type: PresenceType.Listening,
  })
})
