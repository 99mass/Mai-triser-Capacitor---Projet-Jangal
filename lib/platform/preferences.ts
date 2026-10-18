// Branché sur @capacitor/preferences.
//
// Stockage clé → valeur de l'appareil. En natif, les valeurs sont écrites par
// Android dans un fichier XML privé de l'app (SharedPreferences), ou dans
// UserDefaults sur iOS : elles ne dépendent pas de la WebView. Sur le web, on
// garde localStorage pour que `npm run dev` fonctionne dans le navigateur.
//
// Ce module sert deux usages :
//   - les préférences légères de l'appareil (thème, rappel quotidien) ;
//   - le stockage brut utilisé par `lib/storage.ts` (profil, progression…).

import { Preferences as PreferencesNatives } from "@capacitor/preferences";
import { estNatif, estNavigateur } from "./index";

// ─── Stockage brut clé → texte ──────────────────────────────────────────────

/**
 * Lit une valeur. En natif, si elle n'existe pas encore dans Preferences mais
 * existe dans le localStorage de la WebView (données d'avant la migration), on
 * la recopie : l'utilisateur ne perd ni son profil ni sa progression.
 */
async function lireValeur(cle: string): Promise<string | null> {
  if (!estNavigateur()) return null;
  if (!estNatif()) return window.localStorage.getItem(cle);

  const { value } = await PreferencesNatives.get({ key: cle });
  if (value !== null) return value;
  const ancienne = window.localStorage.getItem(cle);
  if (ancienne !== null) await PreferencesNatives.set({ key: cle, value: ancienne });
  return ancienne;
}

async function ecrireValeur(cle: string, valeur: string): Promise<void> {
  if (!estNavigateur()) return;
  if (estNatif()) await PreferencesNatives.set({ key: cle, value: valeur });
  else window.localStorage.setItem(cle, valeur);
}

/** Supprime partout, y compris l'ancienne copie localStorage (sinon la migration la ferait revenir). */
async function supprimerValeur(cle: string): Promise<void> {
  if (!estNavigateur()) return;
  if (estNatif()) await PreferencesNatives.remove({ key: cle });
  window.localStorage.removeItem(cle);
}

/** Accès brut réservé à `lib/storage.ts`. */
export const stockageCleValeur = { lire: lireValeur, ecrire: ecrireValeur, supprimer: supprimerValeur };

// ─── Préférences de l'appareil ──────────────────────────────────────────────

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
  try {
    const brut = await lireValeur(PREFIXE + cle);
    return brut === null ? PREFERENCES_PAR_DEFAUT[cle] : (JSON.parse(brut) as Preferences[K]);
  } catch {
    return PREFERENCES_PAR_DEFAUT[cle];
  }
}

export async function ecrirePreference<K extends keyof Preferences>(cle: K, valeur: Preferences[K]): Promise<void> {
  try {
    await ecrireValeur(PREFIXE + cle, JSON.stringify(valeur));
    // Le thème est aussi gardé en cache dans localStorage : SCRIPT_THEME_INITIAL
    // s'exécute avant React et avant le bridge, il ne peut lire que localStorage.
    if (cle === "theme" && estNatif()) window.localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
  } catch {
    // Stockage indisponible : la préférence reste en mémoire pour la session.
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
  await Promise.all(Object.keys(PREFERENCES_PAR_DEFAUT).map((cle) => supprimerValeur(PREFIXE + cle)));
}

/**
 * Script exécuté avant le premier rendu pour appliquer le thème sans flash.
 * Il lit le cache localStorage du thème (voir ecrirePreference).
 */
export const SCRIPT_THEME_INITIAL = `(function(){try{var t=JSON.parse(localStorage.getItem("${PREFIXE}theme")||'"systeme"');var s=t==="sombre"||(t==="systeme"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",s);document.documentElement.style.colorScheme=s?"dark":"light";}catch(e){}})();`;
