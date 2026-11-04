import type { PresenceSetting } from "@nowly/sdk"

export default {
  showButtons: {
    type: "boolean",
    default: true,
    label: {
      "fr-FR": "Afficher les boutons",
      "en-US": "Show buttons",
      "es-ES": "Mostrar botones",
    },
    description: {
      "fr-FR": "Affiche un bouton pour ouvrir la page en cours.",
      "en-US": "Show a button to open the current page.",
      "es-ES": "Muestra un botón para abrir la página actual.",
    },
  },
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "fr-FR": "Afficher l'activité de navigation",
      "en-US": "Show browsing activity",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "fr-FR": "Affiche l'activité sur les autres pages du site.",
      "en-US": "Show activity on the other pages of the site.",
      "es-ES": "Muestra actividad en las demás páginas del sitio.",
    },
  },
} satisfies Record<string, PresenceSetting>
