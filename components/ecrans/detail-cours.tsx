"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleCheck,
  Clock,
  CloudDownload,
  FileText,
  HelpCircle,
  Lock,
  PlayCircle,
  Share2,
  SignalHigh,
  Star,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";
import {
  categorie,
  dureeTotale,
  estApercu,
  formaterDuree,
  formaterPrix,
  nombreLecons,
  toutesLecons,
  trouverCours,
  type Cours,
  type Lecon,
} from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { useAnnonce } from "@/components/annonce";
import { BarreProgression } from "@/components/cours-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { aCommence, estAchete, estTermine, formaterTaille, leconAReprendre, pourcentage } from "@/lib/progression";
import { leconsVideo, supprimerTelechargementsCours, tailleEstimeeMo, telechargerCours } from "@/lib/telechargements";
import { partager } from "@/lib/platform/share";
import { confirmer } from "@/lib/platform/dialog";
import { telechargementsDisponibles } from "@/lib/platform/downloads";
import { cn } from "@/lib/utils";

export function DetailCours({ coursId }: { coursId: string }) {
  const cours = trouverCours(coursId)!;
  const { progressions, achats, telechargements, enLigne } = useApp();
  const annoncer = useAnnonce();
  const router = useRouter();

  const progression = progressions[cours.id];
  const pct = pourcentage(cours, progression);
  const commence = aCommence(progression);
  const termine = estTermine(cours, progression);
  const achete = estAchete(cours, achats);
  const reprise = leconAReprendre(cours, progression);
  const premiere = toutesLecons(cours)[0];

  const partagerCours = async () => {
    const resultat = await partager({
      titre: cours.titre,
      texte: `Je te recommande « ${cours.titre} » de ${cours.formateur.nom} sur Jàngal.`,
      chemin: `/cours/${cours.id}/`,
    });
    if (resultat === "copie") annoncer("Lien copié dans le presse-papiers");
    if (resultat === "echec") annoncer("Partage impossible sur cet appareil", "erreur");
  };

  return (
    <main className="mx-auto w-full max-w-[640px] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      {/* Visuel + barre flottante */}
      <div className="relative aspect-[4/3] max-h-[340px] w-full overflow-hidden bg-muted sm:rounded-b-3xl">
        <Image src={cours.image} alt="" fill priority sizes="640px" className="object-cover" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="px-safe absolute inset-x-0 top-0 flex items-center justify-between pt-[calc(env(safe-area-inset-top)+0.5rem)]">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="grid size-11 place-items-center rounded-full bg-white/95 text-[#0f305b] shadow-md active:scale-95"
          >
            <ChevronLeft className="size-6" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={partagerCours}
            aria-label="Partager le cours"
            className="grid size-11 place-items-center rounded-full bg-white/95 text-[#0f305b] shadow-md active:scale-95"
          >
            <Share2 className="size-5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="px-safe relative -mt-6 rounded-t-[28px] bg-background pt-6">
        <p className="text-[13px] font-bold tracking-wide text-orange-texte uppercase">{categorie(cours.categorie).domaine}</p>
        <h1 className="mt-1.5 text-[26px] leading-tight font-extrabold text-marine">{cours.titre}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{cours.accroche}</p>

        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0f305b] text-[15px] font-bold text-white dark:bg-[#24365a]">
            {cours.formateur.nom
              .split(" ")
              .map((m) => m[0])
              .join("")}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-marine">{cours.formateur.nom}</span>
            <span className="block truncate text-[13px] text-muted-foreground">
              {cours.formateur.role} · {cours.formateur.ville}
            </span>
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-4 divide-x divide-border rounded-2xl bg-card py-3 text-center ombre-carte">
          <Stat icone={Clock} libelle="Durée" valeur={formaterDuree(dureeTotale(cours))} />
          <Stat icone={SignalHigh} libelle="Niveau" valeur={cours.niveau} />
          <Stat icone={BookOpen} libelle="Leçons" valeur={String(nombreLecons(cours))} />
          <Stat icone={Star} libelle="Note" valeur={cours.note.toLocaleString("fr-FR")} />
        </dl>

        {/* Prix et progression */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] text-muted-foreground">{cours.prix ? "Prix" : "Accès"}</p>
            <p className={cn("text-[22px] font-extrabold", cours.prix ? "text-marine" : "text-vert")}>
              {formaterPrix(cours.prix)}
            </p>
          </div>
          {cours.prix > 0 && achete && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-vert-doux px-3 py-1.5 text-[13px] font-semibold text-vert">
              <Check className="size-4" strokeWidth={3} /> Acheté
            </span>
          )}
          {cours.prix > 0 && !achete && <p className="text-right text-[13px] text-muted-foreground">Paiement unique,<br />accès à vie</p>}
        </div>

        {commence && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[14px]">
              <span className="font-semibold text-marine">Votre progression</span>
              <span className="font-bold text-orange-texte">{pct}%</span>
            </div>
            <BarreProgression valeur={pct} className="h-2" label="Progression du cours" />
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 space-y-3">
          {termine ? (
            <>
              <Link href={`/cours/${cours.id}/certificat/`} className={buttonVariants({ size: "cta" })}>
                <Award /> Voir mon certificat
              </Link>
              <Link
                href={`/cours/${cours.id}/lecon/${premiere.lecon.id}/`}
                className={buttonVariants({ size: "cta", variant: "outline" })}
              >
                Revoir le cours
              </Link>
            </>
          ) : !achete ? (
            <>
              <Link href={`/cours/${cours.id}/paiement/`} className={buttonVariants({ size: "cta", variant: "orange" })}>
                Acheter · {formaterPrix(cours.prix)}
              </Link>
              <Link
                href={`/cours/${cours.id}/lecon/${premiere.lecon.id}/`}
                className={buttonVariants({ size: "cta", variant: "outline" })}
              >
                <PlayCircle /> Voir l&apos;aperçu gratuit
              </Link>
            </>
          ) : (
            <Link href={`/cours/${cours.id}/lecon/${reprise.lecon.id}/`} className={buttonVariants({ size: "cta" })}>
              <PlayCircle /> {commence ? `Continuer · leçon ${reprise.numero}` : "Commencer le cours"}
            </Link>
          )}

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <BoutonTelechargement cours={cours} achete={achete} enLigne={enLigne} nbTelecharges={telechargements.filter((t) => t.coursId === cours.id).length} />
            <Button variant="outline" className="h-12 rounded-full px-5" onClick={partagerCours}>
              <Share2 /> Partager
            </Button>
          </div>
        </div>

        {/* À propos */}
        <section className="mt-8">
          <h2 className="text-[19px] font-bold text-marine">À propos du cours</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">{cours.description}</p>
          <h3 className="mt-5 text-[16px] font-bold text-marine">Ce que vous allez apprendre</h3>
          <ul className="mt-3 space-y-2.5">
            {cours.objectifs.map((o) => (
              <li key={o} className="flex gap-3 text-[15px] text-foreground/85">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-vert" aria-hidden="true" />
                {o}
              </li>
            ))}
          </ul>
        </section>

        <Programme cours={cours} achete={achete} prochaine={reprise.lecon.id} />
      </div>
    </main>
  );
}

