"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleCheck, CloudDownload, Lightbulb, Lock, NotebookPen, WifiOff } from "lucide-react";
import {
  estApercu,
  formaterPrix,
  nombreLecons,
  toutesLecons,
  trouverCours,
  type BlocTexte,
  type Cours,
  type LeconTexte,
  type LeconVideo,
} from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { useAnnonce } from "@/components/annonce";
import { EnTete } from "@/components/en-tete";
import { Quiz, SEUIL_REUSSITE } from "@/components/quiz";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as storage from "@/lib/storage";
import { estAchete } from "@/lib/progression";
import { urlLocaleLecon } from "@/lib/telechargements";
import { liberer } from "@/lib/platform/downloads";
import { cn } from "@/lib/utils";

export function LecteurLecon({ coursId, leconId }: { coursId: string; leconId: string }) {
  const cours = trouverCours(coursId)!;
  const router = useRouter();
  const annoncer = useAnnonce();
  const { progressions, achats } = useApp();

  const lecons = toutesLecons(cours);
  const position = lecons.findIndex((l) => l.lecon.id === leconId);
  const { lecon, chapitre, numeroChapitre, numero } = lecons[position];
  const precedente = lecons[position - 1];
  const suivante = lecons[position + 1];
  const total = nombreLecons(cours);

  const accessible = estAchete(cours, achats) || estApercu(cours, lecon.id);
  const terminee = progressions[cours.id]?.leconsTerminees.includes(lecon.id) ?? false;
  const [meilleurScore, setMeilleurScore] = useState<number>();

  useEffect(() => {
    if (!accessible) return;
    storage.definirDerniereLecon(cours.id, lecon.id);
    if (lecon.type === "quiz") storage.lireResultatQuiz(cours.id, lecon.id).then((r) => setMeilleurScore(r?.meilleurScore));
  }, [accessible, cours.id, lecon.id, lecon.type]);

  const terminer = async () => {
    await storage.marquerLeconTerminee(cours.id, lecon.id, total);
    const faites = new Set([...(progressions[cours.id]?.leconsTerminees ?? []), lecon.id]);
    if (faites.size >= total) {
      annoncer("Cours terminé ! Votre certificat est prêt");
      router.push(`/cours/${cours.id}/certificat/`);
    } else {
      annoncer("Leçon terminée");
    }
  };

  const allerSuivante = () =>
    suivante ? router.push(`/cours/${cours.id}/lecon/${suivante.lecon.id}/`) : router.push(`/cours/${cours.id}/`);

  return (
    <div className="min-h-dvh">
      <EnTete retour={`/cours/${cours.id}/`} titre={cours.titre} sousTitre={`Leçon ${numero} sur ${total}`} />

      <main className="px-safe mx-auto w-full max-w-[640px] pt-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <p className="text-[13px] font-bold tracking-wide text-orange-texte uppercase">
          Chapitre {numeroChapitre} · {chapitre.titre}
        </p>
        <h2 className="mt-1.5 text-[24px] leading-tight font-extrabold text-marine">{lecon.titre}</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {lecon.type === "video" ? "Vidéo" : lecon.type === "texte" ? "Lecture" : `Quiz · ${lecon.type === "quiz" ? lecon.questions.length : 0} questions`} ·{" "}
          {lecon.duree} min
          {terminee && <span className="ml-1.5 font-semibold text-vert">· Terminée</span>}
        </p>

        <div className="mt-5">
          {!accessible ? (
            <LeconVerrouillee cours={cours} />
          ) : lecon.type === "video" ? (
            <LecteurVideo cours={cours} lecon={lecon} />
          ) : lecon.type === "texte" ? (
            <ContenuTexte lecon={lecon} />
          ) : (
            <Quiz
              lecon={lecon}
              meilleurScore={meilleurScore}
              onContinuer={allerSuivante}
              onTermine={async (score, nb) => {
                const r = await storage.enregistrerResultatQuiz(cours.id, lecon.id, score, nb);
                setMeilleurScore(r.meilleurScore);
                if (score / nb >= SEUIL_REUSSITE && !terminee) await terminer();
              }}
            />
          )}
        </div>

        {accessible && lecon.type !== "quiz" && (
          <Button
            size="cta"
            variant={terminee ? "outline" : "orange"}
            className={cn("mt-6", terminee && "text-vert disabled:opacity-100")}
            disabled={terminee}
            onClick={terminer}
          >
            {terminee ? (
              <>
                <CircleCheck /> Leçon terminée
              </>
            ) : (
              <>
                <Check /> Marquer comme terminée
              </>
            )}
          </Button>
        )}

        <nav className="mt-4 grid grid-cols-2 gap-3" aria-label="Navigation entre les leçons">
          {precedente ? (
            <Link
              href={`/cours/${cours.id}/lecon/${precedente.lecon.id}/`}
              className={buttonVariants({ variant: "outline", className: "h-12 rounded-full" })}
            >
              <ArrowLeft /> Précédente
            </Link>
          ) : (
            <span />
          )}
          {suivante ? (
            <Link
              href={`/cours/${cours.id}/lecon/${suivante.lecon.id}/`}
              className={buttonVariants({ className: "h-12 rounded-full" })}
            >
              Suivante <ArrowRight />
            </Link>
          ) : (
            <Link href={`/cours/${cours.id}/`} className={buttonVariants({ className: "h-12 rounded-full" })}>
              Fin du cours <ArrowRight />
            </Link>
          )}
        </nav>

        {accessible && <Notes coursId={cours.id} leconId={lecon.id} />}
      </main>
    </div>
  );
}

