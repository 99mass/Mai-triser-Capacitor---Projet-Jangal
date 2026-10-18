// Branché sur SystemBars, intégré à @capacitor/core depuis Capacitor 8
// (le plugin séparé @capacitor/status-bar n'est plus nécessaire).
//
// En natif, la barre de statut est transparente : l'app est dessinée « bord à
// bord » sous l'heure et la batterie (obligatoire depuis Android 15). On ne
// choisit donc plus sa couleur de fond, seulement la couleur de ses icônes, et
// les en-têtes se décalent grâce à env(safe-area-inset-top).
// Le thème système reste détecté par `prefers-color-scheme`, que la WebView
// Android (API 29+) et WKWebView respectent.
//
// Application du thème clair/sombre à la page.

import { SystemBars, SystemBarsStyle } from "@capacitor/core";
import { estNatif, estNavigateur } from "./index";
import type { Theme } from "./preferences";

const COULEUR_BARRE = { clair: "#faf8f3", sombre: "#0b1424" };

function systemeEstSombre(): boolean {
  return estNavigateur() && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function themeEffectifEstSombre(theme: Theme): boolean {
  return theme === "sombre" || (theme === "systeme" && systemeEstSombre());
}

export function appliquerTheme(theme: Theme): void {
  if (!estNavigateur()) return;
  const sombre = themeEffectifEstSombre(theme);
  const racine = document.documentElement;
  racine.classList.toggle("dark", sombre);
  racine.style.colorScheme = sombre ? "dark" : "light";
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", sombre ? COULEUR_BARRE.sombre : COULEUR_BARRE.clair));

  if (estNatif()) {
    // Style.Dark = icônes claires, pour un fond sombre (et inversement).
    void SystemBars.setStyle({ style: sombre ? SystemBarsStyle.Dark : SystemBarsStyle.Light });
  }
}

/** Prévient quand l'utilisateur change le thème du téléphone. Retourne la fonction de désabonnement. */
export function ecouterThemeSysteme(rappel: () => void): () => void {
  if (!estNavigateur()) return () => {};
  const requete = window.matchMedia("(prefers-color-scheme: dark)");
  requete.addEventListener("change", rappel);
  return () => requete.removeEventListener("change", rappel);
}
