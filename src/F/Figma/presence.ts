import { PresenceType } from "@nowly/sdk"
import { getFigmaMode, getFileName } from "./utils/dom"
import type enUS from "./locales/en-US.json"

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

type FileMode = "design" | "figjam" | "slides" | "make" | "buzz" | "sites" | "proto"

const MODE_LARGE_IMAGE: Record<FileMode, string> = {
  design: ModeAssets.Design,
  figjam: ModeAssets.FigJam,
  slides: ModeAssets.Slides,
  make: ModeAssets.Make,
  buzz: ModeAssets.Buzz,
  sites: ModeAssets.Sites,
  proto: ModeAssets.Design,
}

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const modeDetails: Record<FileMode, string> = {
    design: strings.designing,
    figjam: strings.whiteboarding,
    slides: strings.presentingSlides,
    make: strings.buildingMake,
    buzz: strings.creatingBuzz,
    sites: strings.buildingSites,
    proto: strings.presentingPrototype,
  }
  const { pathname } = document.location
  const mode = getFigmaMode(pathname)

  if (mode === "home" || mode === "other") {
    await presence.setActivity({
      details: mode === "home" ? strings.browsingHomepage : strings.browsingFigma,
      largeImageKey: Assets.Logo,
      largeImageText: "Figma",
      smallImageKey: Assets.Icon,
      type: PresenceType.Watching,
    })
    return
  }

  const fileName = ctx.settings.showFileName ? getFileName(pathname, document.title) : undefined

  await presence.setActivity({
    details: modeDetails[mode],
    state: fileName,
    largeImageKey: MODE_LARGE_IMAGE[mode],
    largeImageText: modeDetails[mode],
    smallImageKey: Assets.Logo,
    smallImageText: "Figma",
    type: PresenceType.Watching,
  })
})
