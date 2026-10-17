"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2, Lock, Share2 } from "lucide-react";
import { trouverCours } from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { useAnnonce } from "@/components/annonce";
import { EnTete } from "@/components/en-tete";
import { LogoEmbleme } from "@/components/logo";
import { BarreProgression } from "@/components/cours-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { dessinerCertificat, numeroCertificat, type DonneesCertificat } from "@/lib/certificat";
import { estTermine, formaterDate, pourcentage } from "@/lib/progression";
import { exporterImage } from "@/lib/platform/files";
import { partager } from "@/lib/platform/share";

export function Certificat({ coursId }: { coursId: string }) {
  const cours = trouverCours(coursId)!;
  const { profil, progressions } = useApp();
  const annoncer = useAnnonce();
  const [action, setAction] = useState<"export" | "partage" | null>(null);

  const progression = progressions[cours.id];
  const termine = estTermine(cours, progression);
  const termineLe = progression?.termineLe ?? new Date().toISOString();

  const donnees: DonneesCertificat = {
    prenom: profil?.prenom ?? "",
    cours: cours.titre,
    formateur: cours.formateur.nom,
    date: formaterDate(termineLe),
    numero: numeroCertificat(cours.id, termineLe),
  };
  const nomFichier = `certificat-jangal-${cours.id}.png`;

  const exporter = async () => {
    setAction("export");
    try {
      await exporterImage(await dessinerCertificat(donnees), nomFichier);
      annoncer("Certificat enregistré en image");
    } catch {
      annoncer("Export impossible sur cet appareil", "erreur");
    } finally {
      setAction(null);
    }
  };

  const partagerCertificat = async () => {
    setAction("partage");
    try {
      const resultat = await partager({
        titre: `Mon certificat Jàngal – ${cours.titre}`,
        texte: `J'ai terminé le cours « ${cours.titre} » sur Jàngal ! 🎓`,
        chemin: `/cours/${cours.id}/`,
        fichier: { donnees: await dessinerCertificat(donnees), nom: nomFichier },
      });
      if (resultat === "copie") annoncer("Message copié dans le presse-papiers");
      if (resultat === "echec") annoncer("Partage impossible sur cet appareil", "erreur");
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="min-h-dvh">
      <EnTete retour={`/cours/${cours.id}/`} titre="Certificat" />
      <main className="px-safe mx-auto w-full max-w-[640px] pt-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        {!termine ? (
          <div className="flex flex-col items-center rounded-3xl bg-card px-6 py-10 text-center ombre-carte">
            <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <Lock className="size-8" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-[20px] font-extrabold text-marine">Certificat pas encore disponible</h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Terminez toutes les leçons de « {cours.titre} » pour obtenir votre certificat.
            </p>
            <BarreProgression valeur={pourcentage(cours, progression)} className="mt-5 h-2 max-w-xs" label="Progression du cours" />
            <p className="mt-2 text-[14px] font-semibold text-orange-texte">{pourcentage(cours, progression)} % terminé</p>
            <Link href={`/cours/${cours.id}/`} className={buttonVariants({ size: "cta", className: "mt-6" })}>
              Continuer le cours
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-center text-[24px] font-extrabold text-marine">Félicitations {profil?.prenom}&nbsp;! 🎉</h1>
            <p className="mt-1 text-center text-[15px] text-muted-foreground">Votre certificat est prêt à être partagé.</p>

            {/* Aperçu (même mise en page que le PNG exporté) */}
            <figure
              aria-label="Certificat de réussite"
              className="relative mt-6 overflow-hidden rounded-2xl border-[3px] border-[#0f305b] bg-[#fdf8ef] p-1.5 text-center shadow-xl"
            >
              <div className="rounded-xl border border-[#f6a04a] px-5 py-7">
                <LogoEmbleme className="mx-auto w-16 dark:drop-shadow-none" />
                <p className="mt-3 text-[12px] font-extrabold tracking-[0.25em] text-[#b85000]">CERTIFICAT DE RÉUSSITE</p>
                <p className="mt-4 text-[13px] text-[#55657d]">Décerné à</p>
                <p className="mt-1 text-[34px] leading-tight font-extrabold break-words text-[#0a3054]">{donnees.prenom}</p>
                <p className="mt-3 text-[13px] text-[#55657d]">pour avoir terminé avec succès le cours</p>
                <p className="mt-1 text-[19px] leading-snug font-extrabold text-[#0a3054]">« {cours.titre} »</p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-[12px]">
                  <div className="border-t border-[#d5dce6] pt-2">
                    <p className="font-semibold text-[#0a3054]">{donnees.formateur}</p>
                    <p className="text-[#55657d]">Formateur·rice</p>
                  </div>
                  <div className="border-t border-[#d5dce6] pt-2">
                    <p className="font-semibold text-[#0a3054]">{donnees.date}</p>
                    <p className="text-[#55657d]">Date d&apos;obtention</p>
                  </div>
                </div>
                <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
                  <span className="h-1 w-8 rounded-full bg-[#058453]" />
                  <span className="h-1 w-8 rounded-full bg-[#fda917]" />
                  <span className="h-1 w-8 rounded-full bg-[#e23e04]" />
                </div>
                <p className="mt-3 text-[11px] text-[#55657d]">Certificat n° {donnees.numero}</p>
              </div>
            </figure>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button size="cta" variant="outline" onClick={exporter} disabled={action !== null}>
                {action === "export" ? <Loader2 className="animate-spin" /> : <Download />} Exporter
              </Button>
              <Button size="cta" onClick={partagerCertificat} disabled={action !== null}>
                {action === "partage" ? <Loader2 className="animate-spin" /> : <Share2 />} Partager
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
