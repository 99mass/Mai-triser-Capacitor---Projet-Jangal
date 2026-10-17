// TODO(capacitor): remplacer par @capacitor/core
//   import { Capacitor } from "@capacitor/core";
//   export const estNatif = () => Capacitor.isNativePlatform();
//   export const plateforme = () => Capacitor.getPlatform(); // "android" | "ios" | "web"
//
// Point d'entrée de la couche plateforme. Les composants n'appellent jamais
// `navigator.*` ou `window.*` directement : ils passent par les modules de ce
// dossier, qui ont aujourd'hui une implémentation web et seront remplacés un par
// un par les plugins Capacitor lors de l'empaquetage natif.

export type Plateforme = "web" | "android" | "ios";

export function estNatif(): boolean {
  return false;
}

export function plateforme(): Plateforme {
  return "web";
}

/** Vrai uniquement dans le navigateur (et pas pendant le rendu statique au build). */
export function estNavigateur(): boolean {
  return typeof window !== "undefined";
}
