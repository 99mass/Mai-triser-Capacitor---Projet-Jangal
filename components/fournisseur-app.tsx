"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as storage from "@/lib/storage";
import type { Achat, Activite, Profil, ProgressionCours, Telechargement } from "@/lib/storage";
import { ecouterReseau, estEnLigne } from "@/lib/platform/network";
import { ecrirePreference, lireToutesPreferences, PREFERENCES_PAR_DEFAUT, type Preferences } from "@/lib/platform/preferences";
import { appliquerTheme, ecouterThemeSysteme } from "@/lib/platform/theme";
import { programmerRappelQuotidien } from "@/lib/platform/notifications";
import { initialiserApp } from "@/lib/platform/app-lifecycle";

type EtatApp = {
  pret: boolean;
  profil: Profil | null;
  progressions: Record<string, ProgressionCours>;
  achats: Achat[];
  telechargements: Telechargement[];
  activite: Activite[];
  preferences: Preferences;
  enLigne: boolean;
  changerPreference: <K extends keyof Preferences>(cle: K, valeur: Preferences[K]) => Promise<void>;
};

const Contexte = createContext<EtatApp | null>(null);

type Donnees = Pick<EtatApp, "profil" | "progressions" | "achats" | "telechargements" | "activite">;

async function chargerDonnees(): Promise<Donnees> {
  const [profil, progressions, achats, telechargements, activite] = await Promise.all([
    storage.lireProfil(),
    storage.lireProgressions(),
    storage.lireAchats(),
    storage.lireTelechargements(),
    storage.lireActivite(),
  ]);
  return { profil, progressions, achats, telechargements, activite };
}

export function FournisseurApp({ children }: { children: ReactNode }) {
  const [pret, setPret] = useState(false);
  const [donnees, setDonnees] = useState<Donnees>({
    profil: null,
    progressions: {},
    achats: [],
    telechargements: [],
    activite: [],
  });
  const [preferences, setPreferences] = useState<Preferences>(PREFERENCES_PAR_DEFAUT);
  const [enLigne, setEnLigne] = useState(true);

  // Démarrage : données, préférences, réseau, rappel.
  useEffect(() => {
    let actif = true;
    const recharger = () => chargerDonnees().then((d) => actif && setDonnees(d));

    (async () => {
      await initialiserApp();
      const [d, prefs, enLigneInitial] = await Promise.all([chargerDonnees(), lireToutesPreferences(), estEnLigne()]);
      if (!actif) return;
      setDonnees(d);
      setPreferences(prefs);
      setEnLigne(enLigneInitial);
      setPret(true);
      appliquerTheme(prefs.theme);
      if (prefs.rappelActif) programmerRappelQuotidien(prefs.rappelHeure);
    })();

    const desabonnerStorage = storage.abonner(recharger);
    const desabonnerReseau = ecouterReseau(setEnLigne);
    return () => {
      actif = false;
      desabonnerStorage();
      desabonnerReseau();
    };
  }, []);

  // Suivre le thème du téléphone quand l'utilisateur a choisi « Système ».
  useEffect(() => ecouterThemeSysteme(() => appliquerTheme(preferences.theme)), [preferences.theme]);

  const changerPreference = useCallback(async <K extends keyof Preferences>(cle: K, valeur: Preferences[K]) => {
    await ecrirePreference(cle, valeur);
    setPreferences((p) => ({ ...p, [cle]: valeur }));
    if (cle === "theme") appliquerTheme(valeur as Preferences["theme"]);
  }, []);

  const valeur = useMemo<EtatApp>(
    () => ({ pret, ...donnees, preferences, enLigne, changerPreference }),
    [pret, donnees, preferences, enLigne, changerPreference],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useApp(): EtatApp {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error("useApp doit être utilisé dans <FournisseurApp>");
  return ctx;
}
