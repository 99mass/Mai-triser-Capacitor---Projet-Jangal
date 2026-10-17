"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronLeft, UserRound } from "lucide-react";
import { CATEGORIES, type CategorieId } from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { LogoCompact, LogoEmbleme, LogoTexte } from "@/components/logo";
import { IconeCategorie } from "@/components/icones";
import { Chargement } from "@/components/etats";
import { Button } from "@/components/ui/button";
import { enregistrerProfil } from "@/lib/storage";
import { cn } from "@/lib/utils";

type Etape = 0 | 1 | 2 | 3;

export default function Onboarding() {
  const { pret, profil } = useApp();
  const router = useRouter();
  const [etape, setEtape] = useState<Etape>(0);
  const [interets, setInterets] = useState<CategorieId[]>([]);
  const [prenom, setPrenom] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const verifie = useRef(false);

  // Profil déjà créé : on va directement à l'accueil (vérifié une seule fois).
  useEffect(() => {
    if (!pret || verifie.current) return;
    verifie.current = true;
    if (profil) router.replace("/accueil/");
  }, [pret, profil, router]);

  if (!pret || (profil && etape < 3)) return <Chargement />;

  const basculer = (id: CategorieId) =>
    setInterets((liste) => (liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]));

  const terminer = async () => {
    const nom = prenom.trim();
    if (!nom) return;
    setEnregistrement(true);
    await enregistrerProfil({ prenom: nom, interets, objectifHebdo: 5, creeLe: new Date().toISOString() });
    setEtape(3);
    setEnregistrement(false);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col bg-background">
      {etape === 0 && <Presentation onSuivant={() => setEtape(1)} />}

      {etape === 1 && (
        <EcranEtape numero={2} onRetour={() => setEtape(0)} logo>
          <h1 className="text-[clamp(21px,6vw,28px)] leading-tight font-extrabold text-marine">Quels sont vos centres d&apos;intérêt&nbsp;?</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Choisissez au moins 2 domaines qui vous intéressent pour recevoir des recommandations adaptées.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3.5" role="group" aria-label="Centres d'intérêt">
            {CATEGORIES.map((c) => {
              const choisi = interets.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={choisi}
                  onClick={() => basculer(c.id)}
                  className={cn(
                    "relative flex min-h-[112px] flex-col justify-between rounded-2xl border-[1.5px] p-3.5 text-left transition-colors active:scale-[0.98]",
                    choisi ? "border-orange-bord bg-orange-doux" : "border-border bg-card",
                  )}
                >
                  <IconeCategorie id={c.id} className="size-11" />
                  <span className="mt-3 text-[15px] leading-tight font-bold text-marine">{c.nom}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-3 right-3 grid size-6 place-items-center rounded-full",
                      choisi ? "bg-orange text-white" : "border-[1.5px] border-input bg-card",
                    )}
                  >
                    {choisi && <Check className="size-4" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
            <Button size="cta" disabled={interets.length < 2} onClick={() => setEtape(2)}>
              Continuer <ArrowRight />
            </Button>
            <button
              type="button"
              onClick={() => {
                setInterets([]);
                setEtape(2);
              }}
              className="mt-2 h-12 w-full text-base font-medium text-marine"
            >
              Passer
            </button>
          </div>
        </EcranEtape>
      )}

      {etape === 2 && (
        <EcranEtape numero={3} onRetour={() => setEtape(1)}>
          <h1 className="text-[clamp(21px,6vw,28px)] leading-tight font-extrabold text-marine">Comment vous appelez‑vous&nbsp;?</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Votre prénom sera utilisé pour personnaliser votre expérience d&apos;apprentissage.
          </p>

          <Image
            src="/images/avatar.webp"
            alt=""
            width={400}
            height={365}
            className="mx-auto mt-8 h-auto w-[clamp(132px,40vw,168px)]"
            priority
          />

          <form
            className="mt-8 flex flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              terminer();
            }}
          >
            <label className="flex min-h-[68px] items-center gap-4 rounded-2xl border border-input bg-card px-4 focus-within:border-orange focus-within:ring-3 focus-within:ring-orange/25">
              <UserRound className="size-7 shrink-0 text-marine" strokeWidth={1.6} aria-hidden="true" />
              <span className="flex flex-1 flex-col">
                <span className="text-[13px] text-muted-foreground">Prénom</span>
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  autoComplete="given-name"
                  autoCapitalize="words"
                  enterKeyHint="done"
                  maxLength={40}
                  required
                  className="w-full bg-transparent text-[20px] font-medium text-marine outline-none placeholder:text-muted-foreground/60"
                  placeholder="Ex. Samba"
                />
              </span>
            </label>

            <div className="mt-auto pt-10">
              <Button type="submit" size="cta" disabled={!prenom.trim() || enregistrement}>
                Terminer <ArrowRight />
              </Button>
            </div>
          </form>
        </EcranEtape>
      )}

      {etape === 3 && (
        <section className="px-safe flex flex-1 animate-in flex-col pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] fade-in">
          <Image
            src="/images/bienvenue.webp"
            alt=""
            width={678}
            height={720}
            className="mx-auto h-auto w-full max-w-[320px]"
            priority
          />
          <h1 className="mt-6 text-[28px] font-extrabold text-marine">Bienvenue {prenom.trim() || profil?.prenom}&nbsp;!</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Votre profil est prêt. Découvrez des cours adaptés à vos centres d&apos;intérêt et commencez à apprendre dès
            maintenant.
          </p>
          <div className="mt-auto pt-8">
            <Button size="cta" onClick={() => router.replace("/accueil/")}>
              Découvrir l&apos;application
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

function Presentation({ onSuivant }: { onSuivant: () => void }) {
  return (
    <section className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-creme">
      <div className="relative z-10 flex flex-col items-center pt-[calc(env(safe-area-inset-top)+1.5rem)] text-center">
        <LogoEmbleme className="w-[clamp(76px,22vw,120px)]" priority />
        <LogoTexte className="-mt-1 h-[clamp(44px,12vw,68px)]" priority />
        <p className="mt-1.5 text-[clamp(15px,4.4vw,19px)] leading-snug font-medium text-marine">
          Apprendre aujourd&apos;hui,
          <br />
          construire demain
        </p>
      </div>
      {/* L'illustration remonte sous le slogan (ciel, carte de l'Afrique) sans toucher le visage */}
      <div className="relative -mt-16 min-h-[220px] flex-1">
        <Image
          src="/images/onboarding-etudiant.webp"
          alt="Un étudiant sourit en suivant un cours sur son téléphone"
          fill
          sizes="640px"
          priority
          className="object-cover object-top dark:opacity-90"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-creme to-transparent" />
      </div>

      <div className="relative z-10 -mt-8 animate-in rounded-t-[28px] bg-card px-7 pt-8 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] fade-in slide-in-from-bottom-4">
        <h1 className="text-[26px] leading-tight font-extrabold text-marine">
          Des compétences
          <br />
          pour ton avenir
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Des cours pratiques et accessibles pour les étudiants et les jeunes professionnels en Afrique de l&apos;Ouest.
        </p>
        <div className="mt-6 flex justify-center gap-2" aria-label="Étape 1 sur 3">
          <span className="h-2 w-6 rounded-full bg-orange" />
          <span className="size-2 rounded-full bg-input" />
          <span className="size-2 rounded-full bg-input" />
        </div>
        <Button size="cta" className="mt-6" onClick={onSuivant}>
          Commencer <ArrowRight />
        </Button>
      </div>
    </section>
  );
}

function EcranEtape({
  numero,
  onRetour,
  logo,
  children,
}: {
  numero: number;
  onRetour: () => void;
  logo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
      <header className="px-safe pt-safe">
        <div className="relative flex h-16 items-center justify-between">
          <button
            type="button"
            onClick={onRetour}
            aria-label="Retour"
            className="-ml-2.5 grid size-11 place-items-center rounded-full text-marine active:bg-muted"
          >
            <ChevronLeft className="size-7" strokeWidth={2.2} />
          </button>
          {logo && (
            <span className="absolute left-1/2 -translate-x-1/2">
              <LogoCompact />
            </span>
          )}
          <span className="text-[14px] text-muted-foreground">Étape {numero} sur 3</span>
        </div>
        <div
          className="mx-auto mt-2 h-1 w-[78%] overflow-hidden rounded-full bg-piste"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={numero}
          aria-label={`Étape ${numero} sur 3`}
        >
          <div className="h-full rounded-full bg-orange transition-[width] duration-500" style={{ width: `${(numero / 3) * 100}%` }} />
        </div>
      </header>
      <div className="px-safe flex flex-1 animate-in flex-col pt-8 fade-in slide-in-from-right-4" key={numero}>
        {children}
      </div>
    </section>
  );
}
