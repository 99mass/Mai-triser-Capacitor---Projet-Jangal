import type { Cours } from "../types";
import { astuce, liste, p, quiz, t, texte, video } from "../fabrique";

export const coursBusiness: Cours = {
  id: "lancer-son-activite",
  titre: "Lancer son activité en Afrique de l'Ouest",
  accroche: "De l'idée aux premiers clients, étape par étape.",
  description:
    "Formaliser son entreprise, fixer ses prix, gérer sa trésorerie avec le Mobile Money et trouver ses premiers clients sur WhatsApp. Un cours pratique, ancré dans la réalité de l'UEMOA.",
  categorie: "business",
  niveau: "Débutant",
  formateur: { nom: "Ibrahima Fall", role: "Entrepreneur et coach", ville: "Dakar" },
  image: "/images/cours/business.svg",
  prix: 7500,
  note: 4.7,
  nbAvis: 152,
  nbApprenants: 1280,
  objectifs: [
    "Tester une idée avant d'investir",
    "Construire un business model simple",
    "Fixer un prix rentable",
    "Vendre grâce aux réseaux sociaux",
  ],
  chapitres: [
    {
      id: "c1",
      titre: "De l'idée au projet",
      lecons: [
        video("l1", "Trouver une bonne idée", 7, "lapin", "Partir d'un problème réel que vous connaissez bien."),
        texte("l2", "Tester son idée sans argent", 8, [
          p("Avant d'investir, vérifiez que des personnes sont prêtes à payer."),
          liste(
            "Parlez à 10 clients potentiels",
            "Proposez une précommande ou un acompte",
            "Créez un statut WhatsApp pour mesurer l'intérêt",
          ),
        ]),
        texte("l3", "Choisir un statut juridique", 9, [
          t("Les options courantes"),
          liste(
            "Entreprise individuelle : simple, idéale pour démarrer",
            "SARL / SARLU : protège votre patrimoine personnel",
            "GIE : pour mutualiser avec d'autres entrepreneurs",
          ),
          astuce("Au Sénégal, l'APIX permet de créer son entreprise en quelques jours via un guichet unique."),
        ]),
        video("l4", "Témoignage : une boutique de bissap", 6, "fleur", "Comment Coumba est passée de 20 à 300 bouteilles par semaine."),
      ],
    },
    {
      id: "c2",
      titre: "Business model et finances",
      lecons: [
        texte("l5", "Le business model en une page", 8, [
          p("Répondez à quatre questions : pour qui ? quel problème ? quelle solution ? comment gagner de l'argent ?"),
        ]),
        texte("l6", "Fixer son prix", 8, [
          p("Prix de vente = coût de revient + marge. Vérifiez ensuite que ce prix est acceptable pour vos clients."),
          astuce("Ne fixez jamais votre prix uniquement en copiant la concurrence : vos coûts ne sont pas les mêmes."),
        ]),
        video("l7", "Gérer sa trésorerie avec le Mobile Money", 9, "vendredi", "Séparer argent personnel et argent de l'entreprise avec Wave et Orange Money."),
        quiz("l8", "Quiz : bien démarrer", [
          {
            enonce: "Quelle est la meilleure première étape pour tester une idée ?",
            choix: ["Louer un local", "Parler à des clients potentiels", "Imprimer des flyers", "Faire un prêt"],
            bonneReponse: 1,
            explication: "Parler aux clients coûte peu et révèle s'il existe un vrai besoin.",
          },
          {
            enonce: "Comment calcule-t-on un prix de vente ?",
            choix: ["Prix du concurrent − 10 %", "Coût de revient + marge", "Au hasard", "Prix d'achat × 10"],
            bonneReponse: 1,
            explication: "Le prix doit couvrir tous les coûts et dégager une marge.",
          },
          {
            enonce: "Quel statut protège le patrimoine personnel de l'entrepreneur ?",
            choix: ["Entreprise individuelle", "SARL", "Aucun", "Association"],
            bonneReponse: 1,
            explication: "Dans une SARL, la responsabilité est limitée aux apports.",
          },
          {
            enonce: "Pourquoi séparer argent personnel et argent de l'entreprise ?",
            choix: [
              "Pour payer moins d'impôts",
              "Pour savoir si l'activité est vraiment rentable",
              "C'est interdit de les mélanger",
              "Pour impressionner les clients",
            ],
            bonneReponse: 1,
            explication: "Sans séparation, impossible de connaître ses vrais bénéfices.",
          },
          {
            enonce: "Combien de questions structurent un business model en une page ?",
            choix: ["2", "4", "10", "20"],
            bonneReponse: 1,
            explication: "Pour qui, quel problème, quelle solution, comment gagner de l'argent.",
          },
        ]),
      ],
    },
    {
      id: "c3",
      titre: "Vendre et se faire connaître",
      lecons: [
        video("l9", "WhatsApp Business", 8, "bunny", "Catalogue, réponses rapides et étiquettes pour suivre vos clients."),
        texte("l10", "Fidéliser ses clients", 6, [
          liste("Répondez vite, même pour dire « je reviens vers vous »", "Demandez un avis après chaque vente", "Récompensez les clients qui vous recommandent"),
        ]),
        texte("l11", "Suivre ses chiffres", 6, [
          p("Chaque semaine, notez trois chiffres : ventes, dépenses, nombre de nouveaux clients. Un simple cahier suffit pour commencer."),
        ]),
      ],
    },
  ],
};
