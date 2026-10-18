// Branché sur @capacitor/app.
//
// Bouton retour Android : sans écouteur, il ferme l'activité au lieu de revenir
// à l'écran précédent. On reproduit le comportement attendu d'une app native :
//   1. un écran peut intercepter le retour (ex. revenir à l'étape précédente
//      de l'onboarding, qui n'est pas une page de l'historique) ;
//   2. sinon on remonte l'historique de navigation ;
//   3. sinon (écran racine) on met l'app en arrière-plan, comme Android 12+.
//
// La barre de statut et les zones sûres sont gérées par SystemBars, intégré à
// @capacitor/core (voir theme.ts et capacitor.config.ts).
// À venir : App.addListener("appStateChange") pour rafraîchir la série du jour
// quand l'app revient au premier plan.

import { App } from "@capacitor/app";
import { estNatif } from "./index";

/**
 * Retourne `true` si le retour a été traité (on ne remonte alors pas l'historique).
 * `peutRevenir` indique s'il existe une page précédente dans l'historique.
 */
type GestionnaireRetour = (contexte: { peutRevenir: boolean }) => boolean;

const gestionnaires: GestionnaireRetour[] = [];
let initialise = false; // évite un double écouteur (mode strict de React en dev)

/** Permet à un écran d'intercepter le bouton retour. Retourne la fonction de désinscription. */
export function intercepterRetour(gestionnaire: GestionnaireRetour): () => void {
  gestionnaires.push(gestionnaire);
  return () => {
    const i = gestionnaires.indexOf(gestionnaire);
    if (i >= 0) gestionnaires.splice(i, 1);
  };
}

export async function initialiserApp(): Promise<void> {
  // Sur le web, le navigateur gère déjà son propre bouton retour.
  if (!estNatif() || initialise) return;
  initialise = true;

  await App.addListener("backButton", ({ canGoBack }) => {
    // Le dernier écran inscrit est prioritaire.
    for (let i = gestionnaires.length - 1; i >= 0; i--) {
      if (gestionnaires[i]({ peutRevenir: canGoBack })) return;
    }
    if (canGoBack) window.history.back();
    else void App.minimizeApp();
  });
}
