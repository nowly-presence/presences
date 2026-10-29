import type { PresenceSetting } from "@nowly/sdk"

export default {
  showBrowsing: {
    type: "boolean",
    default: false,
    label: {
      "en-US": "Show browsing activity",
      "fr-FR": "Afficher la navigation",
      "es-ES": "Mostrar la navegación",
      "de-DE": "Navigation anzeigen",
      "el-GR": "Εμφάνιση περιήγησης",
      "ja-JP": "閲覧状況を表示",
      "ko-KR": "탐색 활동 표시",
      "ms-MY": "Tunjukkan aktiviti semakan",
      "pl-PL": "Pokazuj przeglądanie",
      "pt-BR": "Mostrar navegação",
      "tr-TR": "Gezinmeyi göster"
    },
    description: {
      "en-US": "Show what you are doing in the menus (lobbies, store, leaderboard, clans...) when you are not in a game.",
      "fr-FR": "Affiche ce que vous faites dans les menus (lobbies, boutique, classement, clans...) hors d'une partie.",
      "es-ES": "Muestra lo que haces en los menús (salas, tienda, clasificación, clanes...) cuando no estás en una partida.",
      "de-DE": "Zeigt, was du in den Menüs machst (Lobbys, Shop, Bestenliste, Clans ...), wenn du nicht im Spiel bist.",
      "el-GR": "Εμφανίζει τι κάνετε στα μενού (lobbies, κατάστημα, κατάταξη, clans...) όταν δεν είστε σε παιχνίδι.",
      "ja-JP": "ゲーム外でメニュー（ロビー、ストア、リーダーボード、クランなど）での行動を表示します。",
      "ko-KR": "게임 밖에서 메뉴(로비, 상점, 리더보드, 클랜 등)에서 하는 활동을 표시합니다.",
      "ms-MY": "Tunjukkan apa yang anda lakukan dalam menu (lobi, kedai, papan pendahulu, klan...) apabila tidak dalam permainan.",
      "pl-PL": "Pokazuj, co robisz w menu (lobby, sklep, ranking, klany...), gdy nie jesteś w grze.",
      "pt-BR": "Mostra o que você faz nos menus (lobbies, loja, ranking, clãs...) quando não está em uma partida.",
      "tr-TR": "Oyunda değilken menülerde (lobiler, mağaza, sıralama, klanlar...) ne yaptığını gösterir."
    }
  },
  shareProfile: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Share your profile",
      "fr-FR": "Partager votre profil",
      "es-ES": "Compartir tu perfil",
      "de-DE": "Profil teilen",
      "el-GR": "Κοινοποίηση προφίλ",
      "ja-JP": "プロフィールを共有",
      "ko-KR": "프로필 공유",
      "ms-MY": "Kongsi profil anda",
      "pl-PL": "Udostępniaj profil",
      "pt-BR": "Compartilhar seu perfil",
      "tr-TR": "Profilini paylaş"
    },
    description: {
      "en-US": "Show a button linking to your Openfront profile when available.",
      "fr-FR": "Affiche un bouton vers votre profil Openfront lorsqu'il est disponible.",
      "es-ES": "Muestra un botón a tu perfil de Openfront cuando esté disponible.",
      "de-DE": "Zeigt, sofern verfügbar, eine Schaltfläche zu deinem Openfront-Profil.",
      "el-GR": "Εμφανίζει ένα κουμπί προς το προφίλ Openfront σας, όταν είναι διαθέσιμο.",
      "ja-JP": "利用可能な場合、Openfrontプロフィールへのボタンを表示します。",
      "ko-KR": "사용 가능한 경우 Openfront 프로필로 연결되는 버튼을 표시합니다.",
      "ms-MY": "Paparkan butang ke profil Openfront anda apabila tersedia.",
      "pl-PL": "Pokazuj przycisk do profilu Openfront, jeśli jest dostępny.",
      "pt-BR": "Exibe um botão para seu perfil Openfront quando disponível.",
      "tr-TR": "Mevcut olduğunda Openfront profiline bağlantı düğmesini gösterir."
    }
  },
  allowSpectate: {
    type: "boolean",
    default: true,
    label: {
      "en-US": "Allow spectating",
      "fr-FR": "Autoriser le mode spectateur",
      "es-ES": "Permitir modo espectador",
      "de-DE": "Zuschauen erlauben",
      "el-GR": "Να επιτρέπεται η παρακολούθηση",
      "ja-JP": "観戦を許可",
      "ko-KR": "관전 허용",
      "ms-MY": "Benarkan tontonan",
      "pl-PL": "Zezwalaj na oglądanie",
      "pt-BR": "Permitir que assistam",
      "tr-TR": "İzlemeye izin ver"
    },
    description: {
      "en-US": "Show a button that lets friends open your game as spectators.",
      "fr-FR": "Affiche un bouton permettant à vos amis d'ouvrir votre partie en spectateur.",
      "es-ES": "Muestra un botón para que tus amigos entren a tu partida como espectadores.",
      "de-DE": "Zeigt eine Schaltfläche, über die Freunde dein Spiel als Zuschauer öffnen können.",
      "el-GR": "Εμφανίζει κουμπί ώστε οι φίλοι σας να ανοίξουν το παιχνίδι ως θεατές.",
      "ja-JP": "友達が観戦者としてゲームを開けるボタンを表示します。",
      "ko-KR": "친구가 관전자로 게임을 열 수 있는 버튼을 표시합니다.",
      "ms-MY": "Paparkan butang supaya rakan boleh membuka permainan anda sebagai penonton.",
      "pl-PL": "Pokazuj przycisk umożliwiający znajomym dołączenie do gry jako widzowie.",
      "pt-BR": "Exibe um botão para que amigos abram sua partida como espectadores.",
      "tr-TR": "Arkadaşlarının oyununu izleyici olarak açmasını sağlayan düğmeyi gösterir."
    }
  }
} satisfies Record<string, PresenceSetting>
