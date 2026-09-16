import type enUS from "../locales/en-US.json"

const CategoryAssets = Presence.Assets({
  Cinema: "/categories/cinema.png",
  Series: "/categories/series.png",
  Sport: "/categories/sport.png",
  Jeunesse: "/categories/jeunesse.png",
  Documentaires: "/categories/documentaire.png",
  Divertissement: "/categories/divertissement.png",
  PourVous: "/categories/pour-vous.png",
  Info: "/categories/info.png",
  Musique: "/categories/musique.png",
  CanalVod: "/categories/canal-vod.png",
  LaPresse: "/categories/la-presse.png",
  Sme: "/categories/sme.png",
  AudioDescription: "/categories/audio-description.png",
  Lsf: "/categories/lsf.png",
})

type LocaleKey = keyof typeof enUS

export type CanalCategory = {
  detailsKey: LocaleKey
  image: string
  imageTextKey: LocaleKey
}

const categories: Array<{ path: string; category: CanalCategory }> = [
  {
    path: "/cinema",
    category: {
      detailsKey: "browsingCinema",
      image: CategoryAssets.Cinema,
      imageTextKey: "imageMovies",
    },
  },
  {
    path: "/series",
    category: {
      detailsKey: "browsingSeries",
      image: CategoryAssets.Series,
      imageTextKey: "imageSeries",
    },
  },
  {
    path: "/sport",
    category: {
      detailsKey: "browsingSports",
      image: CategoryAssets.Sport,
      imageTextKey: "imageSports",
    },
  },
  {
    path: "/jeunesse",
    category: {
      detailsKey: "browsingKids",
      image: CategoryAssets.Jeunesse,
      imageTextKey: "imageKids",
    },
  },
  {
    path: "/documentaires",
    category: {
      detailsKey: "browsingDocumentaries",
      image: CategoryAssets.Documentaires,
      imageTextKey: "imageDocumentaries",
    },
  },
  {
    path: "/divertissement",
    category: {
      detailsKey: "browsingEntertainment",
      image: CategoryAssets.Divertissement,
      imageTextKey: "imageEntertainment",
    },
  },
  {
    path: "/selection-pour-vous",
    category: {
      detailsKey: "browsingPicks",
      image: CategoryAssets.PourVous,
      imageTextKey: "imageForYou",
    },
  },
  {
    path: "/info",
    category: {
      detailsKey: "browsingNews",
      image: CategoryAssets.Info,
      imageTextKey: "imageNews",
    },
  },
  {
    path: "/musique",
    category: {
      detailsKey: "browsingMusic",
      image: CategoryAssets.Musique,
      imageTextKey: "imageMusic",
    },
  },
  {
    path: "/canal-vod",
    category: {
      detailsKey: "browsingCanalVod",
      image: CategoryAssets.CanalVod,
      imageTextKey: "imageCanalVod",
    },
  },
  {
    path: "/chaines-apps/la-presse",
    category: {
      detailsKey: "browsingLaPresse",
      image: CategoryAssets.LaPresse,
      imageTextKey: "imagePress",
    },
  },
  {
    path: "/sous-titres-malentendants",
    category: {
      detailsKey: "browsingSme",
      image: CategoryAssets.Sme,
      imageTextKey: "imageSme",
    },
  },
  {
    path: "/audiodescription",
    category: {
      detailsKey: "browsingAudioDescription",
      image: CategoryAssets.AudioDescription,
      imageTextKey: "imageAudioDescription",
    },
  },
  {
    path: "/langue-des-signes-francaise",
    category: {
      detailsKey: "browsingLsf",
      image: CategoryAssets.Lsf,
      imageTextKey: "imageLsf",
    },
  },
]

export const getCategory = (pathname: string): CanalCategory | undefined =>
  categories.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`))?.category
