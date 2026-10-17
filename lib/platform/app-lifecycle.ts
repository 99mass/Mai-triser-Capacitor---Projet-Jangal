// TODO(capacitor): remplacer par @capacitor/app + @capacitor/status-bar
//   import { App } from "@capacitor/app";
//   import { StatusBar, Style } from "@capacitor/status-bar";
//
//   Bouton retour Android : sans écouteur, il ferme l'application au lieu de
//   revenir à l'écran précédent.
//     App.addListener("backButton", ({ canGoBack }) => {
//       if (canGoBack) window.history.back();
//       else App.exitApp();               // ou minimiser depuis l'accueil
//     });
//
//   Barre de statut : la WebView passe sous la barre (viewport-fit=cover),
//   les en-têtes utilisent déjà env(safe-area-inset-top).
//     StatusBar.setOverlaysWebView({ overlay: true });
//     StatusBar.setStyle({ style: Style.Light });   // voir aussi platform/theme.ts
//
//   Retour au premier plan : rafraîchir la série du jour et le statut réseau.
//     App.addListener("appStateChange", ({ isActive }) => { ... });
//
//   Puis masquer l'écran de démarrage : SplashScreen.hide() (@capacitor/splash-screen).
//
// Initialisation de l'application au démarrage.

export async function initialiserApp(): Promise<void> {
  // Rien à faire côté web : le navigateur gère le retour et la barre d'état.
}
