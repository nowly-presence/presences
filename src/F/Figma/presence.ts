import { PresenceType } from "@nowly/sdk"
import { getFigmaMode, getFileName } from "./utils/dom"

const settings = Presence.Settings({
  showFileName: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show file/project name",
      "fr-FR": "Afficher le nom du fichier/projet",
      "es-ES": "Mostrar el nombre del archivo/proyecto",
    },
    description: {
      "en-US": "When enabled, your presence will show the name of the file or project you have open.",
      "fr-FR": "Si activé, ta présence affichera le nom du fichier ou du projet ouvert.",
      "es-ES": "Si está activado, tu presencia mostrará el nombre del archivo o proyecto abierto.",
    },
  },
})

const presence = new Presence(settings)

const ModeAssets = Presence.Assets({
  Design: "modes/design.png",
  FigJam: "modes/figjam.png",
  Slides: "modes/slides.png",
  Make: "modes/make.png",
  Buzz: "modes/buzz.png",
  Sites: "modes/sites.png",
})

type FileMode = "design" | "figjam" | "slides" | "make" | "buzz" | "sites"

const MODE_DETAILS: Record<FileMode, string> = {
  design: "Designing on Figma",
  figjam: "Whiteboarding on FigJam",
  slides: "Presenting on Figma Slides",
  make: "Building on Figma Make",
  buzz: "Creating on Figma Buzz",
  sites: "Building on Figma Sites",
}

const MODE_LARGE_IMAGE: Record<FileMode, string> = {
  design: ModeAssets.Design,
  figjam: ModeAssets.FigJam,
  slides: ModeAssets.Slides,
  make: ModeAssets.Make,
  buzz: ModeAssets.Buzz,
  sites: ModeAssets.Sites,
}

presence.on("UpdateData", async (ctx) => {
  const { pathname } = document.location
  const mode = getFigmaMode(pathname)

  if (mode === "home" || mode === "other") {
    await presence.setActivity({
      details: mode === "home" ? "Browsing homepage" : "Browsing Figma",
      largeImageKey: Assets.Logo,
      largeImageText: "Figma",
      smallImageKey: Assets.Icon,
      type: PresenceType.Watching,
    })
    return
  }

  const fileName = ctx.settings.showFileName ? getFileName(pathname, document.title) : undefined

  await presence.setActivity({
    details: MODE_DETAILS[mode],
    state: fileName,
    largeImageKey: MODE_LARGE_IMAGE[mode],
    largeImageText: MODE_DETAILS[mode],
    smallImageKey: Assets.Logo,
    smallImageText: "Figma",
    type: PresenceType.Watching,
  })
})
