import { PresenceType } from "@nowly/sdk"
import { handleGitHub } from "./utils/activity"
import { handleBlog } from "./utils/blog"
import { handleGist } from "./utils/gists"
import { handleGitHubNext } from "./utils/next"
import { handleGitHubUniverse } from "./utils/universe"
import type enUS from "./locales/en-US.json"

const settings = Presence.Settings({
  showPrivateRepositories: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show private repositories",
      "fr-FR": "Afficher les dépôts privés",
      "es-ES": "Mostrar repositorios privados",
    },
    description: {
      "en-US": "When enabled, private repository pages can appear on your Discord presence. No repository button is shown.",
      "fr-FR": "Lorsque cette option est activée, les pages de dépôts privés peuvent apparaître sur votre présence Discord. Aucun bouton vers le dépôt n'est affiché.",
      "es-ES": "Si está activada, las páginas de repositorios privados pueden aparecer en tu presencia de Discord. No se muestra ningún botón al repositorio.",
    },
  },
  showGists: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show Gist activity",
      "fr-FR": "Afficher l’activité Gist",
      "es-ES": "Mostrar actividad de Gist",
    },
    description: {
      "en-US": "Show activity when you browse gist.github.com.",
      "fr-FR": "Affiche votre activité lorsque vous parcourez gist.github.com.",
      "es-ES": "Muestra actividad cuando exploras gist.github.com.",
    },
  },
  showBlog: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show GitHub Blog activity",
      "fr-FR": "Afficher l’activité GitHub Blog",
      "es-ES": "Mostrar actividad de GitHub Blog",
    },
    description: {
      "en-US": "Show activity when you read GitHub Blog.",
      "fr-FR": "Affiche votre activité lorsque vous lisez GitHub Blog.",
      "es-ES": "Muestra actividad cuando lees GitHub Blog.",
    },
  },
  showGitHubNext: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show GitHub Next activity",
      "fr-FR": "Afficher l’activité GitHub Next",
      "es-ES": "Mostrar actividad de GitHub Next",
    },
    description: {
      "en-US": "Show activity when you browse githubnext.com.",
      "fr-FR": "Affiche votre activité lorsque vous parcourez githubnext.com.",
      "es-ES": "Muestra actividad cuando exploras githubnext.com.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  try {
    const { hostname, pathname, href, search } = document.location

    if (hostname === "gist.github.com") {
      if (!ctx.settings.showGists) {
        presence.clearActivity()
        return
      }

      await handleGist(presence, pathname, href)
      return
    }

    if (hostname === "github.blog") {
      if (!ctx.settings.showBlog) {
        presence.clearActivity()
        return
      }

      await handleBlog(presence, pathname, href)
      return
    }

    if (hostname === "githubnext.com") {
      if (!ctx.settings.showGitHubNext) {
        presence.clearActivity()
        return
      }

      await handleGitHubNext(presence, pathname, href)
      return
    }

    if (hostname === "githubuniverse.com") {
      await handleGitHubUniverse(presence, href)
      return
    }

    if (hostname !== "github.com") {
      presence.clearActivity()
      return
    }

    await handleGitHub(presence, pathname, search, href, ctx.settings.showPrivateRepositories)
  } catch (error) {
    presence.error(`GitHub presence error: ${error}`)
    const strings = await presence.getStrings<typeof enUS>()
    await presence.setActivity({
      details: strings.browsingGitHub,
      largeImageKey: Assets.Logo,
      largeImageText: "GitHub",
      type: PresenceType.Watching,
    })
  }
})