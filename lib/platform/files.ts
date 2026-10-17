// TODO(capacitor): remplacer par @capacitor/filesystem + @capacitor/share
//   import { Filesystem, Directory } from "@capacitor/filesystem";
//   import { Share } from "@capacitor/share";
//   const { uri } = await Filesystem.writeFile({
//     path: nomFichier, data: base64SansEntete, directory: Directory.Cache,
//   });
//   await Share.share({ title: nomFichier, files: [uri] });   // « Enregistrer dans Galerie / Drive »
// Dans une WebView, <a download> ne fait rien : il faut écrire le fichier puis
// l'ouvrir via la feuille de partage native.
//
// Export d'un fichier image (certificat PNG) par téléchargement navigateur.

import { estNavigateur } from "./index";

export async function exporterImage(donnees: Blob, nomFichier: string): Promise<boolean> {
  if (!estNavigateur()) return false;
  const url = URL.createObjectURL(donnees);
  try {
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nomFichier;
    lien.rel = "noopener";
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    return true;
  } finally {
    // Laisser au navigateur le temps de lancer le téléchargement.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}
