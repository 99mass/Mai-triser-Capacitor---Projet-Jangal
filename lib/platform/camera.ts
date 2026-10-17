// TODO(capacitor): remplacer par @capacitor/camera
//   import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
//   const photo = await Camera.getPhoto({
//     source: CameraSource.Prompt,          // « Prendre une photo » ou « Galerie »
//     resultType: CameraResultType.DataUrl,
//     width: 256, quality: 80, allowEditing: true,
//   });
//   return photo.dataUrl;
// Penser aux permissions CAMERA / READ_MEDIA_IMAGES dans AndroidManifest.xml.
//
// Choix d'une photo de profil (champ fichier), réduite à 256 px pour rester
// légère dans le stockage local.

import { estNavigateur } from "./index";

const TAILLE_MAX = 256;

function choisirFichier(): Promise<File | null> {
  return new Promise((resoudre) => {
    const champ = document.createElement("input");
    champ.type = "file";
    champ.accept = "image/*";
    champ.addEventListener("change", () => resoudre(champ.files?.[0] ?? null), { once: true });
    champ.addEventListener("cancel", () => resoudre(null), { once: true });
    champ.click();
  });
}

async function reduireImage(fichier: File): Promise<string> {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, TAILLE_MAX / Math.min(image.width, image.height));
  const largeur = Math.round(image.width * echelle);
  const hauteur = Math.round(image.height * echelle);
  const cote = Math.min(largeur, hauteur);
  const toile = document.createElement("canvas");
  toile.width = cote;
  toile.height = cote;
  const ctx = toile.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  // Recadrage carré centré
  ctx.drawImage(image, (cote - largeur) / 2, (cote - hauteur) / 2, largeur, hauteur);
  image.close();
  return toile.toDataURL("image/jpeg", 0.82);
}

/** Retourne une image en data URL (JPEG carré), ou null si l'utilisateur annule. */
export async function choisirPhoto(): Promise<string | null> {
  if (!estNavigateur()) return null;
  const fichier = await choisirFichier();
  if (!fichier) return null;
  return reduireImage(fichier);
}
