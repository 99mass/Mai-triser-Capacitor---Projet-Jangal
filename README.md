# Jàngal

> *Apprendre aujourd'hui, construire demain.*

Jàngal (« apprendre » en wolof) est une plateforme d'e-learning mobile-first pour les étudiants et les jeunes professionnels d'Afrique de l'Ouest. Elle est pensée pour les smartphones Android d'entrée de gamme et pour des connexions lentes ou intermittentes.

- **Stack** : Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), lucide-react.
- **100 % statique** : `npm run build` produit `out/`, prêt à être empaqueté par Capacitor. Pas de serveur, de route API, de Server Action ni de middleware.
- **Entièrement en français**, en mode clair et en mode sombre.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # génère le dossier out/ (96 pages HTML statiques)
npm run lint
```

Pour tester l'export comme sur un téléphone : `npx serve out`, puis ouvrez l'adresse affichée avec les outils de développement en mode mobile.

## Écrans

| Route | Écran |
| --- | --- |
| `/` | Redirection : onboarding au premier lancement, accueil ensuite |
| `/onboarding/` | Présentation, centres d'intérêt, prénom, bienvenue |
| `/accueil/` | Carte « Reprendre », série de jours, objectif hebdomadaire, recommandations |
| `/catalogue/` | Recherche (sans tenir compte des accents), filtres par catégorie, niveau et prix |
| `/mes-cours/` | Onglets En cours, Terminés et Téléchargés (espace utilisé, suppression) |
| `/profil/` | Photo, prénom, centres d'intérêt, rappel quotidien, objectif, thème, stockage, réinitialisation |
| `/cours/[coursId]/` | Détail d'un cours : programme, progression, achat, téléchargement, partage |
| `/cours/[coursId]/lecon/[leconId]/` | Lecteur de leçon (vidéo, texte, quiz), notes, navigation |
| `/cours/[coursId]/paiement/` | Paiement **simulé** Wave / Orange Money (+221) |
| `/cours/[coursId]/certificat/` | Certificat de réussite, export en PNG et partage |

Les routes dynamiques utilisent `generateStaticParams` (calculé à partir de `/data`) et `dynamicParams = false`.

## Architecture

```
app/                 Routes (pages client ; les pages dynamiques ont un fichier serveur qui ne fait que générer les paramètres)
components/          Composants partagés, components/ui (shadcn) et components/ecrans (gros écrans client)
data/                Les 6 cours, les catégories et les vidéos d'exemple (fichiers TypeScript locaux)
lib/storage.ts       SEUL module de persistance (profil, progression, notes, quiz, achats, téléchargements, activité)
lib/platform/        Couche plateforme : une fonction du téléphone par fichier
lib/progression.ts   Calculs : pourcentage, série, objectif hebdomadaire, leçon à reprendre
lib/telechargements.ts  Coordonne platform/downloads (fichiers) et storage (métadonnées)
lib/certificat.ts    Dessin du certificat sur un canvas
public/images/       Logo détouré (clair et sombre), illustrations WebP, couvertures de cours en SVG
```

**Règles :**

1. Aucun composant n'appelle `navigator.*`, `window.*` ou `localStorage` directement. Les appels passent par `lib/platform/*` ou par `lib/storage.ts`. Pour le vérifier : `grep -rnE "navigator\.|window\.|localStorage" app components lib data | grep -vE "^lib/platform/|^lib/storage\.ts"` ne doit rien renvoyer.
2. `lib/storage.ts` expose une API **asynchrone**. Son implémentation localStorage peut être remplacée (Preferences, SQLite, API distante) sans modifier les écrans.
3. La police Figtree est chargée par `next/font` : elle est téléchargée au build et servie depuis `/_next/static/media`. Il n'y a aucun lien vers un CDN.

## Couche plateforme : `lib/platform/`

Chaque fichier contient une implémentation web qui fonctionne déjà. Il commence par un commentaire `// TODO(capacitor): remplacer par <plugin>` qui contient le code de remplacement.

| Fichier | Rôle | API web utilisée aujourd'hui | Plugin Capacitor de remplacement |
| --- | --- | --- | --- |
| `index.ts` | `estNatif()` → `false`, `plateforme()` → `"web"` | aucune (constantes) | `@capacitor/core` (`Capacitor.isNativePlatform()`, `getPlatform()`) |
| `preferences.ts` | Thème et heure du rappel (+ script anti-flash du thème) | `localStorage` | `@capacitor/preferences` |
| `theme.ts` | Appliquer le thème clair, sombre ou système | `matchMedia('(prefers-color-scheme: dark)')`, `<meta name="theme-color">` | `@capacitor/status-bar` (`setStyle`, `setBackgroundColor`) |
| `network.ts` | Statut en ligne / hors ligne + écouteur | `navigator.onLine`, événements `online` / `offline` | `@capacitor/network` |
| `share.ts` | Partager un cours ou un certificat | Web Share API (`navigator.share`, `canShare({ files })`), sinon `navigator.clipboard` | `@capacitor/share` |
| `camera.ts` | Choisir une photo de profil (recadrée à 256 px) | `<input type="file" accept="image/*">` + `createImageBitmap` + canvas | `@capacitor/camera` |
| `haptics.ts` | Vibration sur bonne ou mauvaise réponse | `navigator.vibrate` | `@capacitor/haptics` |
| `downloads.ts` | Télécharger, lister, lire et supprimer les vidéos ; calculer l'espace utilisé | `fetch` en flux (progression) + Cache API (`caches.open`) + `URL.createObjectURL` | `@capacitor/filesystem` (`downloadFile`, `readdir`, `deleteFile`) + `Capacitor.convertFileSrc` |
| `notifications.ts` | Rappel quotidien d'apprentissage | Notification API (`Notification.requestPermission`) + minuteur | `@capacitor/local-notifications` (`schedule.on: { hour, minute }`) |
| `files.ts` | Exporter le certificat en PNG | `<a download>` + `URL.createObjectURL` | `@capacitor/filesystem` (`writeFile`) + `@capacitor/share` |
| `dialog.ts` | Confirmer avant une suppression | `window.confirm` | `@capacitor/dialog` |
| `app-lifecycle.ts` | `initialiserApp()` (vide côté web) | aucune | `@capacitor/app` (bouton retour Android, `appStateChange`) + `@capacitor/status-bar` |

### Limites du web que les plugins natifs lèvent

- **Rappel quotidien** : sur le web, la notification ne part que si l'application est ouverte, car c'est un minuteur. `LocalNotifications` la programme auprès du système.
- **Hors-ligne** : le Cache API peut être vidé par le navigateur en cas de manque d'espace. Le Filesystem natif ne l'est pas. Dans un navigateur classique, il faudrait aussi un service worker pour ouvrir les pages sans réseau. Avec Capacitor, les pages sont déjà embarquées dans l'APK.
- **Export de fichier** : `<a download>` n'a aucun effet dans une WebView. Il faut écrire le fichier avec Filesystem puis ouvrir la feuille de partage.
- **Partage d'URL** : dans l'application native, l'origine est `http://localhost`. `share.ts` devra pointer vers une URL publique ou un lien profond.
- **Vibration** : `navigator.vibrate` n'existe pas sur iOS.

## Empaqueter avec Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Jàngal" sn.jangal.app --web-dir out
npm install @capacitor/android && npx cap add android
npm install @capacitor/preferences @capacitor/network @capacitor/share @capacitor/camera \
  @capacitor/haptics @capacitor/filesystem @capacitor/local-notifications @capacitor/dialog \
  @capacitor/app @capacitor/status-bar
npm run build && npx cap sync android
npx cap open android
```

Remplacez ensuite chaque module de `lib/platform/` à l'aide de son commentaire `TODO(capacitor)`. Les écrans n'ont pas à changer. L'icône d'application 1024 px est dans `public/images/icone-capacitor.png` (à passer à `@capacitor/assets`).

## Données d'exemple

Six cours sont dans `data/cours/`. Chacun a 3 chapitres de 3 à 5 leçons et au moins un quiz de 5 questions.

| Cours | Catégorie | Formateur·rice | Prix |
| --- | --- | --- | --- |
| Les bases de React | Développement web | Awa Ndiaye (Dakar) | Gratuit |
| Flutter pour débutants | Mobile | Moussa Diop (Thiès) | Gratuit |
| Analyse de données avec Python | Data & IA | Fatou Sow (Saint-Louis) | 12 500 FCFA |
| Design UI/UX : les fondamentaux | Design | Aïssatou Ba (Abidjan) | Gratuit |
| Lancer son activité en Afrique de l'Ouest | Business | Ibrahima Fall (Dakar) | 7 500 FCFA |
| Anglais professionnel | Langues | Mariama Traoré (Bamako) | Gratuit |

Dans un cours payant, la première leçon reste en aperçu gratuit. Les vidéos (`data/videos.ts`) sont des MP4 publics légers, de 0,5 à 4,7 Mo, servis avec l'en-tête CORS `Access-Control-Allow-Origin: *`, ce qui permet de les stocker hors ligne.

**Paiement** : l'écran de paiement est une **simulation**. Il est marqué « Paiement simulé – démo », n'envoie aucune requête, attend 2 secondes puis enregistre un achat fictif en local.

## Design

L'identité visuelle reprend la maquette fournie : bleu marine `#0F305B`, orange `#F67B0D`, fond crème, police Figtree, cartes blanches arrondies et icônes de catégories colorées. Le logo est détouré depuis `logo.png`, avec une version claire du logotype pour le mode sombre.

- Mise en page mobile-first, contenu limité à 640 px sur ordinateur.
- `viewport-fit=cover` et `env(safe-area-inset-*)` sur les en-têtes, la barre d'onglets et les écrans plein cadre.
- Zones tactiles d'au moins 44 px (les tailles du bouton shadcn ont été ajustées). Aucune interaction ne dépend du survol.
- Contrastes AA : le texte orange utilise `--orange-texte` (`#B85000`), et l'orange vif est réservé aux surfaces et aux icônes.
