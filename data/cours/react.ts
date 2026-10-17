import type { Cours } from "../types";
import { astuce, code, liste, p, quiz, t, texte, video } from "../fabrique";

export const coursReact: Cours = {
  id: "bases-react",
  titre: "Les bases de React",
  accroche: "Créez des interfaces web modernes, composant par composant.",
  description:
    "React est la bibliothèque la plus demandée par les startups de Dakar à Lagos. Dans ce cours, vous apprenez à penser en composants, à gérer l'état d'une page et à construire une petite application de suivi de dépenses, pas à pas.",
  categorie: "web",
  niveau: "Débutant",
  formateur: { nom: "Awa Ndiaye", role: "Développeuse front-end", ville: "Dakar" },
  image: "/images/cours/react.svg",
  prix: 0,
  note: 4.8,
  nbAvis: 214,
  nbApprenants: 3820,
  objectifs: [
    "Créer et assembler des composants React",
    "Faire circuler les données avec les props",
    "Gérer l'état et les événements d'une page",
    "Afficher des listes et charger des données",
  ],
  chapitres: [
    {
      id: "c1",
      titre: "Premiers pas avec React",
      lecons: [
        video("l1", "Pourquoi React ?", 6, "fleur", "Ce que React apporte par rapport au HTML et au JavaScript classiques, et pourquoi tant d'entreprises l'utilisent."),
        texte("l2", "Installer son environnement", 8, [
          p("Pour développer avec React, il vous faut Node.js et un éditeur de code. Un ordinateur modeste suffit largement."),
          t("Les outils"),
          liste(
            "Node.js (version LTS) depuis nodejs.org",
            "Visual Studio Code, gratuit et léger",
            "Un navigateur récent : Chrome ou Firefox",
          ),
          t("Créer un projet"),
          code("bash", "npm create vite@latest mon-app -- --template react\ncd mon-app\nnpm install\nnpm run dev"),
          astuce("Connexion lente ? Lancez `npm install` une seule fois sur un Wi-Fi, puis travaillez hors ligne : les paquets restent dans le dossier node_modules."),
        ]),
        video("l3", "Votre premier composant", 9, "vendredi", "On écrit ensemble un composant « CarteProfil » et on l'affiche dans la page."),
        texte("l4", "Comprendre le JSX", 7, [
          p("Le JSX ressemble à du HTML, mais c'est du JavaScript. Il décrit ce que le composant doit afficher."),
          code("jsx", 'function Salutation() {\n  const prenom = "Fatou";\n  return <h1>Bonjour {prenom} !</h1>;\n}'),
          t("Trois règles à retenir"),
          liste(
            "Un composant renvoie un seul élément parent.",
            "On écrit className au lieu de class.",
            "Les accolades { } permettent d'insérer une expression JavaScript.",
          ),
        ]),
      ],
    },
    {
      id: "c2",
      titre: "Props et état",
      lecons: [
        video("l5", "Passer des données avec les props", 10, "lapin", "Les props permettent de réutiliser un même composant avec des données différentes."),
        texte("l6", "L'état avec useState", 9, [
          p("L'état, c'est la mémoire d'un composant. Quand il change, React met à jour l'affichage automatiquement."),
          code("jsx", "import { useState } from \"react\";\n\nfunction Compteur() {\n  const [total, setTotal] = useState(0);\n  return (\n    <button onClick={() => setTotal(total + 1)}>\n      Cliqué {total} fois\n    </button>\n  );\n}"),
          astuce("Ne modifiez jamais l'état directement (total = 5). Passez toujours par la fonction setTotal."),
        ]),
        video("l7", "Gérer les événements", 8, "fleur", "Clics, saisie au clavier, envoi de formulaire : comment réagir aux actions de l'utilisateur."),
        quiz("l8", "Quiz : composants et état", [
          {
            enonce: "Que renvoie un composant React ?",
            choix: ["Une chaîne de caractères HTML", "Du JSX décrivant l'interface", "Un fichier CSS", "Une requête réseau"],
            bonneReponse: 1,
            explication: "Un composant est une fonction qui renvoie du JSX, la description de ce qui doit s'afficher.",
          },
          {
            enonce: "Quel attribut remplace « class » en JSX ?",
            choix: ["cssClass", "style", "className", "classList"],
            bonneReponse: 2,
            explication: "« class » est un mot réservé en JavaScript, on utilise donc className.",
          },
          {
            enonce: "À quoi servent les props ?",
            choix: [
              "À stocker des données sur le serveur",
              "À transmettre des données d'un parent à un enfant",
              "À styliser un composant",
              "À créer des routes",
            ],
            bonneReponse: 1,
            explication: "Les props descendent du composant parent vers le composant enfant, en lecture seule.",
          },
          {
            enonce: "Comment mettre à jour l'état déclaré avec const [age, setAge] = useState(18) ?",
            choix: ["age = 19", "setAge(19)", "useState(19)", "this.age = 19"],
            bonneReponse: 1,
            explication: "On passe toujours par la fonction de mise à jour pour que React redessine le composant.",
          },
          {
            enonce: "Que se passe-t-il quand l'état d'un composant change ?",
            choix: [
              "Rien, il faut recharger la page",
              "React affiche à nouveau le composant avec la nouvelle valeur",
              "Le composant est supprimé",
              "Le navigateur se ferme",
            ],
            bonneReponse: 1,
            explication: "Un changement d'état déclenche un nouveau rendu du composant concerné.",
          },
        ]),
      ],
    },
    {
      id: "c3",
      titre: "Construire une vraie application",
      lecons: [
        texte("l9", "Afficher des listes", 7, [
          p("Pour afficher plusieurs éléments, on transforme un tableau en JSX avec map()."),
          code("jsx", 'const depenses = [\n  { id: 1, libelle: "Transport", montant: 1500 },\n  { id: 2, libelle: "Repas", montant: 2000 },\n];\n\n<ul>\n  {depenses.map((d) => (\n    <li key={d.id}>{d.libelle} : {d.montant} FCFA</li>\n  ))}\n</ul>'),
          astuce("La prop key doit être unique et stable : utilisez un identifiant, pas l'index du tableau."),
        ]),
        video("l10", "useEffect et les données", 11, "bunny", "Charger des données au démarrage d'un composant et éviter les boucles infinies."),
        texte("l11", "Organiser son projet", 6, [
          p("Un projet bien rangé est plus facile à faire évoluer et à partager avec une équipe."),
          liste(
            "components/ : les composants réutilisables (boutons, cartes)",
            "pages/ : un fichier par écran",
            "hooks/ : la logique partagée (useDepenses, useProfil)",
            "Un composant par fichier, nommé avec une majuscule",
          ),
        ]),
        quiz("l12", "Quiz final : les bases de React", [
          {
            enonce: "Quelle méthode utilise-t-on pour afficher une liste en JSX ?",
            choix: ["forEach()", "map()", "filter()", "reduce()"],
            bonneReponse: 1,
            explication: "map() transforme chaque élément du tableau en élément JSX et renvoie le nouveau tableau.",
          },
          {
            enonce: "Pourquoi la prop key est-elle importante dans une liste ?",
            choix: [
              "Elle donne un style à chaque élément",
              "Elle aide React à identifier chaque élément entre deux rendus",
              "Elle trie la liste automatiquement",
              "Elle est obligatoire pour le CSS",
            ],
            bonneReponse: 1,
            explication: "Grâce à key, React sait quel élément a été ajouté, déplacé ou supprimé.",
          },
          {
            enonce: "À quoi sert useEffect ?",
            choix: [
              "À déclarer un état",
              "À exécuter du code après l'affichage, par exemple charger des données",
              "À créer un composant",
              "À écrire du CSS",
            ],
            bonneReponse: 1,
            explication: "useEffect gère les « effets de bord » : requêtes, minuteurs, abonnements…",
          },
          {
            enonce: "Quelle commande lance le serveur de développement d'un projet Vite ?",
            choix: ["npm start-react", "npm run dev", "node react", "vite --build"],
            bonneReponse: 1,
            explication: "npm run dev exécute le script « dev » défini dans package.json.",
          },
          {
            enonce: "Comment nomme-t-on un composant React ?",
            choix: ["en minuscules", "avec une majuscule au début", "avec des tirets", "peu importe"],
            bonneReponse: 1,
            explication: "React distingue les composants (CarteProfil) des balises HTML (div) grâce à la majuscule.",
          },
        ]),
      ],
    },
  ],
};
