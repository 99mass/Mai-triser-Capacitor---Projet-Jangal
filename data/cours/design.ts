import type { Cours } from "../types";
import { astuce, liste, p, quiz, t, texte, video } from "../fabrique";

export const coursDesign: Cours = {
  id: "design-ui-ux",
  titre: "Design UI/UX : les fondamentaux",
  accroche: "Concevez des applications simples, belles et utiles.",
  description:
    "Comprendre ses utilisateurs, organiser l'information, choisir couleurs et typographies, puis prototyper sur Figma. Un cours concret pour concevoir des écrans adaptés aux usages mobiles en Afrique.",
  categorie: "design",
  niveau: "Débutant",
  formateur: { nom: "Aïssatou Ba", role: "Designer produit", ville: "Abidjan" },
  image: "/images/cours/design.svg",
  prix: 0,
  note: 4.6,
  nbAvis: 98,
  nbApprenants: 1610,
  objectifs: [
    "Mener de courts entretiens utilisateurs",
    "Appliquer les règles de hiérarchie visuelle",
    "Construire une palette accessible",
    "Prototyper un parcours sur Figma",
  ],
  chapitres: [
    {
      id: "c1",
      titre: "Penser utilisateur",
      lecons: [
        video("l1", "UI, UX : quelle différence ?", 6, "fleur", "L'interface est ce que l'on voit ; l'expérience est ce que l'on ressent."),
        texte("l2", "Interroger ses utilisateurs", 8, [
          p("Cinq entretiens suffisent pour découvrir la majorité des problèmes d'un produit."),
          liste(
            "Posez des questions ouvertes : « Racontez-moi la dernière fois que… »",
            "Observez plutôt que de demander « Vous aimeriez… ? »",
            "Notez les mots exacts utilisés par la personne",
          ),
        ]),
        texte("l3", "Le parcours utilisateur", 7, [
          p("Un parcours décrit les étapes, les émotions et les points de friction d'un utilisateur qui veut atteindre un but."),
          astuce("Pensez aux coupures réseau : que voit l'utilisateur quand la connexion tombe au milieu du parcours ?"),
        ]),
      ],
    },
    {
      id: "c2",
      titre: "Les règles visuelles",
      lecons: [
        video("l4", "Hiérarchie et espacement", 8, "lapin", "Guider le regard avec la taille, le poids et l'espace."),
        texte("l5", "Couleurs et contraste", 8, [
          p("Un bon contraste rend l'application lisible en plein soleil, une situation fréquente sur mobile."),
          liste("Texte normal : contraste d'au moins 4,5:1", "Gros texte : au moins 3:1", "Ne jamais transmettre une information par la couleur seule"),
        ]),
        texte("l6", "Typographie", 6, [
          t("Deux polices maximum"),
          p("Une police pour les titres, une pour le texte, et une échelle de tailles cohérente (14, 16, 20, 24, 32)."),
        ]),
        quiz("l7", "Quiz : les règles visuelles", [
          {
            enonce: "Quel contraste minimum recommande-t-on pour un texte normal ?",
            choix: ["2:1", "3:1", "4,5:1", "10:1"],
            bonneReponse: 2,
            explication: "Les règles WCAG demandent au moins 4,5:1 pour le texte courant.",
          },
          {
            enonce: "Combien d'entretiens suffisent à repérer la plupart des problèmes ?",
            choix: ["1", "5 environ", "50", "500"],
            bonneReponse: 1,
            explication: "Au-delà de cinq personnes, les mêmes problèmes reviennent souvent.",
          },
          {
            enonce: "Quelle taille minimale pour une zone tactile sur mobile ?",
            choix: ["16 px", "24 px", "44 px", "100 px"],
            bonneReponse: 2,
            explication: "44 px (ou 48 dp sur Android) permet de toucher l'élément sans erreur.",
          },
          {
            enonce: "Que décrit un parcours utilisateur ?",
            choix: [
              "Le code de l'application",
              "Les étapes et ressentis d'un utilisateur pour atteindre un but",
              "La palette de couleurs",
              "Le plan marketing",
            ],
            bonneReponse: 1,
            explication: "Le parcours montre les étapes, émotions et frictions rencontrées.",
          },
          {
            enonce: "Pourquoi ne pas transmettre une information par la couleur seule ?",
            choix: [
              "Parce que c'est démodé",
              "Parce que certaines personnes distinguent mal les couleurs",
              "Parce que les écrans n'affichent pas le rouge",
              "Parce que c'est plus lent",
            ],
            bonneReponse: 1,
            explication: "Ajoutez une icône ou un texte : le daltonisme touche environ 1 homme sur 12.",
          },
        ]),
      ],
    },
    {
      id: "c3",
      titre: "Prototyper sur Figma",
      lecons: [
        video("l8", "Prise en main de Figma", 9, "vendredi", "Frames, calques et composants : l'essentiel pour démarrer."),
        texte("l9", "Créer des composants", 7, [
          p("Un composant Figma est un élément réutilisable : modifiez le principal, toutes les copies se mettent à jour."),
          liste("Boutons", "Champs de saisie", "Cartes de cours", "Barre d'onglets"),
        ]),
        video("l10", "Relier les écrans", 8, "fleur", "Rendre un prototype cliquable pour le tester avec de vrais utilisateurs."),
        texte("l11", "Tester son prototype", 6, [
          p("Donnez une tâche précise (« Inscrivez-vous à un cours ») et observez sans aider. Chaque hésitation est une piste d'amélioration."),
        ]),
      ],
    },
  ],
};
