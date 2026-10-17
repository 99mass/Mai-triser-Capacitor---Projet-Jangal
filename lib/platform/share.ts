// TODO(capacitor): remplacer par @capacitor/share
//   import { Share } from "@capacitor/share";
//   await Share.share({ title, text, url, files: [cheminFichier] });
// Côté natif, l'URL partagée doit pointer vers une adresse publique (site web
// ou lien profond Android App Links) : l'origine de la WebView
// (http://localhost) n'a pas de sens pour le destinataire. Pour un fichier,
// on l'écrit d'abord avec @capacitor/filesystem (voir files.ts) puis on passe
// son `uri` dans `files`.
//
// Partage d'un cours ou d'un certificat (Web Share API, sinon presse-papiers).

import { estNavigateur } from "./index";

export type ContenuPartage = {
  titre: string;
  texte: string;
  /** Chemin interne de l'application, ex. « /cours/react/ ». */
  chemin?: string;
  fichier?: { donnees: Blob; nom: string };
};

export type ResultatPartage = "partage" | "copie" | "annule" | "echec";

export function urlPublique(chemin: string): string {
  if (!estNavigateur()) return chemin;
  return new URL(chemin, window.location.origin).toString();
}

export async function partager(contenu: ContenuPartage): Promise<ResultatPartage> {
  if (!estNavigateur()) return "echec";
  const url = contenu.chemin ? urlPublique(contenu.chemin) : undefined;
  const donnees: ShareData = { title: contenu.titre, text: contenu.texte, url };

  if (contenu.fichier) {
    const fichier = new File([contenu.fichier.donnees], contenu.fichier.nom, { type: contenu.fichier.donnees.type });
    if (navigator.canShare?.({ files: [fichier] })) donnees.files = [fichier];
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(donnees);
      return "partage";
    } catch (erreur) {
      if (erreur instanceof DOMException && erreur.name === "AbortError") return "annule";
      // Sinon on se rabat sur le presse-papiers.
    }
  }

  try {
    await navigator.clipboard.writeText([contenu.texte, url].filter(Boolean).join("\n"));
    return "copie";
  } catch {
    return "echec";
  }
}
