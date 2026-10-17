// TODO(capacitor): remplacer par @capacitor/network
//   import { Network } from "@capacitor/network";
//   estEnLigne    → (await Network.getStatus()).connected
//   ecouterReseau → const h = await Network.addListener("networkStatusChange", s => rappel(s.connected));
//                   return () => h.remove();
// Le plugin natif indique aussi le type de connexion (wifi / cellular), utile
// pour proposer de ne télécharger les vidéos qu'en Wi-Fi.
//
// Statut en ligne / hors ligne.

import { estNavigateur } from "./index";

export async function estEnLigne(): Promise<boolean> {
  if (!estNavigateur()) return true;
  return navigator.onLine;
}

/** Appelle `rappel` à chaque changement de connexion. Retourne la fonction de désabonnement. */
export function ecouterReseau(rappel: (enLigne: boolean) => void): () => void {
  if (!estNavigateur()) return () => {};
  const surEnLigne = () => rappel(true);
  const surHorsLigne = () => rappel(false);
  window.addEventListener("online", surEnLigne);
  window.addEventListener("offline", surHorsLigne);
  return () => {
    window.removeEventListener("online", surEnLigne);
    window.removeEventListener("offline", surHorsLigne);
  };
}
