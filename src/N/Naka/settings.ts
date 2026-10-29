import type { PresenceSetting } from "@nowly/sdk"

export default {
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher l'activité de navigation",
      "es-ES": "Mostrar actividad de navegación",
    },
    description: {
      "en-US": "When enabled, your presence will also show when browsing Naka (home, search, etc.), not just when watching a video.",
      "fr-FR": "Quand cette option est activée, votre présence s'affiche aussi lorsque vous naviguez sur Naka (accueil, recherche, etc.), pas seulement pendant une vidéo.",
      "es-ES": "Al activarla, tu presencia también se mostrará al navegar por Naka (inicio, búsqueda, etc.), no solo al ver un vídeo.",
    },
  },
} satisfies Record<string, PresenceSetting>