function LecteurVideo({ cours, lecon }: { cours: Cours; lecon: LeconVideo }) {
  const { enLigne, telechargements } = useApp();
  const telechargee = telechargements.some((t) => t.coursId === cours.id && t.leconId === lecon.id);
  const [local, setLocal] = useState<{ url: string | null; pret: boolean }>({ url: null, pret: !telechargee });

  useEffect(() => {
    if (!telechargee) return;
    let url: string | null = null;
    let actif = true;
    urlLocaleLecon(cours.id, lecon.id).then((u) => {
      url = u;
      if (actif) setLocal({ url: u, pret: true });
      else if (u) liberer(u);
    });
    return () => {
      actif = false;
      if (url) liberer(url);
    };
  }, [telechargee, cours.id, lecon.id]);

  const source = local.url ?? (enLigne ? lecon.videoUrl : null);

  return (
    <div>
      {!local.pret ? (
        <div className="aspect-video w-full animate-pulse rounded-2xl bg-muted" />
      ) : source ? (
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video
            key={source}
            src={source}
            controls
            playsInline
            preload="metadata"
            poster={cours.image}
            className="aspect-video w-full"
            controlsList="nodownload"
          >
            Votre appareil ne peut pas lire cette vidéo.
          </video>
          {local.url && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[12px] font-semibold text-white">
              <CloudDownload className="size-3.5" /> Hors ligne
            </span>
          )}
        </div>
      ) : (
        <div role="alert" className="flex flex-col items-center rounded-2xl border-[1.5px] border-dashed border-orange-bord bg-orange-doux px-6 py-8 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-card text-orange-texte">
            <WifiOff className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 text-[17px] font-bold text-marine">Vous êtes hors ligne</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">
            Cette vidéo n&apos;a pas été téléchargée. Reconnectez-vous pour la regarder, ou téléchargez le cours la
            prochaine fois que vous aurez du réseau.
          </p>
          <p className="mt-3 text-[14px] text-muted-foreground">Les leçons de lecture et les quiz restent disponibles.</p>
        </div>
      )}
      <p className="mt-4 text-[16px] leading-relaxed text-foreground/85">{lecon.resume}</p>
    </div>
  );
}

function ContenuTexte({ lecon }: { lecon: LeconTexte }) {
  return (
    <article className="space-y-4 text-[16px] leading-relaxed text-foreground/90">
      {lecon.contenu.map((bloc, i) => (
        <Bloc key={i} bloc={bloc} />
      ))}
    </article>
  );
}

/** Rendu des `code` inline écrits entre accents graves. */
function TexteRiche({ texte }: { texte: string }) {
  return (
    <>
      {texte.split(/(`[^`]+`)/).map((morceau, i) =>
        morceau.startsWith("`") ? (
          <code key={i} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-marine">
            {morceau.slice(1, -1)}
          </code>
        ) : (
          morceau
        ),
      )}
    </>
  );
}

