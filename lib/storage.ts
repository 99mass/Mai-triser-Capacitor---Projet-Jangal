// Module unique de persistance de Jàngal.
//
// Toutes les données d'apprentissage passent par ici : profil, progression,
// notes, résultats de quiz, cours achetés, téléchargements et activité.
// L'API est asynchrone : l'implémentation a pu passer de localStorage à
// @capacitor/preferences sans toucher aux composants. Prochaine étape possible :
// SQLite (@capacitor-community/sqlite) ou une API distante.
//
// Le stockage physique passe par `stockageCleValeur` (lib/platform/preferences) :
// Preferences natives dans l'app, localStorage dans le navigateur.
// Aucun composant n'appelle localStorage directement.

import type { CategorieId } from "@/data/types";
import { stockageCleValeur as kv } from "@/lib/platform/preferences";

const PREFIXE = "jangal.donnees.";
const VERSION = 1;

// ─── Types ──────────────────────────────────────────────────────────────────

export type Profil = {
  prenom: string;
  interets: CategorieId[];
  /** Photo de profil en data URL (JPEG 256 px). */
  photo?: string;
  objectifHebdo: number;
  creeLe: string;
};

export type ProgressionCours = {
  leconsTerminees: string[];
  derniereLecon?: string;
  derniereVisite?: string;
  termineLe?: string;
};

export type ResultatQuiz = {
  score: number;
  total: number;
  date: string;
  meilleurScore: number;
};

export type Achat = {
  coursId: string;
  moyen: "wave" | "orange-money";
  numero: string;
  montant: number;
  reference: string;
  date: string;
};

export type Telechargement = {
  coursId: string;
  leconId: string;
  taille: number;
  date: string;
};

/** Une leçon terminée, datée : sert au calcul de la série et de l'objectif. */
export type Activite = { coursId: string; leconId: string; date: string };

type Schema = {
  version: number;
  profil: Profil | null;
  progressions: Record<string, ProgressionCours>;
  notes: Record<string, string>;
  quiz: Record<string, ResultatQuiz>;
  achats: Achat[];
  telechargements: Telechargement[];
  activite: Activite[];
};

type Cle = Exclude<keyof Schema, "version">;

const VALEURS_INITIALES: Omit<Schema, "version"> = {
  profil: null,
  progressions: {},
  notes: {},
  quiz: {},
  achats: [],
  telechargements: [],
  activite: [],
};

// ─── Implémentation (Preferences natives ou localStorage) ───────────────────

const auditeurs = new Set<() => void>();

async function lire<K extends Cle>(cle: K): Promise<Schema[K]> {
  try {
    const brut = await kv.lire(PREFIXE + cle);
    return brut === null ? (structuredClone(VALEURS_INITIALES[cle]) as Schema[K]) : (JSON.parse(brut) as Schema[K]);
  } catch {
    return structuredClone(VALEURS_INITIALES[cle]) as Schema[K];
  }
}

async function ecrire<K extends Cle>(cle: K, valeur: Schema[K]): Promise<void> {
  try {
    await kv.ecrire(PREFIXE + cle, JSON.stringify(valeur));
    await kv.ecrire(PREFIXE + "version", String(VERSION));
  } catch {
    throw new Error("Espace de stockage plein. Supprimez des téléchargements ou votre photo de profil.");
  }
  auditeurs.forEach((f) => f());
}

/** Prévient à chaque écriture. Retourne la fonction de désabonnement. */
export function abonner(rappel: () => void): () => void {
  auditeurs.add(rappel);
  return () => auditeurs.delete(rappel);
}

const cleLecon = (coursId: string, leconId: string) => `${coursId}/${leconId}`;
const maintenant = () => new Date().toISOString();

// ─── Profil ─────────────────────────────────────────────────────────────────

export function lireProfil(): Promise<Profil | null> {
  return lire("profil");
}

export function enregistrerProfil(profil: Profil): Promise<void> {
  return ecrire("profil", profil);
}

export async function modifierProfil(modifs: Partial<Profil>): Promise<void> {
  const profil = await lireProfil();
  if (!profil) return;
  await enregistrerProfil({ ...profil, ...modifs });
}

// ─── Progression ────────────────────────────────────────────────────────────

export function lireProgressions(): Promise<Record<string, ProgressionCours>> {
  return lire("progressions");
}

export async function lireProgression(coursId: string): Promise<ProgressionCours> {
  return (await lireProgressions())[coursId] ?? { leconsTerminees: [] };
}