function Stat({ icone: Icone, libelle, valeur }: { icone: typeof Clock; libelle: string; valeur: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1">
      <Icone className="size-5 text-orange" aria-hidden="true" />
      <dd className="text-[14px] leading-tight font-bold text-marine">{valeur}</dd>
      <dt className="text-[12px] text-muted-foreground">{libelle}</dt>
    </div>
  );
}

function BoutonTelechargement({
  cours,
  achete,
  enLigne,
  nbTelecharges,
}: {
  cours: Cours;
  achete: boolean;
  enLigne: boolean;
  nbTelecharges: number;
}) {
  const annoncer = useAnnonce();
  const [progression, setProgression] = useState<number | null>(null);
  const controleur = useRef<AbortController | null>(null);
  const total = leconsVideo(cours).length;
  const complet = total > 0 && nbTelecharges >= total;

  const lancer = async () => {
    if (!telechargementsDisponibles()) return annoncer("Le hors-ligne n'est pas disponible sur ce navigateur", "erreur");
    controleur.current = new AbortController();
    setProgression(0);
    try {
      await telechargerCours(cours, setProgression, controleur.current.signal);
      annoncer("Cours disponible hors ligne");
    } catch (e) {
      if ((e as Error).name !== "AbortError") annoncer("Téléchargement interrompu. Réessayez avec une meilleure connexion.", "erreur");
    } finally {
      setProgression(null);
    }
  };

  const supprimer = async () => {
    const ok = await confirmer({
      titre: "Supprimer les téléchargements ?",
      message: `Les vidéos de « ${cours.titre} » ne seront plus disponibles hors ligne. Votre progression est conservée.`,
      boutonOk: "Supprimer",
    });
    if (!ok) return;
    await supprimerTelechargementsCours(cours);
    annoncer("Téléchargements supprimés");
  };

  const base = "h-12 w-full rounded-full";

  if (progression !== null) {
    return (
      <Button variant="outline" className={cn(base, "relative overflow-hidden")} onClick={() => controleur.current?.abort()}>
        <span className="absolute inset-y-0 left-0 bg-orange-doux transition-[width]" style={{ width: `${progression * 100}%` }} />
        <span className="relative flex items-center gap-2">
          <X /> Annuler · {Math.round(progression * 100)} %
        </span>
      </Button>
    );
  }
  if (complet) {
    return (
      <Button variant="outline" className={cn(base, "text-vert")} onClick={supprimer}>
        <CircleCheck /> Hors ligne <Trash2 className="ml-1 text-muted-foreground" aria-label="Supprimer" />
      </Button>
    );
  }
  if (!achete) {
    return (
      <Button variant="outline" className={base} disabled>
        <Lock /> Hors ligne après achat
      </Button>
    );
  }
  if (!enLigne) {
    return (
      <Button variant="outline" className={base} disabled>
        <WifiOff /> Connexion requise
      </Button>
    );
  }
  return (
    <Button variant="outline" className={base} onClick={lancer}>
      <CloudDownload /> Télécharger · {formaterTaille(tailleEstimeeMo(cours) * 1024 * 1024)}
    </Button>
  );
}

