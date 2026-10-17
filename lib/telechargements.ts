// Orchestration des téléchargements : les fichiers vont dans platform/downloads,
// les métadonnées (quelle leçon, quelle taille) dans lib/storage.

import type { Cours, LeconVideo } from "@/data";
import * as downloads from "./platform/downloads";
import * as storage from "./storage";

export const idFichier = (coursId: string, leconId: string) => `${coursId}/${leconId}`;

export function leconsVideo(cours: Cours): LeconVideo[] {
  return cours.chapitres.flatMap((c) => c.lecons).filter((l): l is LeconVideo => l.type === "video");
}

export function tailleEstimeeMo(cours: Cours): number {
  return leconsVideo(cours).reduce((s, l) => s + l.tailleMo, 0);
}

/** Télécharge toutes les vidéos du cours qui ne le sont pas encore. `surProgression` reçoit 0 → 1. */
export async function telechargerCours(
  cours: Cours,
  surProgression: (progression: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const deja = new Set(
    (await storage.lireTelechargements()).filter((t) => t.coursId === cours.id).map((t) => t.leconId),
  );
  const aFaire = leconsVideo(cours).filter((l) => !deja.has(l.id));
  const poidsTotal = aFaire.reduce((s, l) => s + l.tailleMo, 0) || 1;
  let poidsFait = 0;

  for (const lecon of aFaire) {
    const taille = await downloads.telechargerFichier(
      idFichier(cours.id, lecon.id),
      lecon.videoUrl,
      (p) => surProgression((poidsFait + p * lecon.tailleMo) / poidsTotal),
      signal,
    );
    poidsFait += lecon.tailleMo;
    await storage.ajouterTelechargement({ coursId: cours.id, leconId: lecon.id, taille });
  }
  surProgression(1);
}

export async function supprimerTelechargementsCours(cours: Cours): Promise<void> {
  const liste = (await storage.lireTelechargements()).filter((t) => t.coursId === cours.id);
  await Promise.all(liste.map((t) => downloads.supprimerFichier(idFichier(t.coursId, t.leconId))));
  await storage.retirerTelechargements(cours.id);
}

/** URL lisible hors ligne pour une leçon vidéo, ou null si elle n'est pas téléchargée. */
export function urlLocaleLecon(coursId: string, leconId: string): Promise<string | null> {
  return downloads.lireFichier(idFichier(coursId, leconId));
}
