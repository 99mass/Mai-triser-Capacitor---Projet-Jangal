import type { Cours } from "../types";
import { astuce, code, liste, p, quiz, t, texte, video } from "../fabrique";

export const coursFlutter: Cours = {
  id: "flutter-debutants",
  titre: "Flutter pour débutants",
  accroche: "Votre première application Android et iOS avec un seul code.",
  description:
    "Avec Flutter, une seule base de code donne une application Android et iOS. Vous apprendrez Dart, les widgets essentiels et la navigation, jusqu'à générer un APK léger qui tourne bien sur les téléphones d'entrée de gamme.",
  categorie: "mobile",
  niveau: "Débutant",
  formateur: { nom: "Moussa Diop", role: "Développeur mobile", ville: "Thiès" },
  image: "/images/cours/flutter.svg",
  prix: 0,
  note: 4.7,
  nbAvis: 120,
  nbApprenants: 2150,
  objectifs: [
    "Écrire du code Dart simple",
    "Composer des écrans avec les widgets",
    "Naviguer entre plusieurs écrans",
    "Générer un APK optimisé",
  ],
  chapitres: [
    {
      id: "c1",
      titre: "Découvrir Flutter",
      lecons: [
        video("l1", "Flutter, c'est quoi ?", 5, "lapin", "Pourquoi Flutter séduit les équipes mobiles et comment il dessine l'interface."),
        texte("l2", "Installer Flutter et Android Studio", 10, [
          p("L'installation prend environ 3 Go. Prévoyez une connexion Wi-Fi et un peu de patience."),
          liste(
            "Téléchargez le SDK Flutter sur flutter.dev",
            "Installez Android Studio et un émulateur (ou branchez votre téléphone)",
            "Lancez `flutter doctor` pour vérifier que tout est prêt",
          ),
          astuce("Votre ordinateur rame avec l'émulateur ? Activez le mode développeur sur votre propre téléphone Android et testez directement dessus."),
        ]),
        video("l3", "Structure d'un projet", 7, "fleur", "Le dossier lib/, le fichier pubspec.yaml et le point d'entrée main.dart."),
        texte("l4", "Dart en 10 minutes", 10, [
          p("Dart est le langage de Flutter. Si vous connaissez JavaScript ou Java, vous serez vite à l'aise."),
          code("dart", "void main() {\n  final prenom = 'Moussa';\n  var age = 24;\n  final langages = ['Dart', 'Kotlin'];\n  print('Je suis $prenom, $age ans');\n}"),
          liste("final : valeur fixée une fois", "var : valeur modifiable", "$variable : insérer une valeur dans une chaîne"),
        ]),
      ],
    },
    {
      id: "c2",
      titre: "Les widgets",
      lecons: [
        video("l5", "Stateless ou Stateful ?", 9, "vendredi", "Choisir le bon type de widget selon que l'écran change ou non."),
        texte("l6", "Mise en page : Row, Column, Container", 8, [
          p("En Flutter, tout est widget, y compris la mise en page. Trois widgets couvrent la plupart des besoins."),
          code("dart", "Column(\n  children: [\n    Text('Bonjour Samba'),\n    Row(children: [Icon(Icons.star), Text('4.7')]),\n    Container(padding: EdgeInsets.all(16), child: Text('Carte')),\n  ],\n)"),
        ]),
        video("l7", "Naviguer entre les écrans", 8, "lapin", "Navigator.push, les routes nommées et le passage de données d'un écran à l'autre."),
        quiz("l8", "Quiz : les widgets Flutter", [
          {
            enonce: "Quel langage utilise Flutter ?",
            choix: ["Kotlin", "Swift", "Dart", "JavaScript"],
            bonneReponse: 2,
            explication: "Flutter est écrit en Dart, un langage créé par Google.",
          },
          {
            enonce: "Quel widget aligne ses enfants verticalement ?",
            choix: ["Row", "Column", "Stack", "Wrap"],
            bonneReponse: 1,
            explication: "Column empile les widgets de haut en bas, Row les aligne de gauche à droite.",
          },
          {
            enonce: "Quand utiliser un StatefulWidget ?",
            choix: [
              "Quand l'affichage ne change jamais",
              "Quand l'écran doit réagir à des changements de données",
              "Uniquement pour les images",
              "Pour les applications iOS seulement",
            ],
            bonneReponse: 1,
            explication: "Un StatefulWidget possède un état qui peut évoluer et déclencher un nouvel affichage.",
          },
          {
            enonce: "Quelle commande vérifie l'installation de Flutter ?",
            choix: ["flutter check", "flutter doctor", "flutter test", "flutter verify"],
            bonneReponse: 1,
            explication: "flutter doctor liste ce qui est installé et ce qui manque.",
          },
          {
            enonce: "Quel fichier liste les dépendances d'un projet Flutter ?",
            choix: ["package.json", "build.gradle", "pubspec.yaml", "main.dart"],
            bonneReponse: 2,
            explication: "pubspec.yaml déclare le nom du projet, ses dépendances et ses ressources.",
          },
        ]),
      ],
    },
    {
      id: "c3",
      titre: "Publier son application",
      lecons: [
        texte("l9", "Penser aux petits téléphones", 6, [
          p("Une grande partie de vos utilisateurs auront 2 Go de RAM et une connexion 3G. Votre application doit rester rapide."),
          liste(
            "Compressez les images (WebP) et chargez-les à la demande",
            "Évitez les animations lourdes au démarrage",
            "Testez sur un vrai téléphone d'entrée de gamme",
          ),
        ]),
        video("l10", "Générer un APK", 7, "fleur", "flutter build apk --split-per-abi pour obtenir des fichiers 3 fois plus légers."),
        texte("l11", "Publier sur le Play Store", 8, [
          t("Les étapes"),
          liste(
            "Créer un compte développeur Google Play (frais uniques de 25 $)",
            "Signer l'application avec une clé de publication",
            "Préparer captures d'écran, description et politique de confidentialité",
            "Envoyer un App Bundle (.aab) en test interne avant la production",
          ),
          astuce("Gardez votre clé de signature en lieu sûr : sans elle, impossible de mettre à jour l'application."),
        ]),
      ],
    },
  ],
};
