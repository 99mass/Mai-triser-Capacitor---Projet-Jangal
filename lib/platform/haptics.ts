// TODO(capacitor): remplacer par @capacitor/haptics
//   import { Haptics, NotificationType, ImpactStyle } from "@capacitor/haptics";
//   vibrerSucces → Haptics.notification({ type: NotificationType.Success })
//   vibrerErreur → Haptics.notification({ type: NotificationType.Error })
//   vibrerLeger  → Haptics.impact({ style: ImpactStyle.Light })
// navigator.vibrate n'existe pas sur iOS (Safari/WKWebView) : le plugin natif
// apporte le retour haptique aux deux plateformes.
//
// Vibrations courtes de retour (bonne / mauvaise réponse de quiz).

import { estNavigateur } from "./index";

function vibrer(motif: number | number[]): void {
  if (!estNavigateur() || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(motif);
  } catch {
    // Certains navigateurs refusent la vibration sans geste utilisateur récent.
  }
}

export async function vibrerSucces(): Promise<void> {
  vibrer(35);
}

export async function vibrerErreur(): Promise<void> {
  vibrer([70, 50, 70]);
}

export async function vibrerLeger(): Promise<void> {
  vibrer(12);
}
