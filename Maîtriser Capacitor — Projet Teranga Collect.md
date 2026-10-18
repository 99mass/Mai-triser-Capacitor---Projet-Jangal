# Maîtriser Capacitor — Projet Jàngal

Oct 17, 2026 · @mass

## Objectif de la journée

En une journée intensive (10 à 12 h), tu transformes la plateforme web Jàngal en app Android installée sur ton téléphone, qui fonctionne hors ligne et utilise 11 plugins Capacitor plus un plugin natif écrit par toi.

Tu ne réécris aucun écran : tout le travail se fait dans `lib/platform/` et `lib/storage.ts`. C'est exactement ce que fait un développeur Capacitor en entreprise quand il « mobilise » une app web existante.

Une journée ne suffit pas pour devenir expert : l'expertise vient des cas difficiles, listés dans « Après la journée ». **Règle du jour** : Android d'abord, sur un vrai appareil ; iOS seulement si tu as un Mac et qu'il reste du temps.

## Flutter vs Capacitor

Capacitor n'a pas de moteur de rendu : ton app web tourne dans une WebView, et un bridge JS ↔ natif expose les API du téléphone.

| Notion | Flutter | Capacitor |
| --- | --- | --- |
| Rendu | Moteur qui dessine chaque pixel | WebView système (Chrome sur Android, WebKit sur iOS) |
| Accès natif | Platform channels | Plugins : API TypeScript + Kotlin + Swift |
| Dépendances | `pubspec.yaml` | `package.json` + `capacitor.config.ts` |
| Lancer l'app | `flutter run` | `npm run build` → `npx cap sync` → `npx cap run android` |
| Dossiers `android/` et `ios/` | Rarement modifiés | Code source à part entière, commité et modifié dans Android Studio / Xcode |
| Débogage UI | DevTools Flutter | Chrome `chrome://inspect` et Safari Web Inspector |

La ligne la plus importante est l'avant-dernière : un expert Capacitor travaille dans trois mondes à la fois.

## Le point de départ : le dépôt Jàngal

