// Branché sur @capacitor/core.
//
// Point d'entrée de la couche plateforme. Les composants n'appellent jamais
// `navigator.*` ou `window.*` directement : ils passent par les modules de ce
// dossier. Chaque module teste `estNatif()` : vrai dans l'app Android/iOS
// (on utilise alors un plugin Capacitor), faux dans le navigateur (on garde
// l'implémentation web, pour que `npm run dev` continue de fonctionner).

import { Capacitor } from "@capacitor/core";

export type Plateforme = "web" | "android" | "ios";

/** Vrai dans l'app installée (Android ou iOS), faux dans un navigateur. */
export function estNatif(): boolean {
  return Capacitor.isNativePlatform();
}

export function plateforme(): Plateforme {
  return Capacitor.getPlatform() as Plateforme;
}

/** Vrai uniquement dans le navigateur ou la WebView (et pas pendant le rendu statique au build). */
export function estNavigateur(): boolean {
  return typeof window !== "undefined";
}
