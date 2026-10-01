import { PresenceType } from "@nowly/sdk"
import { getSteamDBPage } from "./utils/page"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show page button",
      "fr-FR": "Afficher le bouton de la page",
      "es-ES": "Mostrar botón de la página",
    },
    description: {
      "en-US": "Add a button to open the SteamDB page you're viewing.",
      "fr-FR": "Ajoute un bouton pour ouvrir la page SteamDB consultée.",
      "es-ES": "Añade un botón para abrir la página de SteamDB que estás viendo.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { hostname, pathname, href } = document.location
  const page = getSteamDBPage(hostname, pathname, href, strings)

  await presence.setActivity({
    details: page.details,
    state: page.state,
    largeImageKey: page.image || Assets.Logo,
    largeImageText: page.image ? page.state : undefined,
    smallImageKey: page.image ? Assets.Logo : page.isSearch ? "search" : undefined,
    smallImageText: page.image ? "SteamDB" : undefined,
    type: PresenceType.Playing,
    buttons: ctx.settings.showButtons && page.buttonUrl
      ? [{ label: strings.openPage, url: page.buttonUrl }]
      : undefined,
  })
})
