import type { Cours } from "../types";
import { astuce, code, liste, p, quiz, t, texte, video } from "../fabrique";

export const coursPythonData: Cours = {
  id: "analyse-donnees-python",
  titre: "Analyse de données avec Python",
  accroche: "Transformez des tableaux bruts en décisions claires.",
  description:
    "Ventes d'une boutique, prix des produits sur le marché, résultats scolaires : apprenez à nettoyer, analyser et visualiser des données réelles avec Python, Pandas et Matplotlib. Tous les exercices utilisent des jeux de données ouest-africains.",
  categorie: "data",
  niveau: "Intermédiaire",
  formateur: { nom: "Fatou Sow", role: "Data scientist", ville: "Saint-Louis" },
  image: "/images/cours/python-data.svg",
  prix: 12500,
  note: 4.9,
  nbAvis: 86,
  nbApprenants: 940,
  objectifs: [
    "Manipuler des tableaux de données avec Pandas",
    "Nettoyer des données incomplètes",
    "Calculer des indicateurs utiles",
    "Créer des graphiques lisibles",
  ],
  chapitres: [
    {
      id: "c1",
      titre: "Python pour la data",
      lecons: [
        video("l1", "Le métier de data analyst", 6, "vendredi", "Ce que fait un data analyst au quotidien et les outils qu'il utilise."),
        texte("l2", "Rappels de Python", 9, [
          p("Avant Pandas, assurez-vous de maîtriser listes, dictionnaires et boucles."),
          code("python", "ventes = [12000, 8500, 15000]\ntotal = sum(ventes)\nproduit = {\"nom\": \"Bissap\", \"prix\": 500}\nfor v in ventes:\n    print(v)"),
        ]),
        texte("l3", "Installer Jupyter", 5, [
          p("Jupyter Notebook permet d'écrire du code et de voir le résultat immédiatement, cellule par cellule."),
          code("bash", "pip install jupyter pandas matplotlib\njupyter notebook"),
          astuce("Pas d'ordinateur puissant ? Google Colab fonctionne dans le navigateur, gratuitement."),
        ]),
        video("l4", "Votre premier notebook", 8, "fleur", "Charger un fichier CSV et afficher ses premières lignes."),
      ],
    },
    {
      id: "c2",
      titre: "Manipuler les données avec Pandas",
      lecons: [
        video("l5", "Le DataFrame", 10, "bunny", "La structure centrale de Pandas : lignes, colonnes, index."),
        texte("l6", "Filtrer et trier", 8, [
          code("python", "import pandas as pd\n\ndf = pd.read_csv(\"ventes_dakar.csv\")\nmarche = df[df[\"quartier\"] == \"Sandaga\"]\nmarche.sort_values(\"montant\", ascending=False).head()"),
          p("Le filtre df[condition] garde uniquement les lignes qui respectent la condition."),
        ]),
        texte("l7", "Nettoyer les données", 9, [
          t("Les problèmes fréquents"),
          liste("Valeurs manquantes (NaN)", "Doublons", "Montants saisis en texte : « 1 500 FCFA »"),
          code("python", "df = df.drop_duplicates()\ndf[\"montant\"] = df[\"montant\"].str.replace(r\"\\D\", \"\", regex=True).astype(int)\ndf = df.dropna(subset=[\"quartier\"])"),
        ]),
        video("l8", "Regrouper avec groupby", 9, "lapin", "Calculer le chiffre d'affaires par quartier et par mois."),
        quiz("l9", "Quiz : Pandas", [
          {
            enonce: "Quelle fonction lit un fichier CSV avec Pandas ?",
            choix: ["pd.open_csv()", "pd.read_csv()", "pd.load()", "pd.csv()"],
            bonneReponse: 1,
            explication: "pd.read_csv() renvoie un DataFrame à partir d'un fichier CSV.",
          },
          {
            enonce: "Que fait df.head() ?",
            choix: ["Supprime la première ligne", "Affiche les premières lignes", "Renomme les colonnes", "Trie le tableau"],
            bonneReponse: 1,
            explication: "head() affiche les 5 premières lignes par défaut, idéal pour un premier aperçu.",
          },
          {
            enonce: "Comment supprimer les lignes en double ?",
            choix: ["df.unique()", "df.drop_duplicates()", "df.clean()", "df.remove()"],
            bonneReponse: 1,
            explication: "drop_duplicates() renvoie un DataFrame sans lignes identiques.",
          },
          {
            enonce: "Que représente NaN dans un DataFrame ?",
            choix: ["Un nombre négatif", "Une valeur manquante", "Une erreur de syntaxe", "Un texte vide"],
            bonneReponse: 1,
            explication: "NaN (Not a Number) signale une donnée absente.",
          },
          {
            enonce: "Quelle méthode permet de calculer un total par quartier ?",
            choix: ["df.groupby(\"quartier\").sum()", "df.sort(\"quartier\")", "df.filter(\"quartier\")", "df.count()"],
            bonneReponse: 0,
            explication: "groupby regroupe les lignes par valeur, puis sum() additionne chaque groupe.",
          },
        ]),
      ],
    },
    {
      id: "c3",
      titre: "Visualiser et raconter",
      lecons: [
        video("l10", "Graphiques avec Matplotlib", 9, "vendredi", "Barres, courbes et camemberts : choisir le bon graphique."),
        texte("l11", "Choisir le bon graphique", 6, [
          liste(
            "Comparer des catégories : diagramme en barres",
            "Montrer une évolution dans le temps : courbe",
            "Montrer une répartition : barres empilées plutôt qu'un camembert",
          ),
          astuce("Un bon graphique répond à une seule question. Écrivez cette question comme titre."),
        ]),
        texte("l12", "Présenter ses résultats", 7, [
          p("Une analyse n'a de valeur que si elle est comprise. Terminez toujours par trois éléments : le constat, la cause probable et la recommandation."),
        ]),
      ],
    },
  ],
};
