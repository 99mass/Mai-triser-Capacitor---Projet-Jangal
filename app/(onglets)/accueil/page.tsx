"use client";

import Link from "next/link";
import { Bell, Check, CircleCheck, Play } from "lucide-react";
import { COURS, coursRecommandes, nombreLecons, type Cours } from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { BarreProgression, CarteCours, VignetteCours } from "@/components/cours-ui";
import { IconeCible } from "@/components/icones";
import {
  aCommence,
  estTermine,
  JOURS_COURTS,
  leconAReprendre,
  leconsCetteSemaine,
  pourcentage,
  semaineActive,
  serieJours,
} from "@/lib/progression";
import { cn } from "@/lib/utils";

export default function Accueil() {
  const { profil, progressions, activite, preferences } = useApp();
  if (!profil) return null;

  // Cours à reprendre : le plus récemment ouvert parmi ceux qui ne sont pas terminés.
  const enCours = COURS.filter((c) => aCommence(progressions[c.id]) && !estTermine(c, progressions[c.id])).sort(
    (a, b) =>
      (progressions[b.id]?.derniereVisite ?? "").localeCompare(progressions[a.id]?.derniereVisite ?? ""),
  );
  const recommandes = coursRecommandes(profil.interets);
  const aReprendre = enCours[0];

  const serie = serieJours(activite);
  const semaine = semaineActive(activite);
  const faitesSemaine = leconsCetteSemaine(activite);
  const objectif = profil.objectifHebdo;

  return (
    <main className="mx-auto w-full max-w-[640px]">
      <header className="px-safe flex items-start justify-between gap-3 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <div className="min-w-0">
          <h1 className="truncate text-[26px] font-extrabold text-marine">
            Bonjour {profil.prenom} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-0.5 text-[15px] text-muted-foreground">Continuez votre apprentissage</p>
        </div>
        <Link
          href="/profil/#rappel"
          aria-label={preferences.rappelActif ? "Rappel quotidien activé" : "Activer le rappel quotidien"}
          className="relative -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-marine active:bg-muted"
        >
          <Bell className="size-6" strokeWidth={1.9} />
          {!preferences.rappelActif && (
            <span className="absolute top-2 right-2.5 size-2.5 rounded-full bg-orange ring-2 ring-background" />
          )}
        </Link>
      </header>

      <div className="px-safe mt-5 space-y-7">
        {aReprendre ? (
          <CarteReprendre cours={aReprendre} />
        ) : (
          <CarteReprendre cours={recommandes[0]} nouveau />
        )}

        <section aria-labelledby="titre-serie">
          <h2 id="titre-serie" className="mb-3 text-[19px] font-bold text-marine">
            Série d&apos;apprentissage
          </h2>
          <div className="ombre-carte rounded-2xl bg-card p-4">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-marine">
              <CircleCheck className="size-5 text-orange" strokeWidth={2.4} aria-hidden="true" />
              {serie > 0 ? (
                <>
                  {serie} jour{serie > 1 ? "s" : ""} consécutif{serie > 1 ? "s" : ""} <span aria-hidden="true">🔥</span>
                </>
              ) : (
                "Terminez une leçon pour lancer votre série"
              )}
            </p>
            <ol className="mt-4 grid grid-cols-7 gap-1 text-center">
              {semaine.map((jour, i) => (
                <li key={JOURS_COURTS[i]} className="flex flex-col items-center gap-2">
                  <span className={cn("text-[13px] text-muted-foreground", jour.estAujourdhui && "font-bold text-marine")}>
                    {JOURS_COURTS[i]}
                  </span>
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full",
                      jour.actif ? "bg-orange text-white" : "bg-piste text-muted-foreground/40",
                      jour.estAujourdhui && !jour.actif && "ring-2 ring-orange-bord ring-offset-2 ring-offset-card",
                    )}
                  >
                    <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                    <span className="sr-only">{jour.actif ? "actif" : "inactif"}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="ombre-carte flex items-center gap-4 rounded-2xl bg-card p-4" aria-label="Objectif hebdomadaire">
          <IconeCible className="size-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-marine">Objectif hebdomadaire</p>
            <p className="mt-0.5 text-[15px] font-bold text-marine">
              {Math.min(faitesSemaine, objectif)} sur {objectif} leçons
              {faitesSemaine >= objectif && <span className="ml-1.5 font-semibold text-vert">· atteint&nbsp;!</span>}
            </p>
            <BarreProgression
              valeur={Math.min(100, (faitesSemaine / objectif) * 100)}
              className="mt-3 h-2"
              label="Progression de l'objectif hebdomadaire"
            />
          </div>
        </section>

        <section aria-labelledby="titre-reco">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="titre-reco" className="text-[19px] font-bold text-marine">
              Cours recommandés
            </h2>
            <Link href="/catalogue/" className="-mr-2 flex min-h-11 items-center px-2 text-[15px] font-medium text-lien">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {recommandes
              .filter((c) => c.id !== aReprendre?.id)
              .slice(0, 4)
              .map((c) => (
                <CarteCours key={c.id} cours={c} />
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function CarteReprendre({ cours, nouveau }: { cours: Cours; nouveau?: boolean }) {
  const { progressions } = useApp();
  const progression = progressions[cours.id];
  const { lecon, numero } = leconAReprendre(cours, progression);
  const pct = pourcentage(cours, progression);
  const lien = `/cours/${cours.id}/lecon/${lecon.id}/`;

  return (
    <Link
      href={nouveau ? `/cours/${cours.id}/` : lien}
      className="ombre-carte flex items-stretch gap-4 rounded-2xl bg-card p-3.5 transition-transform active:scale-[0.99]"
    >
      <VignetteCours cours={cours} className="h-[96px] w-[84px] shrink-0" priority />
      <span className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <span className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-semibold text-marine">{nouveau ? "Pour bien démarrer" : "Reprendre"}</span>
          {!nouveau && (
            <span className="rounded-lg border border-vert-bord px-2 py-0.5 text-[13px] font-semibold text-vert">
              {pct}%
            </span>
          )}
        </span>
        <span className="flex items-end justify-between gap-2">
          <span className="min-w-0">
            <span className="line-clamp-2 text-[16px] leading-snug font-bold text-marine">{cours.titre}</span>
            <span className="mt-0.5 block text-[14px] text-muted-foreground">
              {nouveau ? "Découvrir le cours" : `Leçon ${numero} sur ${nombreLecons(cours)}`}
            </span>
          </span>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange text-white shadow-[0_6px_16px_-6px] shadow-orange/70">
            <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
            <span className="sr-only">Ouvrir</span>
          </span>
        </span>
      </span>
    </Link>
  );
}
