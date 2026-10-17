"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Camera, Database, Moon, RotateCcw, Smartphone, Sun, Target, Trash2 } from "lucide-react";
import { CATEGORIES, type CategorieId } from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { useAnnonce } from "@/components/annonce";
import { IconeCategorie } from "@/components/icones";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as storage from "@/lib/storage";
import { formaterTaille } from "@/lib/progression";
import { choisirPhoto } from "@/lib/platform/camera";
import { confirmer } from "@/lib/platform/dialog";
import { espaceUtilise, toutSupprimer } from "@/lib/platform/downloads";
import { annulerRappel, demanderPermission, programmerRappelQuotidien } from "@/lib/platform/notifications";
import { effacerPreferences, type Theme } from "@/lib/platform/preferences";
import { plateforme } from "@/lib/platform";
import { cn } from "@/lib/utils";

const THEMES: { id: Theme; libelle: string; icone: typeof Sun }[] = [
  { id: "clair", libelle: "Clair", icone: Sun },
  { id: "sombre", libelle: "Sombre", icone: Moon },
  { id: "systeme", libelle: "Système", icone: Smartphone },
];

export default function Profil() {
  const { profil, preferences, changerPreference, telechargements, progressions } = useApp();
  const annoncer = useAnnonce();
  const router = useRouter();
  const [prenom, setPrenom] = useState(profil?.prenom ?? "");
  const [stockage, setStockage] = useState<{ donnees: number; videos: number } | null>(null);

  useEffect(() => {
    Promise.all([storage.tailleDonnees(), espaceUtilise()]).then(([donnees, videos]) => setStockage({ donnees, videos }));
  }, [telechargements, progressions, profil]);

  if (!profil) return null;

  const changerPhoto = async () => {
    try {
      const photo = await choisirPhoto();
      if (photo) {
        await storage.modifierProfil({ photo });
        annoncer("Photo de profil mise à jour");
      }
    } catch {
      annoncer("Impossible de lire cette image", "erreur");
    }
  };

  const enregistrerPrenom = async () => {
    const nom = prenom.trim();
    if (!nom) return setPrenom(profil.prenom);
    if (nom === profil.prenom) return;
    await storage.modifierProfil({ prenom: nom });
    annoncer("Prénom enregistré");
  };

  const basculerInteret = (id: CategorieId) => {
    const interets = profil.interets.includes(id) ? profil.interets.filter((x) => x !== id) : [...profil.interets, id];
    storage.modifierProfil({ interets });
  };

  const basculerRappel = async (actif: boolean) => {
    if (!actif) {
      await annulerRappel();
      await changerPreference("rappelActif", false);
      return;
    }
    const permission = await demanderPermission();
    if (permission !== "accordee") {
      annoncer(
        permission === "indisponible"
          ? "Les notifications ne sont pas disponibles sur ce navigateur"
          : "Autorisez les notifications pour recevoir le rappel",
        "erreur",
      );
      return;
    }
    await programmerRappelQuotidien(preferences.rappelHeure);
    await changerPreference("rappelActif", true);
    annoncer(`Rappel programmé chaque jour à ${preferences.rappelHeure.replace(":", " h ")}`);
  };

  const changerHeure = async (heure: string) => {
    if (!heure) return;
    await changerPreference("rappelHeure", heure);
    if (preferences.rappelActif) await programmerRappelQuotidien(heure);
  };

  const reinitialiser = async () => {
    const ok = await confirmer({
      titre: "Réinitialiser toutes les données ?",
      message:
        "Votre profil, votre progression, vos notes, vos résultats de quiz, vos achats et vos vidéos téléchargées seront définitivement supprimés de cet appareil.",
      boutonOk: "Tout supprimer",
    });
    if (!ok) return;
    await annulerRappel();
    await toutSupprimer();
    await effacerPreferences();
    await storage.reinitialiserTout();
    router.replace("/onboarding/");
  };

  return (
    <main className="mx-auto w-full max-w-[640px]">
      <header className="px-safe pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <h1 className="text-[26px] font-extrabold text-marine">Profil</h1>
      </header>

      <div className="px-safe mt-5 space-y-6">
        {/* Identité */}
        <section className="flex flex-col items-center rounded-3xl bg-card px-5 pt-6 pb-5 ombre-carte">
          <button
            type="button"
            onClick={changerPhoto}
            className="relative rounded-full focus-visible:ring-3 focus-visible:ring-orange/40"
            aria-label="Changer la photo de profil"
          >
            <span className="block size-28 overflow-hidden rounded-full bg-[#dbeafb]">
              {profil.photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL locale
                <img src={profil.photo} alt="" className="size-full object-cover" />
              ) : (
                <Image src="/images/avatar.webp" alt="" width={400} height={365} className="size-full scale-110 object-cover" />
              )}
            </span>
            <span className="absolute right-0 bottom-0 grid size-11 place-items-center rounded-full border-4 border-card bg-orange text-white">
              <Camera className="size-5" />
            </span>
          </button>
          {profil.photo && (
            <button
              type="button"
              onClick={() => storage.modifierProfil({ photo: undefined })}
              className="mt-1 min-h-11 px-3 text-[14px] font-medium text-muted-foreground"
            >
              Retirer la photo
            </button>
          )}

          <label className="mt-3 w-full">
            <span className="text-[13px] font-medium text-muted-foreground">Prénom</span>
            <Input
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              onBlur={enregistrerPrenom}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              maxLength={40}
              autoComplete="given-name"
              className="mt-1 text-[17px] font-semibold text-marine"
            />
          </label>
        </section>

        <Section titre="Centres d'intérêt">
          <div className="flex flex-wrap gap-2 p-4">
            {CATEGORIES.map((c) => {
              const actif = profil.interets.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => basculerInteret(c.id)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[14px] font-semibold",
                    actif ? "border-orange-bord bg-orange-doux text-marine" : "border-border text-muted-foreground",
                  )}
                >
                  <IconeCategorie id={c.id} className="size-6" />
                  {c.nom}
                </button>
              );
            })}
          </div>
        </Section>

        <Section titre="Apprentissage" id="rappel">
          <Ligne icone={Bell} titre="Rappel quotidien" detail="Une notification pour ne pas casser votre série">
            <Switch
              checked={preferences.rappelActif}
              onCheckedChange={basculerRappel}
              aria-label="Activer le rappel quotidien"
              className="data-checked:bg-orange"
            />
          </Ligne>
          <Ligne icone={null} titre="Heure du rappel" desactive={!preferences.rappelActif}>
            <input
              type="time"
              value={preferences.rappelHeure}
              onChange={(e) => changerHeure(e.target.value)}
              disabled={!preferences.rappelActif}
              aria-label="Heure du rappel"
              className="h-11 rounded-xl border border-input bg-background px-3 font-semibold text-marine disabled:opacity-50"
            />
          </Ligne>
          <Ligne icone={Target} titre="Objectif hebdomadaire">
            <div className="flex gap-1" role="group" aria-label="Leçons par semaine">
              {[3, 5, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={profil.objectifHebdo === n}
                  onClick={() => storage.modifierProfil({ objectifHebdo: n })}
                  className={cn(
                    "grid size-11 place-items-center rounded-xl text-[15px] font-bold",
                    profil.objectifHebdo === n ? "bg-orange text-white dark:text-[#0b1424]" : "bg-muted text-marine",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </Ligne>
        </Section>

        <Section titre="Apparence">
          <div className="grid grid-cols-3 gap-2 p-3" role="radiogroup" aria-label="Thème">
            {THEMES.map(({ id, libelle, icone: Icone }) => {
              const actif = preferences.theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={actif}
                  onClick={() => changerPreference("theme", id)}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] text-[14px] font-semibold",
                    actif ? "border-orange-bord bg-orange-doux text-marine" : "border-transparent bg-muted text-muted-foreground",
                  )}
                >
                  <Icone className="size-5" aria-hidden="true" />
                  {libelle}
                </button>
              );
            })}
          </div>
        </Section>

        <Section titre="Stockage">
          <Ligne icone={Database} titre="Espace utilisé" detail={stockage ? `Données ${formaterTaille(stockage.donnees)} · Vidéos ${formaterTaille(stockage.videos)}` : "Calcul…"}>
            <span className="text-[16px] font-extrabold text-marine">
              {stockage ? formaterTaille(stockage.donnees + stockage.videos) : "…"}
            </span>
          </Ligne>
        </Section>

        <section className="rounded-2xl border border-destructive/30 p-4">
          <p className="flex items-center gap-2 font-bold text-destructive">
            <Trash2 className="size-5" aria-hidden="true" /> Zone sensible
          </p>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Supprime toutes vos données Jàngal de cet appareil. Cette action est irréversible.
          </p>
          <Button variant="destructive" className="mt-3 h-12 w-full rounded-full" onClick={reinitialiser}>
            <RotateCcw /> Réinitialiser toutes les données
          </Button>
        </section>

        <p className="pb-2 text-center text-[13px] text-muted-foreground">
          Jàngal 1.0 · Apprendre aujourd&apos;hui, construire demain · {plateforme()}
        </p>
      </div>
    </main>
  );
}

function Section({ titre, id, children }: { titre: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-2 px-1 text-[15px] font-bold text-muted-foreground">{titre}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl bg-card ombre-carte">{children}</div>
    </section>
  );
}

function Ligne({
  icone: Icone,
  titre,
  detail,
  desactive,
  children,
}: {
  icone: typeof Bell | null;
  titre: string;
  detail?: string;
  desactive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-h-16 items-center gap-3.5 px-4 py-3", desactive && "opacity-60")}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-orange-texte", Icone && "bg-orange-doux")}>
        {Icone && <Icone className="size-5" aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-marine">{titre}</span>
        {detail && <span className="block text-[13px] text-muted-foreground">{detail}</span>}
      </span>
      {children}
    </div>
  );
}