function Bloc({ bloc }: { bloc: BlocTexte }) {
  switch (bloc.type) {
    case "titre":
      return <h3 className="pt-2 text-[19px] font-bold text-marine">{bloc.texte}</h3>;
    case "paragraphe":
      return (
        <p>
          <TexteRiche texte={bloc.texte} />
        </p>
      );
    case "liste":
      return (
        <ul className="space-y-2">
          {bloc.elements.map((e) => (
            <li key={e} className="flex gap-3">
              <span className="mt-[0.6em] size-2 shrink-0 rounded-full bg-orange" aria-hidden="true" />
              <span>
                <TexteRiche texte={e} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <figure className="overflow-hidden rounded-2xl bg-[#0d1b33] dark:bg-[#07101f]">
          <figcaption className="border-b border-white/10 px-4 py-2 font-mono text-[12px] text-[#9fb3d1] uppercase">
            {bloc.langage}
          </figcaption>
          <pre className="overflow-x-auto p-4 font-mono text-[14px] leading-relaxed text-[#e8eef8]">
            <code>{bloc.code}</code>
          </pre>
        </figure>
      );
    case "astuce":
      return (
        <aside className="flex gap-3 rounded-2xl border-l-4 border-orange bg-orange-doux p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-orange-texte" aria-hidden="true" />
          <p className="text-[15px]">
            <span className="font-bold text-marine">Astuce · </span>
            <TexteRiche texte={bloc.texte} />
          </p>
        </aside>
      );
  }
}

function LeconVerrouillee({ cours }: { cours: Cours }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-8 text-center ombre-carte">
      <span className="grid size-14 place-items-center rounded-full bg-orange-doux text-orange-texte">
        <Lock className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 text-[17px] font-bold text-marine">Leçon réservée aux inscrits</p>
      <p className="mt-1.5 text-[15px] text-muted-foreground">
        Débloquez les {nombreLecons(cours)} leçons, le quiz et le certificat pour {formaterPrix(cours.prix)}.
      </p>
      <Link href={`/cours/${cours.id}/paiement/`} className={buttonVariants({ size: "cta", variant: "orange", className: "mt-5" })}>
        Débloquer le cours
      </Link>
    </div>
  );
}

function Notes({ coursId, leconId }: { coursId: string; leconId: string }) {
  const [texte, setTexte] = useState("");
  const [etat, setEtat] = useState<"charge" | "pret" | "modifie" | "enregistre">("charge");
  const minuteur = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enAttente = useRef<string | null>(null);

  useEffect(() => {
    storage.lireNote(coursId, leconId).then((n) => {
      setTexte(n);
      setEtat("pret");
    });
    // En quittant la leçon, on enregistre la saisie pas encore sauvegardée.
    return () => {
      clearTimeout(minuteur.current);
      if (enAttente.current !== null) storage.enregistrerNote(coursId, leconId, enAttente.current);
    };
  }, [coursId, leconId]);

  const modifier = (valeur: string) => {
    setTexte(valeur);
    setEtat("modifie");
    enAttente.current = valeur;
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(async () => {
      enAttente.current = null;
      await storage.enregistrerNote(coursId, leconId, valeur);
      setEtat("enregistre");
    }, 600);
  };

  return (
    <section className="mt-8" aria-labelledby="titre-notes">
      <div className="mb-2 flex items-center justify-between">
        <h3 id="titre-notes" className="flex items-center gap-2 text-[17px] font-bold text-marine">
          <NotebookPen className="size-5 text-orange" aria-hidden="true" /> Mes notes
        </h3>
        <span className="text-[13px] text-muted-foreground" aria-live="polite">
          {etat === "modifie" ? "Enregistrement…" : etat === "enregistre" ? "Enregistré sur l'appareil" : ""}
        </span>
      </div>
      <Textarea
        value={texte}
        disabled={etat === "charge"}
        onChange={(e) => modifier(e.target.value)}
        placeholder="Notez ici ce que vous retenez de cette leçon…"
        className="min-h-32 rounded-2xl bg-card p-4 text-base"
        aria-labelledby="titre-notes"
      />
    </section>
  );
}