const ICONE_TYPE: Record<Lecon["type"], typeof PlayCircle> = { video: PlayCircle, texte: FileText, quiz: HelpCircle };
const LIBELLE_TYPE: Record<Lecon["type"], string> = { video: "Vidéo", texte: "Lecture", quiz: "Quiz" };

function Programme({ cours, achete, prochaine }: { cours: Cours; achete: boolean; prochaine: string }) {
  const { progressions, telechargements } = useApp();
  const faites = new Set(progressions[cours.id]?.leconsTerminees ?? []);
  const hl = new Set(telechargements.filter((t) => t.coursId === cours.id).map((t) => t.leconId));
  const chapitreActif = cours.chapitres.findIndex((c) => c.lecons.some((l) => l.id === prochaine));
  const [ouverts, setOuverts] = useState<Set<number>>(() => new Set([Math.max(0, chapitreActif)]));
  let numero = 0;

  return (
    <section className="mt-8" aria-labelledby="titre-programme">
      <h2 id="titre-programme" className="text-[19px] font-bold text-marine">
        Programme
      </h2>
      <p className="mt-1 text-[14px] text-muted-foreground">
        {cours.chapitres.length} chapitres · {nombreLecons(cours)} leçons · {formaterDuree(dureeTotale(cours))}
      </p>

      <div className="mt-4 space-y-3">
        {cours.chapitres.map((chapitre, i) => {
          const ouvert = ouverts.has(i);
          const faitesChapitre = chapitre.lecons.filter((l) => faites.has(l.id)).length;
          return (
            <div key={chapitre.id} className="overflow-hidden rounded-2xl bg-card ombre-carte">
              <button
                type="button"
                aria-expanded={ouvert}
                onClick={() =>
                  setOuverts((s) => {
                    const n = new Set(s);
                    if (n.has(i)) n.delete(i);
                    else n.add(i);
                    return n;
                  })
                }
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-[15px] font-bold",
                    faitesChapitre === chapitre.lecons.length ? "bg-vert-doux text-vert" : "bg-orange-doux text-orange-texte",
                  )}
                >
                  {faitesChapitre === chapitre.lecons.length ? <Check className="size-5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-marine">{chapitre.titre}</span>
                  <span className="block text-[13px] text-muted-foreground">
                    {faitesChapitre}/{chapitre.lecons.length} leçons terminées
                  </span>
                </span>
                <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", ouvert && "rotate-180")} />
              </button>

              <ol className={cn("border-t border-border", !ouvert && "hidden")}>
                {chapitre.lecons.map((lecon) => {
                  numero++;
                  const Icone = ICONE_TYPE[lecon.type];
                  const fait = faites.has(lecon.id);
                  const verrou = !achete && !estApercu(cours, lecon.id);
                  return (
                    <li key={lecon.id}>
                      <Link
                        href={`/cours/${cours.id}/lecon/${lecon.id}/`}
                        className={cn(
                          "flex min-h-[60px] items-center gap-3 px-4 py-2.5 active:bg-muted",
                          lecon.id === prochaine && !fait && "bg-orange-doux/60",
                        )}
                      >
                        <Icone
                          className={cn("size-6 shrink-0", fait ? "text-vert" : "text-muted-foreground")}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] leading-snug font-medium text-marine">
                            {numero}. {lecon.titre}
                          </span>
                          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                            {LIBELLE_TYPE[lecon.type]} · {lecon.duree} min
                            {!achete && estApercu(cours, lecon.id) && (
                              <span className="font-semibold text-vert">· Aperçu gratuit</span>
                            )}
                            {hl.has(lecon.id) && (
                              <CloudDownload className="size-3.5 text-vert" aria-label="Téléchargée" />
                            )}
                          </span>
                        </span>
                        {fait ? (
                          <CircleCheck className="size-5 shrink-0 text-vert" aria-label="Terminée" />
                        ) : verrou ? (
                          <Lock className="size-4.5 shrink-0 text-muted-foreground" aria-label="Verrouillée" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
