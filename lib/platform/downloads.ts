// TODO(capacitor): remplacer par @capacitor/filesystem
//   import { Filesystem, Directory } from "@capacitor/filesystem";
//   telechargerFichier → Filesystem.downloadFile({ url, path: `videos/${id}.mp4`,
//                          directory: Directory.Data, progress: true })
//                        + Filesystem.addListener("progress", ...) pour la progression
//   lireFichier        → const { uri } = await Filesystem.getUri({ path, directory: Directory.Data });
//                        return Capacitor.convertFileSrc(uri);   // lisible par <video>
//   supprimerFichier   → Filesystem.deleteFile({ path, directory: Directory.Data })
//   listerFichiers     → Filesystem.readdir({ path: "videos", directory: Directory.Data })
//   espaceUtilise      → somme des `size` renvoyés par readdir / stat
// Le stockage natif n'est pas purgé par le système comme le Cache API peut l'être.
//
// Téléchargement des vidéos pour le hors-ligne (Cache API du navigateur).

import { estNavigateur } from "./index";

const NOM_CACHE = "jangal-telechargements-v1";
// Clés synthétiques : une entrée par leçon, même si deux leçons partagent une vidéo.
const BASE_CLE = "https://jangal.local/telechargements/";
const ENTETE_TAILLE = "x-jangal-taille";

export type FichierLocal = { id: string; taille: number };

function cle(id: string): string {
  return BASE_CLE + encodeURIComponent(id);
}

export function telechargementsDisponibles(): boolean {
  return estNavigateur() && "caches" in window;
}

async function ouvrirCache(): Promise<Cache> {
  if (!telechargementsDisponibles()) throw new Error("Le stockage hors ligne n'est pas disponible sur cet appareil.");
  return caches.open(NOM_CACHE);
}

/**
 * Télécharge `url` et la conserve sous l'identifiant `id`.
 * `surProgression` reçoit une valeur entre 0 et 1. Retourne la taille en octets.
 */
export async function telechargerFichier(
  id: string,
  url: string,
  surProgression?: (progression: number) => void,
  signal?: AbortSignal,
): Promise<number> {
  const cache = await ouvrirCache();
  const reponse = await fetch(url, { signal, mode: "cors" });
  if (!reponse.ok || !reponse.body) throw new Error(`Téléchargement impossible (${reponse.status})`);

  const total = Number(reponse.headers.get("content-length")) || 0;
  const lecteur = reponse.body.getReader();
  const morceaux: BlobPart[] = [];
  let recu = 0;
  for (;;) {
    const { done, value } = await lecteur.read();
    if (done) break;
    morceaux.push(value);
    recu += value.byteLength;
    if (total) surProgression?.(Math.min(1, recu / total));
  }
  const type = reponse.headers.get("content-type") ?? "video/mp4";
  const blob = new Blob(morceaux, { type });
  await cache.put(
    cle(id),
    new Response(blob, {
      headers: { "content-type": type, "content-length": String(blob.size), [ENTETE_TAILLE]: String(blob.size) },
    }),
  );
  surProgression?.(1);
  return blob.size;
}

export async function estTelecharge(id: string): Promise<boolean> {
  if (!telechargementsDisponibles()) return false;
  const cache = await ouvrirCache();
  return (await cache.match(cle(id))) !== undefined;
}

/** URL lisible par un lecteur <video> pour un fichier téléchargé, ou null. Penser à `liberer()`. */
export async function lireFichier(id: string): Promise<string | null> {
  if (!telechargementsDisponibles()) return null;
  const cache = await ouvrirCache();
  const reponse = await cache.match(cle(id));
  if (!reponse) return null;
  return URL.createObjectURL(await reponse.blob());
}

export function liberer(urlLocale: string): void {
  if (urlLocale.startsWith("blob:")) URL.revokeObjectURL(urlLocale);
}

export async function supprimerFichier(id: string): Promise<void> {
  if (!telechargementsDisponibles()) return;
  const cache = await ouvrirCache();
  await cache.delete(cle(id));
}

export async function listerFichiers(): Promise<FichierLocal[]> {
  if (!telechargementsDisponibles()) return [];
  const cache = await ouvrirCache();
  const requetes = await cache.keys();
  return Promise.all(
    requetes.map(async (requete) => {
      const reponse = await cache.match(requete);
      const taille = Number(reponse?.headers.get(ENTETE_TAILLE)) || 0;
      return { id: decodeURIComponent(requete.url.slice(BASE_CLE.length)), taille };
    }),
  );
}

/** Espace occupé par les vidéos téléchargées, en octets. */
export async function espaceUtilise(): Promise<number> {
  const fichiers = await listerFichiers();
  return fichiers.reduce((somme, f) => somme + f.taille, 0);
}

export async function toutSupprimer(): Promise<void> {
  if (!telechargementsDisponibles()) return;
  await caches.delete(NOM_CACHE);
}
