// Dessin du certificat en PNG (canvas), pour l'export et le partage.

export type DonneesCertificat = {
  prenom: string;
  cours: string;
  formateur: string;
  date: string;
  numero: string;
};

/** Numéro de certificat stable, dérivé du cours et de la date de fin. */
export function numeroCertificat(coursId: string, termineLe: string): string {
  let h = 5381;
  for (const c of coursId + termineLe) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return `JNG-${h.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`;
}

function chargerImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resoudre, rejeter) => {
    const img = new Image();
    img.onload = () => resoudre(img);
    img.onerror = rejeter;
    img.src = src;
  });
}

/** Coupe un texte trop long sur plusieurs lignes centrées. */
function texteMultiligne(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, largeurMax: number, interligne: number) {
  const mots = texte.split(" ");
  const lignes: string[] = [];
  let ligne = "";
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeurMax && ligne) {
      lignes.push(ligne);
      ligne = mot;
    } else ligne = essai;
  }
  lignes.push(ligne);
  lignes.forEach((l, i) => ctx.fillText(l, x, y + i * interligne));
  return lignes.length;
}

export async function dessinerCertificat(d: DonneesCertificat): Promise<Blob> {
  const L = 1600;
  const H = 1130;
  const toile = document.createElement("canvas");
  toile.width = L;
  toile.height = H;
  const ctx = toile.getContext("2d")!;
  // Même police que l'interface (Figtree, servie par next/font).
  const police = getComputedStyle(document.body).fontFamily;
  await document.fonts.ready;

  // Fond crème et cadre
  ctx.fillStyle = "#fdf8ef";
  ctx.fillRect(0, 0, L, H);
  ctx.strokeStyle = "#0f305b";
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, L - 80, H - 80);
  ctx.strokeStyle = "#f6a04a";
  ctx.lineWidth = 2;
  ctx.strokeRect(62, 62, L - 124, H - 124);

  // Trois barres de couleur du logo
  const couleurs = ["#058453", "#fda917", "#e23e04"];
  couleurs.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(L / 2 - 150 + i * 105, H - 132, 90, 10);
  });

  const embleme = await chargerImage("/images/logo-embleme.png");
  ctx.drawImage(embleme, L / 2 - 75, 100, 150, 137);

  ctx.textAlign = "center";
  ctx.fillStyle = "#b85000";
  ctx.font = `800 30px ${police}`;
  ctx.letterSpacing = "8px";
  ctx.fillText("CERTIFICAT DE RÉUSSITE", L / 2, 300);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#55657d";
  ctx.font = `500 30px ${police}`;
  ctx.fillText("Décerné à", L / 2, 380);

  ctx.fillStyle = "#0a3054";
  ctx.font = `800 96px ${police}`;
  ctx.fillText(d.prenom, L / 2, 485);

  ctx.fillStyle = "#55657d";
  ctx.font = `500 30px ${police}`;
  ctx.fillText("pour avoir terminé avec succès le cours", L / 2, 565);

  ctx.fillStyle = "#0a3054";
  ctx.font = `800 54px ${police}`;
  const nbLignes = texteMultiligne(ctx, `« ${d.cours} »`, L / 2, 645, L - 360, 64);

  const yBas = 645 + nbLignes * 64 + 90;
  ctx.font = `600 28px ${police}`;
  ctx.fillStyle = "#0a3054";
  ctx.fillText(d.formateur, L / 2 - 330, yBas);
  ctx.fillText(d.date, L / 2 + 330, yBas);
  ctx.strokeStyle = "#d5dce6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L / 2 - 500, yBas - 46);
  ctx.lineTo(L / 2 - 160, yBas - 46);
  ctx.moveTo(L / 2 + 160, yBas - 46);
  ctx.lineTo(L / 2 + 500, yBas - 46);
  ctx.stroke();
  ctx.fillStyle = "#55657d";
  ctx.font = `500 24px ${police}`;
  ctx.fillText("Formateur·rice", L / 2 - 330, yBas + 38);
  ctx.fillText("Date d'obtention", L / 2 + 330, yBas + 38);

  ctx.font = `600 22px ${police}`;
  ctx.fillText(`Jàngal · Certificat n° ${d.numero}`, L / 2, H - 160);

  return new Promise((resoudre, rejeter) =>
    toile.toBlob((b) => (b ? resoudre(b) : rejeter(new Error("Export impossible"))), "image/png"),
  );
}
