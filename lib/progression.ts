import { estGratuit, nombreLecons, toutesLecons, type Cours, type LeconSituee } from "@/data";
import type { Achat, Activite, ProgressionCours } from "./storage";

export const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Clé de jour locale « AAAA-MM-JJ ». */
export function cleJour(date: Date): string {
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const j = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${m}-${j}`;
}

function debutSemaine(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // lundi
  return d;
}

export function pourcentage(cours: Cours, progression?: ProgressionCours): number {
  if (!progression) return 0;
  const total = nombreLecons(cours);
  const ids = new Set(toutesLecons(cours).map((l) => l.lecon.id));
  const faites = progression.leconsTerminees.filter((id) => ids.has(id)).length;
  return total ? Math.round((faites / total) * 100) : 0;
}

export function estTermine(cours: Cours, progression?: ProgressionCours): boolean {
  return pourcentage(cours, progression) === 100;
}

export function aCommence(progression?: ProgressionCours): boolean {
  return !!progression && (progression.leconsTerminees.length > 0 || !!progression.derniereLecon);
}

export function estAchete(cours: Cours, achats: Achat[]): boolean {
  return estGratuit(cours) || achats.some((a) => a.coursId === cours.id);
}

/** La leçon à reprendre : la première non terminée à partir de la dernière ouverte. */
export function leconAReprendre(cours: Cours, progression?: ProgressionCours): LeconSituee {
  const lecons = toutesLecons(cours);
  const faites = new Set(progression?.leconsTerminees ?? []);
  const derniere = lecons.findIndex((l) => l.lecon.id === progression?.derniereLecon);
  if (derniere >= 0 && !faites.has(lecons[derniere].lecon.id)) return lecons[derniere];
  const apres = lecons.slice(Math.max(0, derniere)).find((l) => !faites.has(l.lecon.id));
  return apres ?? lecons.find((l) => !faites.has(l.lecon.id)) ?? lecons[0];
}

/** Jours consécutifs avec au moins une leçon terminée, en comptant aujourd'hui ou hier. */
export function serieJours(activite: Activite[], aujourdhui = new Date()): number {
  const jours = new Set(activite.map((a) => cleJour(new Date(a.date))));
  const curseur = new Date(aujourdhui);
  if (!jours.has(cleJour(curseur))) curseur.setDate(curseur.getDate() - 1);
  let serie = 0;
  while (jours.has(cleJour(curseur))) {
    serie++;
    curseur.setDate(curseur.getDate() - 1);
  }
  return serie;
}

/** Pour chaque jour de la semaine en cours (lundi → dimanche) : actif ou non. */
export function semaineActive(activite: Activite[], aujourdhui = new Date()): { actif: boolean; estAujourdhui: boolean }[] {
  const jours = new Set(activite.map((a) => cleJour(new Date(a.date))));
  const lundi = debutSemaine(aujourdhui);
  const cleAujourdhui = cleJour(aujourdhui);
  return JOURS_COURTS.map((_, i) => {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    return { actif: jours.has(cleJour(d)), estAujourdhui: cleJour(d) === cleAujourdhui };
  });
}

export function leconsCetteSemaine(activite: Activite[], aujourdhui = new Date()): number {
  const lundi = debutSemaine(aujourdhui).getTime();
  return activite.filter((a) => new Date(a.date).getTime() >= lundi).length;
}

export function formaterTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
