import type { Cours } from "../types";
import { astuce, liste, p, quiz, t, texte, video } from "../fabrique";

export const coursAnglais: Cours = {
  id: "anglais-professionnel",
  titre: "Anglais professionnel",
  accroche: "Présentez-vous, écrivez et réussissez vos entretiens en anglais.",
  description:
    "Le Nigeria et le Ghana sont à côté, les offres internationales se multiplient : l'anglais ouvre des portes. Ce cours vous entraîne aux situations concrètes du travail : présentations, e-mails, réunions et entretiens d'embauche.",
  categorie: "langues",
  niveau: "Intermédiaire",
  formateur: { nom: "Mariama Traoré", role: "Professeure d'anglais", ville: "Bamako" },
  image: "/images/cours/anglais.svg",
  prix: 0,
  note: 4.5,
  nbAvis: 177,
  nbApprenants: 4120,
  objectifs: [
    "Se présenter avec aisance",
    "Rédiger un e-mail professionnel",
    "Participer à une réunion",
    "Répondre aux questions d'entretien",
  ],
  chapitres: [
    {
      id: "c1",
      titre: "Se présenter",
      lecons: [
        video("l1", "Introducing yourself", 6, "vendredi", "Les formules pour se présenter en contexte professionnel."),
        texte("l2", "Parler de son parcours", 7, [
          t("Phrases utiles"),
          liste(
            "I graduated from Cheikh Anta Diop University in 2023.",
            "I'm currently working as a junior developer.",
            "I'm passionate about data and education.",
          ),
          astuce("Préparez un « elevator pitch » de 30 secondes et répétez-le à voix haute chaque jour pendant une semaine."),
        ]),
        texte("l3", "Les faux amis", 6, [
          liste("actually = en fait (et non « actuellement »)", "eventually = finalement", "library = bibliothèque (et non « librairie »)"),
        ]),
      ],
    },
    {
      id: "c2",
      titre: "E-mails et réunions",
      lecons: [
        texte("l4", "Écrire un e-mail professionnel", 8, [
          p("Un e-mail efficace tient en cinq lignes : salutation, objet, détail, action attendue, formule de politesse."),
          liste("Dear Mr. Mensah,", "I'm writing to follow up on…", "Could you please send me…?", "Best regards,"),
        ]),
        video("l5", "Participer à une réunion", 8, "fleur", "Donner son avis, demander une précision, conclure poliment."),
        texte("l6", "Au téléphone", 6, [
          liste("Could you speak a little more slowly, please?", "Let me check and get back to you.", "Sorry, the line is bad. Could you repeat?"),
        ]),
        quiz("l7", "Quiz : l'anglais au travail", [
          {
            enonce: "Que signifie « actually » ?",
            choix: ["Actuellement", "En fait", "Activement", "Bientôt"],
            bonneReponse: 1,
            explication: "C'est un faux ami : « actuellement » se dit « currently ».",
          },
          {
            enonce: "Quelle formule termine un e-mail professionnel ?",
            choix: ["See ya!", "Best regards,", "Bye bye", "Cheers mate"],
            bonneReponse: 1,
            explication: "« Best regards » est neutre et adapté à tous les contextes professionnels.",
          },
          {
            enonce: "Comment demander à quelqu'un de parler plus lentement ?",
            choix: ["Speak slow!", "Could you speak more slowly, please?", "You talk too fast.", "Stop talking."],
            bonneReponse: 1,
            explication: "« Could you… please? » est la forme polie de la demande.",
          },
          {
            enonce: "« Library » se traduit par :",
            choix: ["Librairie", "Bibliothèque", "Liberté", "Laboratoire"],
            bonneReponse: 1,
            explication: "Une librairie se dit « bookshop » ou « bookstore ».",
          },
          {
            enonce: "Quelle phrase utiliser pour dire que vous reviendrez vers quelqu'un ?",
            choix: ["I come back you.", "Let me check and get back to you.", "I return later.", "Wait me."],
            bonneReponse: 1,
            explication: "« Get back to someone » signifie recontacter quelqu'un avec une réponse.",
          },
        ]),
      ],
    },
    {
      id: "c3",
      titre: "L'entretien d'embauche",
      lecons: [
        video("l8", "Les questions classiques", 9, "lapin", "« Tell me about yourself », « Why should we hire you? » et comment y répondre."),
        texte("l9", "La méthode STAR", 7, [
          p("Pour raconter une expérience : Situation, Task (mission), Action, Result. Votre réponse devient claire et convaincante."),
        ]),
        texte("l10", "Poser ses propres questions", 5, [
          liste("What does a typical day look like in this role?", "How do you measure success for this position?", "What are the next steps?"),
        ]),
        video("l11", "Simulation d'entretien", 10, "bunny", "Un entretien complet, commenté phrase par phrase."),
      ],
    },
  ],
};
