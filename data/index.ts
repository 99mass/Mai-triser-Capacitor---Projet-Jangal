import type { Chapitre, CategorieId, Cours, Lecon } from "./types";
import { coursReact } from "./cours/react";
import { coursFlutter } from "./cours/flutter";
import { coursPythonData } from "./cours/python-data";
import { coursDesign } from "./cours/design";
import { coursBusiness } from "./cours/business";
import { coursAnglais } from "./cours/anglais";

export * from "./types";
export * from "./categories";

export const COURS: Cours[] = [coursReact, coursFlutter, coursPythonData, coursDesign, coursBusiness, coursAnglais];

export type LeconSituee = {
  lecon: Lecon;
  chapitre: Chapitre;
  numeroChapitre: number;
  /** Position de la leçon dans le cours (1 = première). */
  numero: number;
};

export function trouverCours(id: string): Cours | undefined {
  return COURS.find((c) => c.id === id);
}

export function toutesLecons(cours: Cours): LeconSituee[] {
  let numero = 0;
  return cours.chapitres.flatMap((chapitre, i) =>
    chapitre.lecons.map((lecon) => ({ lecon, chapitre, numeroChapitre: i + 1, numero: ++numero })),
  );
}

export function nombreLecons(cours: Cours): number {
  return cours.chapitres.reduce((n, c) => n + c.lecons.length, 0);
}

export function dureeTotale(cours: Cours): number {
  return cours.chapitres.reduce((n, c) => n + c.lecons.reduce((m, l) => m + l.duree, 0), 0);
}

export function estGratuit(cours: Cours): boolean {
  return cours.prix === 0;
}

/** Une leçon payante reste consultable en aperçu : la première du cours. */
export function estApercu(cours: Cours, leconId: string): boolean {
  return cours.chapitres[0]?.lecons[0]?.id === leconId;
}

export function coursRecommandes(interets: CategorieId[]): Cours[] {
  const prioritaires = COURS.filter((c) => interets.includes(c.categorie));
  const autres = COURS.filter((c) => !interets.includes(c.categorie));
  return [...prioritaires, ...autres];
}

export function formaterPrix(prix: number): string {
  return prix === 0 ? "Gratuit" : `${prix.toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;
}

export function formaterDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m.toString().padStart(2, "0")}` : `${h} h`;
}
