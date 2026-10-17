// TODO(capacitor): remplacer par @capacitor/preferences
//   import { Preferences } from "@capacitor/preferences";
//   lirePreference   → (await Preferences.get({ key })).value
//   ecrirePreference → Preferences.set({ key, value })
//   effacerPreferences → Preferences.clear()
// Les Preferences natives (SharedPreferences sur Android, UserDefaults sur iOS)
// survivent au nettoyage du cache de la WebView, contrairement à localStorage.
//
// Préférences légères de l'appareil (thème, rappel quotidien). Les données
// d'apprentissage, elles, passent par `lib/storage.ts`.

import { estNavigateur } from "./index";

const PREFIXE = "jangal.pref.";

export type Theme = "clair" | "sombre" | "systeme";

export type Preferences = {
  theme: Theme;
  rappelActif: boolean;
  /** Heure du rappel au format « HH:MM ». */
  rappelHeure: string;
};

export const PREFERENCES_PAR_DEFAUT: Preferences = {
  theme: "systeme",
  rappelActif: false,
  rappelHeure: "19:00",
};

export async function lirePreference<K extends keyof Preferences>(cle: K): Promise<Preferences[K]> {
  if (!estNavigateur()) return PREFERENCES_PAR_DEFAUT[cle];
  try {
    const brut = window.localStorage.getItem(PREFIXE + cle);
    return brut === null ? PREFERENCES_PAR_DEFAUT[cle] : (JSON.parse(brut) as Preferences[K]);
  } catch {
    return PREFERENCES_PAR_DEFAUT[cle];
  }
}

export async function ecrirePreference<K extends keyof Preferences>(cle: K, valeur: Preferences[K]): Promise<void> {
  if (!estNavigateur()) return;
  try {
    window.localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
  } catch {
    // Stockage plein ou indisponible : la préférence reste en mémoire pour la session.
  }
}

export async function lireToutesPreferences(): Promise<Preferences> {
  const [theme, rappelActif, rappelHeure] = await Promise.all([
    lirePreference("theme"),
    lirePreference("rappelActif"),
    lirePreference("rappelHeure"),
  ]);
  return { theme, rappelActif, rappelHeure };
}

export async function effacerPreferences(): Promise<void> {
  if (!estNavigateur()) return;
  for (const cle of Object.keys(PREFERENCES_PAR_DEFAUT)) {
    window.localStorage.removeItem(PREFIXE + cle);
  }
}

/**
 * Script exécuté avant le premier rendu pour appliquer le thème sans flash.
 * Il vit ici car il lit le même stockage que `lirePreference("theme")`.
 * Côté natif, la barre de statut et le splash screen masquent ce délai.
 */
export const SCRIPT_THEME_INITIAL = `(function(){try{var t=JSON.parse(localStorage.getItem("${PREFIXE}theme")||'"systeme"');var s=t==="sombre"||(t==="systeme"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",s);document.documentElement.style.colorScheme=s?"dark":"light";}catch(e){}})();`;
