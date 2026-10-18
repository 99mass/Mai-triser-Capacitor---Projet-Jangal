// Branché sur @capacitor/filesystem + @capacitor/file-transfer.
//
// Natif : chaque vidéo est un vrai fichier MP4 dans le dossier privé de l'app
// (Directory.Data → /data/user/0/sn.jangal.app/files/videos/). Android ne le
// vide jamais de lui-même, contrairement au Cache API du navigateur.
// Le téléchargement est fait par Android (pas par la WebView) : aucune
// contrainte CORS, et le fichier n'est jamais chargé entier en mémoire.
//
// Web : Cache API du navigateur, comme avant (pour `npm run dev`).
//
// Téléchargement des vidéos pour le hors-ligne.

import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { FileTransfer } from "@capacitor/file-transfer";
import { estNatif, estNavigateur } from "./index";

export type FichierLocal = { id: string; taille: number };

// ─── Natif : fichiers dans le dossier de l'app ──────────────────────────────

const DOSSIER = "videos";
// Les id ressemblent à « bases-react/l1 » : on remplace « / » pour rester dans un seul dossier.
const chemin = (id: string) => `${DOSSIER}/${id.replaceAll("/", "__")}.mp4`;
const idDepuisNom = (nom: string) => nom.replace(/\.mp4$/, "").replaceAll("__", "/");
const emplacement = (id: string) => ({ path: chemin(id), directory: Directory.Data });

async function telechargerNatif(id: string, url: string, surProgression?: (p: number) => void, signal?: AbortSignal) {
  signal?.throwIfAborted();
  await Filesystem.mkdir({ path: DOSSIER, directory: Directory.Data, recursive: true }).catch(() => {
    // Le dossier existe déjà.
  });
  // file-transfer veut un chemin complet (file:///data/user/0/…), pas un chemin relatif.
  const { uri } = await Filesystem.getUri(emplacement(id));
  const ecouteur = await FileTransfer.addListener("progress", (p) => {
    if (p.url === url && p.lengthComputable && p.contentLength > 0) surProgression?.(p.bytes / p.contentLength);
  });
  try {
    await FileTransfer.downloadFile({ url, path: uri, progress: true });
  } catch (erreur) {
    // Ne pas laisser un fichier à moitié écrit, qui serait compté comme téléchargé.
    await Filesystem.deleteFile(emplacement(id)).catch(() => {});
    throw erreur;
  } finally {
    await ecouteur.remove();
  }
  surProgression?.(1);
  return (await Filesystem.stat(emplacement(id))).size;
}

async function existeNatif(id: string): Promise<boolean> {
  return Filesystem.stat(emplacement(id)).then(
    () => true,
    () => false,
  );
}

// ─── Web : Cache API ────────────────────────────────────────────────────────

const NOM_CACHE = "jangal-telechargements-v1";
// Clés synthétiques : une entrée par leçon, même si deux leçons partagent une vidéo.
const BASE_CLE = "https://jangal.local/telechargements/";
const ENTETE_TAILLE = "x-jangal-taille";

function cle(id: string): string {
  return BASE_CLE + encodeURIComponent(id);
}

async function ouvrirCache(): Promise<Cache> {
  if (!(estNavigateur() && "caches" in window)) throw new Error("Le stockage hors ligne n'est pas disponible sur cet appareil.");
  return caches.open(NOM_CACHE);
}

async function telechargerWeb(id: string, url: string, surProgression?: (p: number) => void, signal?: AbortSignal) {
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

// ─── API commune ────────────────────────────────────────────────────────────

export function telechargementsDisponibles(): boolean {
  return estNatif() || (estNavigateur() && "caches" in window);
}

/**
 * Télécharge `url` et la conserve sous l'identifiant `id`.
 * `surProgression` reçoit une valeur entre 0 et 1. Retourne la taille en octets.
 * En natif, `signal` n'interrompt pas un fichier en cours : il empêche seulement de le commencer.
 */
export async function telechargerFichier(
  id: string,
  url: string,
  surProgression?: (progression: number) => void,
  signal?: AbortSignal,
): Promise<number> {
  if (estNatif()) return telechargerNatif(id, url, surProgression, signal);
  return telechargerWeb(id, url, surProgression, signal);
}

export async function estTelecharge(id: string): Promise<boolean> {
  if (estNatif()) return existeNatif(id);
  if (!telechargementsDisponibles()) return false;
  const cache = await ouvrirCache();
  return (await cache.match(cle(id))) !== undefined;
}

/** URL lisible par un lecteur <video> pour un fichier téléchargé, ou null. Penser à `liberer()`. */
export async function lireFichier(id: string): Promise<string | null> {
  if (estNatif()) {
    if (!(await existeNatif(id))) return null;
    const { uri } = await Filesystem.getUri(emplacement(id));
    // file:///data/… → https://localhost/_capacitor_file_/data/… , une URL que la WebView sait lire.
    return Capacitor.convertFileSrc(uri);
  }
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
  if (estNatif()) return void (await Filesystem.deleteFile(emplacement(id)).catch(() => {}));
  if (!telechargementsDisponibles()) return;
  const cache = await ouvrirCache();
  await cache.delete(cle(id));
}

export async function listerFichiers(): Promise<FichierLocal[]> {
  if (estNatif()) {
    const { files } = await Filesystem.readdir({ path: DOSSIER, directory: Directory.Data }).catch(() => ({ files: [] }));
    return files.map((f) => ({ id: idDepuisNom(f.name), taille: f.size }));
  }
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
  if (estNatif()) {
    return void (await Filesystem.rmdir({ path: DOSSIER, directory: Directory.Data, recursive: true }).catch(() => {}));
  }
  if (!telechargementsDisponibles()) return;
  await caches.delete(NOM_CACHE);
}
