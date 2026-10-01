import { PresenceType } from "@nowly/sdk"
import { getFandomPage } from "./utils/page"
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
      "en-US": "Show general Fandom browsing when no wiki page is open.",
      "fr-FR": "Affiche la navigation générale sur Fandom lorsqu'aucune page wiki n'est ouverte.",
      "es-ES": "Muestra la navegación general por Fandom cuando no hay ninguna página wiki abierta.",
    },
  },
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show page button",
      "fr-FR": "Afficher le bouton de la page",
      "es-ES": "Mostrar botón de la página",
    },
    description: {
      "en-US": "Add a button to open the Fandom page you're viewing.",
      "fr-FR": "Ajoute un bouton pour ouvrir la page Fandom consultée.",
      "es-ES": "Añade un botón para abrir la página de Fandom que estás viendo.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { hostname, pathname, href } = document.location
  const page = getFandomPage(hostname, pathname, href, strings)

  if (!page.isSpecific && !ctx.settings.showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: page.details,
    state: page.state,
    largeImageKey: page.image || Assets.Logo,
    largeImageText: page.image ? page.state : undefined,
    smallImageKey: page.image ? Assets.Logo : undefined,
    smallImageText: page.image ? "Fandom" : undefined,
    buttons: ctx.settings.showButtons && page.buttonUrl
      ? [{ label: strings.openPage, url: page.buttonUrl }]
      : undefined,
  })
})
