// TODO(capacitor): compléter avec @capacitor/status-bar
//   import { StatusBar, Style } from "@capacitor/status-bar";
//   appliquerTheme → en plus de la classe CSS :
//     StatusBar.setStyle({ style: sombre ? Style.Dark : Style.Light });
//     StatusBar.setBackgroundColor({ color: sombre ? "#0b1424" : "#faf8f3" }); // Android
// Le thème système reste détecté par `prefers-color-scheme`, que la WebView
// Android (API 29+) et WKWebView respectent.
//
// Application du thème clair/sombre à la page.

import { estNavigateur } from "./index";
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
}

/** Prévient quand l'utilisateur change le thème du téléphone. Retourne la fonction de désabonnement. */
export function ecouterThemeSysteme(rappel: () => void): () => void {
  if (!estNavigateur()) return () => {};
  const requete = window.matchMedia("(prefers-color-scheme: dark)");
  requete.addEventListener("change", rappel);
  return () => requete.removeEventListener("change", rappel);
}
