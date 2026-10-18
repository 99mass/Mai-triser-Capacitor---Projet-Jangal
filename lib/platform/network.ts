// Branché sur @capacitor/network.
//
// En natif, c'est Android qui informe l'app des changements de réseau
// (ConnectivityManager) : l'information est plus fiable que navigator.onLine,
// et le plugin indique aussi le type de connexion (wifi / cellular / none),
// utile plus tard pour ne télécharger les vidéos qu'en Wi-Fi.
//
// Statut en ligne / hors ligne.

import { Network } from "@capacitor/network";
import { estNatif, estNavigateur } from "./index";

export async function estEnLigne(): Promise<boolean> {
  if (estNatif()) return (await Network.getStatus()).connected;
  if (!estNavigateur()) return true;
  return navigator.onLine;
}

/** Appelle `rappel` à chaque changement de connexion. Retourne la fonction de désabonnement. */
export function ecouterReseau(rappel: (enLigne: boolean) => void): () => void {
  if (estNatif()) {
    // addListener est asynchrone : on garde la promesse pour pouvoir se désabonner.
    const ecouteur = Network.addListener("networkStatusChange", (statut) => rappel(statut.connected));
    return () => void ecouteur.then((e) => e.remove());
  }
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
