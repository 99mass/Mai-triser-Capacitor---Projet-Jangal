"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, CloudDownload, HardDrive, Trash2 } from "lucide-react";
import { COURS, nombreLecons, type Cours } from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { useAnnonce } from "@/components/annonce";
import { BarreProgression, VignetteCours } from "@/components/cours-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { aCommence, estTermine, formaterDate, formaterTaille, leconAReprendre, pourcentage } from "@/lib/progression";
import { leconsVideo, supprimerTelechargementsCours } from "@/lib/telechargements";
import { espaceUtilise } from "@/lib/platform/downloads";
import { confirmer } from "@/lib/platform/dialog";

export default function MesCours() {
  const { progressions } = useApp();
  const enCours = COURS.filter((c) => aCommence(progressions[c.id]) && !estTermine(c, progressions[c.id]));
  const termines = COURS.filter((c) => estTermine(c, progressions[c.id]));

  return (
    <main className="mx-auto w-full max-w-[640px]">
      <header className="px-safe pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <h1 className="text-[26px] font-extrabold text-marine">Mes cours</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Suivez votre progression et vos téléchargements</p>
      </header>

      <Tabs defaultValue="en-cours" className="px-safe mt-5 gap-5">
        <TabsList className="w-full rounded-2xl bg-muted p-1 group-data-horizontal/tabs:h-12">
          <TabsTrigger value="en-cours" className="rounded-xl text-[15px] data-active:text-marine">
            En cours
          </TabsTrigger>
          <TabsTrigger value="termines" className="rounded-xl text-[15px] data-active:text-marine">
            Terminés
          </TabsTrigger>
          <TabsTrigger value="telecharges" className="rounded-xl text-[15px] data-active:text-marine">
            Téléchargés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="en-cours" className="space-y-3">
          {enCours.length ? (
            enCours.map((c) => <CarteEnCours key={c.id} cours={c} />)
          ) : (
            <Vide
              icone={BookOpen}
              titre="Aucun cours en cours"
              texte="Choisissez un cours dans le catalogue pour commencer à apprendre."
            />
          )}
        </TabsContent>

        <TabsContent value="termines" className="space-y-3">
          {termines.length ? (
            termines.map((c) => (
              <div key={c.id} className="flex gap-3.5 rounded-2xl bg-card p-3 ombre-carte">
                <VignetteCours cours={c} className="size-[72px] shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link href={`/cours/${c.id}/`} className="line-clamp-2 text-[15px] leading-snug font-bold text-marine">
                    {c.titre}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    Terminé le {formaterDate(progressions[c.id]?.termineLe ?? new Date().toISOString())}
                  </p>
                  <Link
                    href={`/cours/${c.id}/certificat/`}
                    className="mt-1 -ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-[14px] font-semibold text-orange-texte"
                  >
                    <Award className="size-4.5" /> Voir le certificat
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <Vide icone={Award} titre="Pas encore de cours terminé" texte="Terminez toutes les leçons d'un cours pour obtenir votre certificat." />
          )}
        </TabsContent>

        <TabsContent value="telecharges">
          <Telecharges />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function CarteEnCours({ cours }: { cours: Cours }) {
  const { progressions } = useApp();
  const pct = pourcentage(cours, progressions[cours.id]);
  const { lecon, numero } = leconAReprendre(cours, progressions[cours.id]);
  return (
    <Link
      href={`/cours/${cours.id}/lecon/${lecon.id}/`}
      className="flex gap-3.5 rounded-2xl bg-card p-3 ombre-carte active:scale-[0.99]"
    >
      <VignetteCours cours={cours} className="size-[80px] shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="line-clamp-2 text-[15px] leading-snug font-bold text-marine">{cours.titre}</span>
        <span className="mt-0.5 truncate text-[13px] text-muted-foreground">
          Leçon {numero} sur {nombreLecons(cours)} · {lecon.titre}
        </span>
        <span className="mt-auto flex items-center gap-3 pt-2">
          <BarreProgression valeur={pct} className="h-2" label={`Progression de ${cours.titre}`} />
          <span className="text-[13px] font-bold text-orange-texte">{pct}%</span>
        </span>
      </span>
    </Link>
  );
}

function Telecharges() {
  const { telechargements } = useApp();
  const annoncer = useAnnonce();
  const [espace, setEspace] = useState<number | null>(null);

  useEffect(() => {
    espaceUtilise().then(setEspace);
  }, [telechargements]);

  const parCours = COURS.map((c) => ({
    cours: c,
    lecons: telechargements.filter((t) => t.coursId === c.id),
  })).filter((x) => x.lecons.length > 0);

  const supprimer = async (cours: Cours) => {
    const ok = await confirmer({
      titre: "Supprimer les téléchargements ?",
      message: `Les vidéos de « ${cours.titre} » ne seront plus disponibles hors ligne. Votre progression et vos notes sont conservées.`,
      boutonOk: "Supprimer",
    });
    if (!ok) return;
    await supprimerTelechargementsCours(cours);
    annoncer("Téléchargements supprimés");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ombre-carte">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange-doux text-orange-texte">
          <HardDrive className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[13px] text-muted-foreground">Espace utilisé par les vidéos</p>
          <p className="text-[20px] font-extrabold text-marine">{espace === null ? "…" : formaterTaille(espace)}</p>
          <p className="text-[13px] text-muted-foreground">
            {telechargements.length} vidéo{telechargements.length > 1 ? "s" : ""} disponible{telechargements.length > 1 ? "s" : ""} hors ligne
          </p>
        </div>
      </div>

      {parCours.length ? (
        parCours.map(({ cours, lecons }) => (
          <div key={cours.id} className="flex items-center gap-3.5 rounded-2xl bg-card p-3 ombre-carte">
            <VignetteCours cours={cours} className="size-16 shrink-0" />
            <Link href={`/cours/${cours.id}/`} className="min-w-0 flex-1">
              <span className="line-clamp-2 text-[15px] leading-snug font-bold text-marine">{cours.titre}</span>
              <span className="mt-0.5 block text-[13px] text-muted-foreground">
                {lecons.length}/{leconsVideo(cours).length} vidéos · {formaterTaille(lecons.reduce((s, l) => s + l.taille, 0))}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => supprimer(cours)}
              aria-label={`Supprimer les téléchargements de ${cours.titre}`}
              className="grid size-11 shrink-0 place-items-center rounded-full text-destructive active:bg-destructive/10"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        ))
      ) : (
        <Vide
          icone={CloudDownload}
          titre="Aucun téléchargement"
          texte="Sur la page d'un cours, touchez « Télécharger » pour regarder les vidéos sans connexion."
        />
      )}
    </div>
  );
}

function Vide({ icone: Icone, titre, texte }: { icone: typeof BookOpen; titre: string; texte: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-input px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-orange-doux text-orange-texte">
        <Icone className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 font-bold text-marine">{titre}</p>
      <p className="mt-1 text-[15px] text-muted-foreground">{texte}</p>
      <Link href="/catalogue/" className={buttonVariants({ className: "mt-5 h-12 rounded-full px-6" })}>
        Explorer le catalogue
      </Link>
    </div>
  );
}