export async function definirDerniereLecon(coursId: string, leconId: string): Promise<void> {
  const toutes = await lireProgressions();
  const actuelle = toutes[coursId] ?? { leconsTerminees: [] };
  toutes[coursId] = { ...actuelle, derniereLecon: leconId, derniereVisite: maintenant() };
  await ecrire("progressions", toutes);
}

/** Marque une leçon terminée. `totalLecons` permet de dater la fin du cours. */
export async function marquerLeconTerminee(coursId: string, leconId: string, totalLecons: number): Promise<void> {
  const toutes = await lireProgressions();
  const actuelle = toutes[coursId] ?? { leconsTerminees: [] };
  if (actuelle.leconsTerminees.includes(leconId)) return;
  const leconsTerminees = [...actuelle.leconsTerminees, leconId];
  toutes[coursId] = {
    ...actuelle,
    leconsTerminees,
    derniereLecon: leconId,
    derniereVisite: maintenant(),
    termineLe: leconsTerminees.length >= totalLecons ? (actuelle.termineLe ?? maintenant()) : actuelle.termineLe,
  };
  await ecrire("progressions", toutes);

  const activite = await lire("activite");
  activite.push({ coursId, leconId, date: maintenant() });
  await ecrire("activite", activite.slice(-500));
}

export function lireActivite(): Promise<Activite[]> {
  return lire("activite");
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export async function lireNote(coursId: string, leconId: string): Promise<string> {
  return (await lire("notes"))[cleLecon(coursId, leconId)] ?? "";
}

export async function enregistrerNote(coursId: string, leconId: string, texte: string): Promise<void> {
  const notes = await lire("notes");
  const cle = cleLecon(coursId, leconId);
  if (texte.trim()) notes[cle] = texte;
  else delete notes[cle];
  await ecrire("notes", notes);
}

// ─── Quiz ───────────────────────────────────────────────────────────────────

export async function lireResultatQuiz(coursId: string, leconId: string): Promise<ResultatQuiz | null> {
  return (await lire("quiz"))[cleLecon(coursId, leconId)] ?? null;
}

export async function enregistrerResultatQuiz(
  coursId: string,
  leconId: string,
  score: number,
  total: number,
): Promise<ResultatQuiz> {
  const quiz = await lire("quiz");
  const cle = cleLecon(coursId, leconId);
  const resultat: ResultatQuiz = {
    score,
    total,
    date: maintenant(),
    meilleurScore: Math.max(score, quiz[cle]?.meilleurScore ?? 0),
  };
  quiz[cle] = resultat;
  await ecrire("quiz", quiz);
  return resultat;
}

// ─── Achats ─────────────────────────────────────────────────────────────────

export function lireAchats(): Promise<Achat[]> {
  return lire("achats");
}

export async function enregistrerAchat(achat: Omit<Achat, "date">): Promise<void> {
  const achats = (await lireAchats()).filter((a) => a.coursId !== achat.coursId);
  achats.push({ ...achat, date: maintenant() });
  await ecrire("achats", achats);
}

// ─── Téléchargements (métadonnées ; les fichiers sont dans platform/downloads) ─

export function lireTelechargements(): Promise<Telechargement[]> {
  return lire("telechargements");
}

export async function ajouterTelechargement(t: Omit<Telechargement, "date">): Promise<void> {
  const liste = (await lireTelechargements()).filter((x) => !(x.coursId === t.coursId && x.leconId === t.leconId));
  liste.push({ ...t, date: maintenant() });
  await ecrire("telechargements", liste);
}

export async function retirerTelechargements(coursId: string, leconIds?: string[]): Promise<void> {
  const liste = (await lireTelechargements()).filter(
    (x) => x.coursId !== coursId || (leconIds !== undefined && !leconIds.includes(x.leconId)),
  );
  await ecrire("telechargements", liste);
}

// ─── Maintenance ────────────────────────────────────────────────────────────

/** Taille approximative des données d'apprentissage (hors vidéos), en octets. */
export async function tailleDonnees(): Promise<number> {
  let total = 0;
  for (const cle of Object.keys(VALEURS_INITIALES)) {
    const brut = await kv.lire(PREFIXE + cle);
    if (brut) total += (PREFIXE.length + cle.length + brut.length) * 2; // UTF-16
  }
  return total;
}

export async function reinitialiserTout(): Promise<void> {
  await Promise.all([...Object.keys(VALEURS_INITIALES), "version"].map((cle) => kv.supprimer(PREFIXE + cle)));
  auditeurs.forEach((f) => f());
}