Le dépôt [99mass/Mai-triser-Capacitor---Projet-Jangal](https://github.com/99mass/Mai-triser-Capacitor---Projet-Jangal) est prêt pour Capacitor : vérifié le 17 octobre 2026 sur le commit `3362a29`.

| Vérification | Résultat |
| --- | --- |
| `npm run build` (export statique) | OK : 95 pages HTML dans `out/` |
| `npm run lint` | OK, aucune erreur |
| Appels directs à `navigator`, `window` ou `localStorage` hors de `lib/platform/` et `lib/storage.ts` | Aucun |
| Server Actions, routes API, `cookies()`, `headers()` | Aucun |
| Routes dynamiques | `generateStaticParams` + `trailingSlash: true` |

Trois points d'attention :

- La police Figtree est téléchargée depuis Google Fonts **au moment du build** : il faut Internet pour `npm run build`, pas pour faire tourner l'app.
- Le commentaire de `share.ts` dit que l'origine de la WebView est `http://localhost`. En réalité c'est `https://localhost` sur Android et `capacitor://localhost` sur iOS ; la conclusion reste juste : il faut partager une URL publique.
- Les vidéos d'exemple sont hébergées par MDN : la lecture en ligne et le téléchargement demandent du réseau la première fois.

Voici les fichiers à convertir pendant la journée. Les écrans ne changent pas.

| Fichier | API web aujourd'hui | Plugin Capacitor | Bloc |
| --- | --- | --- | --- |
| `lib/platform/index.ts` | Constantes `false` / `"web"` | `@capacitor/core` | 1 |
| `lib/platform/app-lifecycle.ts` | Rien | `@capacitor/app` | 2 |
| `lib/platform/theme.ts` | `matchMedia`, meta `theme-color` | `@capacitor/status-bar` | 2 |
| `lib/platform/preferences.ts` | `localStorage` | `@capacitor/preferences` | 3 |
| `lib/storage.ts` | `localStorage` | `@capacitor/preferences` | 3 |
| `lib/platform/network.ts` | `navigator.onLine` | `@capacitor/network` | 4 |
| `lib/platform/downloads.ts` | `fetch` + Cache API | `@capacitor/filesystem` | 4 |
| `lib/platform/camera.ts` | `<input type="file">` | `@capacitor/camera` | 5 |
| `lib/platform/haptics.ts` | `navigator.vibrate` | `@capacitor/haptics` | 5 |
| `lib/platform/dialog.ts` | `window.confirm` | `@capacitor/dialog` | 5 |
| `lib/platform/share.ts` | Web Share API | `@capacitor/share` | 6 |
| `lib/platform/files.ts` | `<a download>` | `@capacitor/filesystem` + `@capacitor/share` | 6 |
| `lib/platform/notifications.ts` | Notification API + minuteur | `@capacitor/local-notifications` | 6 |

Méthode pour chaque fichier : garder exactement la même signature exportée, et brancher le natif avec `if (estNatif())` pour que `npm run dev` continue de marcher dans le navigateur.

## À préparer la veille

Installe tout la veille : Android Studio et Xcode peuvent prendre une demi-journée à télécharger sur une connexion lente.

- [ ] Node.js 22 ou plus (`node -v`)
- [ ] Android Studio à jour, avec le SDK Android et le JDK fourni
- [ ] Un téléphone Android en mode développeur, débogage USB activé, reconnu par `adb devices`
- [ ] Le dépôt cloné, puis `npm install` et `npm run build` qui réussissent (connexion Internet nécessaire pour la police)
- [ ] Une branche dédiée : `git checkout -b capacitor`
- [ ] Optionnel : Mac avec Xcode à jour pour la partie iOS
- [ ] Chrome sur l'ordinateur (pour `chrome://inspect`)

## Planning de la journée

La journée compte 9 blocs de 08:00 à 20:00. Chaque bloc se termine par un test sur le téléphone ; ne passe au suivant que s'il marche, et fais un commit à la fin de chaque bloc.

| Horaire | Bloc | Test de fin de bloc |
| --- | --- | --- |
| 08:00–09:00 | 1. Installer Capacitor | Jàngal s'ouvre sur le téléphone, live reload actif |
| 09:00–10:00 | 2. Comportement natif | Bouton retour, barre de statut, icône et splash Jàngal |
| 10:00–11:00 | 3. Préférences et stockage | La progression survit à l'arrêt forcé de l'app |
| 11:00–12:30 | 4. Réseau et téléchargements | Une leçon téléchargée se lit en mode avion |
| 12:30–13:30 | Pause | — |
| 13:30–14:30 | 5. Caméra, vibrations, dialogues | Photo de profil prise avec l'appareil, vibration au quiz |
| 14:30–15:30 | 6. Partage, certificat, rappel | Certificat partagé sur WhatsApp, rappel reçu app fermée |
| 15:30–17:30 | 7. Plugin natif maison | `Appareil.etat()` répond depuis Kotlin (+ Swift si Mac) |
| 17:30–18:30 | 8. Débogage | Erreur provoquée retrouvée dans Chrome et Logcat |
| 18:30–20:00 | 9. Release et bilan | AAB signé, README, commit |

### Bloc 1 — Installer Capacitor (08:00–09:00)

```bash
npm i @capacitor/core @capacitor/android
npm i -D @capacitor/cli
npx cap init "Jàngal" sn.jangal.app --web-dir out
npm run build
npx cap add android
npx cap sync android
npx cap run android
```

Ajoute ces scripts dans `package.json` pour ne plus taper la suite à la main :

```json
"cap:sync": "next build && cap sync",
"cap:android": "next build && cap sync android && cap run android"
```

Live reload par câble USB (aucune IP à configurer) : lance `npm run dev` dans un terminal, puis dans un autre :

```bash
npx cap run android -l --host localhost --port 3000 --forwardPorts 3000:3000
```

Premier fichier converti, `lib/platform/index.ts` :

```ts
import { Capacitor } from "@capacitor/core";

export type Plateforme = "web" | "android" | "ios";

export function estNatif(): boolean {
  return Capacitor.isNativePlatform();
}

export function plateforme(): Plateforme {
  return Capacitor.getPlatform() as Plateforme;
}

export function estNavigateur(): boolean {
  return typeof window !== "undefined";
}
```

À comprendre avant de continuer :

- `npx cap sync` = copie `out/` dans le projet natif **et** installe les plugins natifs ; `npx cap copy` = copie le web seulement
- Le live reload charge `next dev` dans la WebView : ne l'utilise que pour développer, jamais pour un build de release
- Ouvre `npx cap open android` et repère `MainActivity`, `AndroidManifest.xml` et `assets/public` (ton dossier `out/` copié)

### Bloc 2 — Comportement natif (09:00–10:00)

```bash
npm i @capacitor/app @capacitor/status-bar
npm i -D @capacitor/assets
npx cap sync
```

`lib/platform/app-lifecycle.ts` : le bouton retour Android remonte l'historique, puis quitte l'app depuis l'accueil.

```ts
import { App } from "@capacitor/app";
import { estNatif } from "./index";

let initialise = false; // évite le double écouteur du mode strict React

export async function initialiserApp(): Promise<void> {
  if (!estNatif() || initialise) return;
  initialise = true;
  await App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else App.exitApp();
  });
}
```

`lib/platform/theme.ts` : ajoute ceci à la fin de `appliquerTheme()`.

```ts
import { StatusBar, Style } from "@capacitor/status-bar";
import { estNatif } from "./index";

// … dans appliquerTheme(), après la mise à jour des balises meta :
if (estNatif()) {
  // Style.Dark = texte clair, pour un fond sombre
  void StatusBar.setStyle({ style: sombre ? Style.Dark : Style.Light });
}
```

`setBackgroundColor` n'existe plus sur Android 15 et plus : l'app y est affichée bord à bord, et ce sont les marges `env(safe-area-inset-*)` déjà présentes dans Jàngal qui protègent le contenu. Vérifie sur ton téléphone que l'en-tête ne passe pas sous l'heure.

Icône et splash, à partir de l'icône déjà présente dans le dépôt :

```bash
mkdir -p assets && cp public/images/icone-capacitor.png assets/logo.png
npx capacitor-assets generate --android --iconBackgroundColor '#faf8f3' --splashBackgroundColor '#faf8f3' --splashBackgroundColorDark '#0b1424'
```

### Bloc 3 — Préférences et stockage (10:00–11:00)

```bash
npm i @capacitor/preferences
npx cap sync
```

Dans `lib/storage.ts`, remplace chaque `window.localStorage.*` par trois fonctions internes. Les fonctions exportées ne changent pas.

```ts
import { Preferences } from "@capacitor/preferences";
import { estNatif } from "./platform/index";

async function lireBrut(cle: string): Promise<string | null> {
  if (estNatif()) return (await Preferences.get({ key: PREFIXE + cle })).value;
  return window.localStorage.getItem(PREFIXE + cle);
}

async function ecrireBrut(cle: string, valeur: string): Promise<void> {
  if (estNatif()) await Preferences.set({ key: PREFIXE + cle, value: valeur });
  else window.localStorage.setItem(PREFIXE + cle, valeur);
}

async function supprimerBrut(cle: string): Promise<void> {
  if (estNatif()) await Preferences.remove({ key: PREFIXE + cle });
  else window.localStorage.removeItem(PREFIXE + cle);
}
```

Utilise-les dans `lire`, `ecrire`, `tailleDonnees` et `reinitialiserTout`. Fais la même chose dans `lib/platform/preferences.ts`, avec un piège à comprendre : `SCRIPT_THEME_INITIAL` lit le thème **dans localStorage, avant React**. En natif, continue donc d'écrire la clé `theme` aussi dans localStorage, comme cache pour ce script ; sinon l'app s'ouvre avec le mauvais thème.

Pourquoi changer : iOS peut vider le localStorage d'une WebView quand l'espace manque ; Preferences écrit dans le stockage natif de l'app.

### Bloc 4 — Réseau et téléchargements hors ligne (11:00–12:30)

```bash
npm i @capacitor/network @capacitor/filesystem @capacitor/file-transfer
npx cap sync
```

`lib/platform/network.ts` :

```ts
import { Network } from "@capacitor/network";
import { estNatif, estNavigateur } from "./index";

export async function estEnLigne(): Promise<boolean> {
  if (estNatif()) return (await Network.getStatus()).connected;
  if (!estNavigateur()) return true;
  return navigator.onLine;
}

export function ecouterReseau(rappel: (enLigne: boolean) => void): () => void {
  if (estNatif()) {
    const ecouteur = Network.addListener("networkStatusChange", (s) => rappel(s.connected));
    return () => void ecouteur.then((e) => e.remove());
  }
  // … garder ici l'implémentation web actuelle
}
```

`lib/platform/downloads.ts` : ajoute une branche native en haut de chaque fonction exportée. Attention, en Capacitor 8 `Filesystem.downloadFile` est déprécié : le téléchargement passe par `@capacitor/file-transfer`.

```ts
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { FileTransfer } from "@capacitor/file-transfer";
import { estNatif, estNavigateur } from "./index";

const DOSSIER = "videos";
// Les id ressemblent à « bases-react/l1 » : on remplace le « / » pour rester dans un seul dossier.
const chemin = (id: string) => `${DOSSIER}/${id.replaceAll("/", "__")}.mp4`;
const idDepuisNom = (nom: string) => nom.replace(/\.mp4$/, "").replaceAll("__", "/");
const emplacement = (id: string) => ({ path: chemin(id), directory: Directory.Data });

export function telechargementsDisponibles(): boolean {
  return estNatif() || (estNavigateur() && "caches" in window);
}

async function telechargerNatif(id: string, url: string, surProgression?: (p: number) => void) {
  await Filesystem.mkdir({ path: DOSSIER, directory: Directory.Data, recursive: true }).catch(() => {});
  const { uri } = await Filesystem.getUri(emplacement(id));
  const ecouteur = await FileTransfer.addListener("progress", (p) => {
    if (p.url === url && p.lengthComputable) surProgression?.(p.bytes / p.contentLength);
  });
  try {
    await FileTransfer.downloadFile({ url, path: uri, progress: true });
  } finally {
    await ecouteur.remove();
  }
  surProgression?.(1);
  return (await Filesystem.stat(emplacement(id))).size;
}

// En haut de chaque fonction exportée :
// telechargerFichier → if (estNatif()) return telechargerNatif(id, url, surProgression);
// estTelecharge      → if (estNatif()) return Filesystem.stat(emplacement(id)).then(() => true, () => false);
// lireFichier        → if (estNatif()) {
//                        try { await Filesystem.stat(emplacement(id)); }
//                        catch { return null; }
//                        return Capacitor.convertFileSrc((await Filesystem.getUri(emplacement(id))).uri);
//                      }
// supprimerFichier   → if (estNatif()) return void (await Filesystem.deleteFile(emplacement(id)).catch(() => {}));
// listerFichiers     → if (estNatif()) {
//                        const { files } = await Filesystem.readdir({ path: DOSSIER, directory: Directory.Data })
//                          .catch(() => ({ files: [] }));
//                        return files.map((f) => ({ id: idDepuisNom(f.name), taille: f.size }));
//                      }
// toutSupprimer      → if (estNatif()) return void (await Filesystem.rmdir({ path: DOSSIER, directory: Directory.Data, recursive: true }).catch(() => {}));
```

- `Capacitor.convertFileSrc` transforme un chemin `file://` en URL que la WebView peut lire dans `<video>`
- Le téléchargement natif ne passe pas par la WebView : plus de contrainte CORS sur les URL des vidéos
- `AbortSignal` n'est pas transmis au natif : l'annulation d'un téléchargement en cours devient un exercice pour « Après la journée »
- Test : télécharge un cours, active le mode avion, tue l'app, relance-la et lis une leçon vidéo

### Bloc 5 — Caméra, vibrations, dialogues (13:30–14:30)

```bash
npm i @capacitor/camera @capacitor/action-sheet @capacitor/haptics @capacitor/dialog
npx cap sync
```

`lib/platform/camera.ts` : en Capacitor 8, `Camera.getPhoto` est déprécié. On utilise `takePhoto` et `chooseFromGallery`, et une feuille d'actions native pour laisser choisir.

```ts
import { ActionSheet, ActionSheetButtonStyle } from "@capacitor/action-sheet";
import { Camera, CameraDirection, MediaTypeSelection } from "@capacitor/camera";
import { estNatif, estNavigateur } from "./index";

async function choisirPhotoNative(): Promise<string | null> {
  const { index } = await ActionSheet.showActions({
    title: "Photo de profil",
    options: [
      { title: "Prendre une photo" },
      { title: "Choisir dans la galerie" },
      { title: "Annuler", style: ActionSheetButtonStyle.Cancel },
    ],
  });
  try {
    const options = { quality: 85, targetWidth: 512, targetHeight: 512, correctOrientation: true };
    const webPath =
      index === 0
        ? (await Camera.takePhoto({ ...options, cameraDirection: CameraDirection.Front })).webPath
        : index === 1
          ? (await Camera.chooseFromGallery({ ...options, mediaType: MediaTypeSelection.Photo })).results[0]?.webPath
          : undefined;
    if (!webPath) return null;
    const blob = await (await fetch(webPath)).blob();
    return reduireImage(new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" }));
  } catch {
    return null; // annulation ou permission refusée
  }
}

export async function choisirPhoto(): Promise<string | null> {
  if (estNatif()) return choisirPhotoNative();
  // … implémentation web actuelle
}
```

`lib/platform/haptics.ts` :

```ts
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export async function vibrerSucces() {
  if (estNatif()) return Haptics.notification({ type: NotificationType.Success });
  vibrer(35);
}
export async function vibrerErreur() {
  if (estNatif()) return Haptics.notification({ type: NotificationType.Error });
  vibrer([70, 50, 70]);
}
export async function vibrerLeger() {
  if (estNatif()) return Haptics.impact({ style: ImpactStyle.Light });
  vibrer(12);
}
```

`lib/platform/dialog.ts` :

```ts
import { Dialog } from "@capacitor/dialog";

export async function confirmer({ titre, message, boutonOk, boutonAnnuler }: OptionsConfirmation) {
  if (estNatif()) {
    const { value } = await Dialog.confirm({
      title: titre,
      message,
      okButtonTitle: boutonOk ?? "Confirmer",
      cancelButtonTitle: boutonAnnuler ?? "Annuler",
    });
    return value;
  }
  // … implémentation web actuelle
}
```

Sur Android, la caméra ne demande aucune permission tant que `saveToGallery` reste à `false`. Exercice : refuse l'accès à la galerie, puis vérifie que l'app ne plante pas.

### Bloc 6 — Partage, certificat, rappel quotidien (14:30–15:30)

```bash
npm i @capacitor/share @capacitor/local-notifications
npx cap sync
```

Un utilitaire à ajouter dans `lib/platform/files.ts`, réutilisé par le partage :

```ts
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export function blobEnBase64(blob: Blob): Promise<string> {
  return new Promise((ok, ko) => {
    const lecteur = new FileReader();
    lecteur.onload = () => ok(String(lecteur.result).split(",")[1]);
    lecteur.onerror = () => ko(lecteur.error);
    lecteur.readAsDataURL(blob);
  });
}

export async function exporterImage(donnees: Blob, nomFichier: string): Promise<boolean> {
  if (estNatif()) {
    // Dans la WebView, <a download> ne fait rien : on écrit le fichier puis on ouvre le partage.
    const { uri } = await Filesystem.writeFile({
      path: nomFichier,
      data: await blobEnBase64(donnees),
      directory: Directory.Cache,
    });
    await Share.share({ title: nomFichier, files: [uri] });
    return true;
  }
  // … implémentation web actuelle
}
```

`lib/platform/share.ts` : en natif, `window.location.origin` vaut `https://localhost`, une adresse inutile pour le destinataire. Définis `const URL_PUBLIQUE = "https://jangal.sn"` (à remplacer par ton futur domaine) et construis l'URL partagée avec. Pour un fichier, écris-le dans `Directory.Cache` comme ci-dessus et passe son `uri` dans `files`.

`lib/platform/notifications.ts` :

```ts
import { LocalNotifications } from "@capacitor/local-notifications";

const ID_RAPPEL = 1;

// etatPermission / demanderPermission en natif :
//   const { display } = await LocalNotifications.checkPermissions();   // ou requestPermissions()
//   display : "granted" | "denied" | "prompt" | "prompt-with-rationale"

export async function programmerRappelQuotidien(heure: string): Promise<boolean> {
  await annulerRappel();
  if ((await etatPermission()) !== "accordee") return false;
  if (estNatif()) {
    const [h, m] = heure.split(":").map(Number);
    await LocalNotifications.schedule({
      notifications: [{
        id: ID_RAPPEL,
        title: TITRE,
        body: MESSAGE,
        schedule: { on: { hour: h, minute: m }, allowWhileIdle: true },
      }],
    });
    return true;
  }
  // … implémentation web actuelle (minuteur)
}

export async function annulerRappel(): Promise<void> {
  if (estNatif()) return LocalNotifications.cancel({ notifications: [{ id: ID_RAPPEL }] });
  // … implémentation web actuelle
}
```

Depuis Android 12, un rappel n'est exact que si `SCHEDULE_EXACT_ALARM` est déclaré dans `AndroidManifest.xml` ; sans elle, il peut arriver avec quelques minutes de retard. Test : programme le rappel à dans 2 minutes, ferme l'app, attends la notification.

### Bloc 7 — Ton plugin natif : Appareil (15:30–17:30)

C'est le bloc le plus formateur : tu traverses tout le bridge, du TypeScript jusqu'au Kotlin et au Swift. Le besoin est réel : **refuser un téléchargement quand le téléphone n'a plus assez d'espace**, ce qu'aucun plugin officiel ne fait.

```bash
cd ..
npx @capacitor/create-plugin jangal-appareil --name jangal-appareil --package-id sn.jangal.appareil --class-name Appareil --android-lang kotlin
cd jangal-appareil
```

`src/definitions.ts` :

```ts
export interface EtatAppareil {
  /** 0-100, ou -1 si inconnu */
  batterie: number;
  espaceLibreMo: number;
}

export interface AppareilPlugin {
  etat(): Promise<EtatAppareil>;
}
```

`android/src/main/kotlin/sn/jangal/appareil/AppareilPlugin.kt` :

```kotlin
package sn.jangal.appareil

import android.content.Context
import android.os.BatteryManager
import android.os.Environment
import android.os.StatFs
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "Appareil")
class AppareilPlugin : Plugin() {
    @PluginMethod
    fun etat(call: PluginCall) {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val stat = StatFs(Environment.getDataDirectory().path)
        val ret = JSObject().apply {
            put("batterie", bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY))
            put("espaceLibreMo", stat.availableBytes / (1024 * 1024))
        }
        call.resolve(ret)
    }
}
```

`ios/Sources/AppareilPlugin/AppareilPlugin.swift` (si tu as un Mac) :

```swift
import Foundation
import Capacitor
import UIKit

@objc(AppareilPlugin)
public class AppareilPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppareilPlugin"
    public let jsName = "Appareil"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "etat", returnType: CAPPluginReturnPromise)
    ]

    @objc func etat(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            UIDevice.current.isBatteryMonitoringEnabled = true
            let batterie = Int(UIDevice.current.batteryLevel * 100) // -1 sur simulateur
            let attrs = try? FileManager.default.attributesOfFileSystem(forPath: NSHomeDirectory())
            let libre = (attrs?[.systemFreeSize] as? NSNumber)?.int64Value ?? 0
            call.resolve(["batterie": batterie, "espaceLibreMo": libre / (1024 * 1024)])
        }
    }
}
```

`src/web.ts` (le repli quand l'app tourne dans le navigateur) :

```ts
import { WebPlugin } from "@capacitor/core";
import type { AppareilPlugin, EtatAppareil } from "./definitions";

export class AppareilWeb extends WebPlugin implements AppareilPlugin {
  async etat(): Promise<EtatAppareil> {
    const { quota = 0, usage = 0 } = (await navigator.storage?.estimate?.()) ?? {};
    return { batterie: -1, espaceLibreMo: Math.round((quota - usage) / 1_048_576) };
  }
}
```

Installe-le dans Jàngal sous forme d'archive : Turbopack refuse les paquets liés par symlink hors du projet.

```bash
npm run build && npm pack
cd ../Mai-triser-Capacitor---Projet-Jangal
npm i ../jangal-appareil/jangal-appareil-0.0.1.tgz
npx cap sync
```

Puis crée `lib/platform/appareil.ts` (un nouveau fichier de la couche plateforme) et utilise-le au début de `telechargerCours()` dans `lib/telechargements.ts` :

```ts
// lib/platform/appareil.ts
import { Appareil } from "jangal-appareil";
export const etatAppareil = () => Appareil.etat();

// lib/telechargements.ts, au début de telechargerCours()
const { espaceLibreMo } = await etatAppareil();
const besoin = tailleEstimeeMo(cours) + 200; // marge pour le système
if (espaceLibreMo < besoin) {
  throw new Error(`Espace insuffisant : libérez au moins ${Math.ceil(besoin - espaceLibreMo)} Mo pour télécharger ce cours.`);
}
```

À chaque modification du plugin : `npm run build && npm pack` dans le plugin, puis réinstalle l'archive. Bonus : affiche aussi l'espace libre dans l'écran Profil.

### Bloc 8 — Débogage (17:30–18:30)

- Ouvre `chrome://inspect` sur l'ordinateur et inspecte la WebView de Jàngal : console, réseau, Application › Local Storage
- Ouvre Logcat dans Android Studio, filtre sur `Capacitor` pour voir passer chaque appel du bridge
- Provoque une erreur dans `AppareilPlugin.kt` (renvoie `call.reject("test")`) et retrouve-la dans les deux outils
- Fais le parcours complet en mode avion : onboarding, leçon téléchargée, quiz, note, certificat

### Bloc 9 — Release et bilan (18:30–20:00)

- Coupe le live reload : `npm run cap:sync` (sans `-l`) pour que l'app embarque `out/` et non `next dev`
- Android : `npx cap open android`, puis Build › Generate Signed Bundle, comme pour une app Flutter
- iOS (si Mac) : `npm i @capacitor/ios && npx cap add ios && npx cap run ios`, avec `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` et `NSPhotoLibraryAddUsageDescription` dans `Info.plist`
- Mets à jour le README : quels fichiers de `lib/platform/` sont convertis, comment lancer l'app
- Commit tout, y compris les dossiers `android/` et `ios/`

## Checklist de fin de journée

Si tu coches les 10 cases, la journée est réussie.

- [ ] Jàngal tourne sur un vrai téléphone Android, sans live reload
- [ ] Je sais expliquer la différence entre `cap sync` et `cap copy`
- [ ] Le bouton retour Android et la barre de statut se comportent comme dans une app native
- [ ] La progression et les notes survivent à un arrêt forcé de l'app
- [ ] Une leçon téléchargée se lit en mode avion
- [ ] La photo de profil vient de la caméra ou de la galerie, et l'annulation ne casse rien
- [ ] Le certificat se partage sur WhatsApp et le rappel arrive app fermée
- [ ] Mon plugin `Appareil` bloque un téléchargement quand l'espace manque
- [ ] J'ai inspecté la WebView avec `chrome://inspect` et lu Logcat
- [ ] J'ai un AAB signé et un commit propre sur la branche `capacitor`

## Après la journée : devenir expert

La journée pose les bases ; l'expertise vient de 8 chantiers à mener sur Jàngal, environ un par semaine.

| Semaine | Chantier | Exercice concret sur Jàngal |
| --- | --- | --- |
| 1 | Stockage robuste | Remplacer Preferences par SQLite (`@capacitor-community/sqlite`) dans `lib/storage.ts`, avec migration des données existantes |
| 2 | Téléchargements avancés | Annulation, reprise après coupure réseau, téléchargement en Wi-Fi uniquement |
| 3 | Deep links | App Links (Android) et Universal Links (iOS) : `https://jangal.sn/cours/bases-react/` ouvre le cours dans l'app |
| 4 | Vrai paiement | Remplacer le paiement simulé : redirection Wave ou Orange Money, retour dans l'app par deep link, vérification côté serveur |
| 5 | Notifications push | FCM/APNs avec `@capacitor/push-notifications` : « Nouveau cours disponible » |
| 6 | Performance | Démarrage à froid, taille du bundle Next.js, fluidité sur un Android d'entrée de gamme |
| 7 | Tests et CI/CD | Tests E2E Maestro, GitHub Actions + Fastlane pour des builds signés automatiques |
| 8 | Migration Capacitor 9 | Passer Jàngal en Capacitor 9 dès sa sortie, et suivre les changements iOS |

Tu seras expert quand tu sauras dire en 30 secondes si un bug vient du web, du bridge ou du natif.

## Actualité Capacitor à connaître

Quatre changements récents touchent directement ce projet.

- **Capacitor 8.5** (juillet 2026) prépare l'adoption de UIScene, exigée par iOS 27 pour les apps compilées avec le dernier SDK.
- **CocoaPods** : le trunk passe en lecture seule le 2 décembre 2026. Utilise Swift Package Manager dès le départ côté iOS.
- **Plugins dépréciés en v8** : `Camera.getPhoto` est remplacé par `takePhoto` / `chooseFromGallery`, et `Filesystem.downloadFile` par le plugin `@capacitor/file-transfer`. Le code de ce document utilise déjà les nouvelles API.
- **Capacitor 9** est annoncé pour fin novembre 2026 : couche Cordova optionnelle, code iOS restant converti en Swift, support des écrans pliables. Migrer Jàngal vers la v9 sera un bon exercice final.

## Sources

- [The Road to Capacitor 9 (résumé du blog Ionic)](https://www.plushcap.com/content/ionic/blog/ionic-the-road-to-capacitor-9)
- [Blog Ionic, juillet 2026 : Capacitor 8.5](https://www.plushcap.com/companies/ionic/blog/summaries/2026/07)
- [Documentation officielle Capacitor](https://capacitorjs.com/docs)
