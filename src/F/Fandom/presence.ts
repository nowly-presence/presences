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
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()
  const { hostname, pathname, href } = document.location
  const page = getFandomPage(hostname, pathname, href, strings)
  const showBrowsing = ctx.settings.showBrowsing

  if (!page.isSpecific && !showBrowsing) {
    presence.clearActivity()
    return
  }

  await presence.setActivity({
    details: page.details,
    state: page.state,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
