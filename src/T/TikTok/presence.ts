import { handleUpdate } from "./utils/activity"

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
      "en-US": "Hide every detail about the content you're watching.",
      "fr-FR": "Masque tous les détails du contenu que vous regardez.",
      "es-ES": "Oculta todos los detalles del contenido que estás viendo.",
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
      "en-US": "Show action buttons (view video, view profile) on your Discord presence.",
      "fr-FR": "Affiche les boutons d'action (voir la vidéo, voir le profil) sur votre présence Discord.",
      "es-ES": "Muestra botones de acción (ver vídeo, ver perfil) en tu presencia de Discord.",
    },
  },
  showProfileUsernames: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Show profile info",
      "fr-FR": "Afficher les infos du profil",
      "es-ES": "Mostrar información del perfil",
    },
    description: {
      "en-US": "Show usernames when you browse profiles.",
      "fr-FR": "Affiche les identifiants lorsque vous consultez des profils.",
      "es-ES": "Muestra los nombres de usuario al explorar perfiles.",
    },
  },
})

const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => handleUpdate(presence, ctx))
