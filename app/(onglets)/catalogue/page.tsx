"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, X } from "lucide-react";
import { CATEGORIES, COURS, NIVEAUX, categorie, type CategorieId, type Niveau } from "@/data";
import { CarteCours } from "@/components/cours-ui";
import { IconeCategorie } from "@/components/icones";
import { cn } from "@/lib/utils";

type FiltrePrix = "tous" | "gratuits" | "payants";

/** Recherche insensible à la casse et aux accents (« developpement » trouve « Développement »). */
function normaliser(texte: string): string {
  return texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export default function Catalogue() {
  const [recherche, setRecherche] = useState("");
  const [cat, setCat] = useState<CategorieId | null>(null);
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [prix, setPrix] = useState<FiltrePrix>("tous");

  const resultats = useMemo(() => {
    const termes = normaliser(recherche).split(/\s+/).filter(Boolean);
    return COURS.filter((c) => {
      if (cat && c.categorie !== cat) return false;
      if (niveau && c.niveau !== niveau) return false;
      if (prix === "gratuits" && c.prix > 0) return false;
      if (prix === "payants" && c.prix === 0) return false;
      const botte = normaliser(
        [c.titre, c.accroche, c.formateur.nom, categorie(c.categorie).domaine, ...c.chapitres.map((ch) => ch.titre)].join(" "),
      );
      return termes.every((t) => botte.includes(t));
    });
  }, [recherche, cat, niveau, prix]);

  const filtresActifs = !!(recherche || cat || niveau || prix !== "tous");

  return (
    <main className="mx-auto w-full max-w-[640px]">
      <header className="px-safe pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <h1 className="text-[26px] font-extrabold text-marine">Catalogue</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">{COURS.length} cours pour progresser à votre rythme</p>

        <label className="mt-4 flex h-12 items-center gap-2.5 rounded-2xl border border-input bg-card px-4 focus-within:border-orange focus-within:ring-3 focus-within:ring-orange/25">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Rechercher un cours</span>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un cours, un formateur…"
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent text-marine outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => setRecherche("")}
              aria-label="Effacer la recherche"
              className="-mr-2.5 grid size-11 place-items-center rounded-full text-muted-foreground"
            >
              <X className="size-5" />
            </button>
          )}
        </label>
      </header>

      <div className="mt-4 space-y-1">
        <RangeeFiltres libelle="Catégorie">
          <Puce actif={cat === null} onClick={() => setCat(null)}>
            Toutes
          </Puce>
          {CATEGORIES.map((c) => (
            <Puce key={c.id} actif={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}>
              <IconeCategorie id={c.id} className="-ml-1 size-6" />
              {c.nom}
            </Puce>
          ))}
        </RangeeFiltres>
        <RangeeFiltres libelle="Niveau et prix">
          <Puce actif={niveau === null} onClick={() => setNiveau(null)}>
            Tous niveaux
          </Puce>
          {NIVEAUX.map((n) => (
            <Puce key={n} actif={niveau === n} onClick={() => setNiveau(niveau === n ? null : n)}>
              {n}
            </Puce>
          ))}
          <span className="mx-1 w-px shrink-0 self-stretch bg-border" aria-hidden="true" />
          <Puce actif={prix === "gratuits"} onClick={() => setPrix(prix === "gratuits" ? "tous" : "gratuits")}>
            Gratuits
          </Puce>
          <Puce actif={prix === "payants"} onClick={() => setPrix(prix === "payants" ? "tous" : "payants")}>
            Payants
          </Puce>
        </RangeeFiltres>
      </div>

      <section className="px-safe mt-4" aria-live="polite">
        <div className="mb-3 flex min-h-11 items-center justify-between">
          <p className="text-[14px] font-medium text-muted-foreground">
            {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
          </p>
          {filtresActifs && (
            <button
              type="button"
              className="-mr-2 min-h-11 px-2 text-[14px] font-semibold text-lien"
              onClick={() => {
                setRecherche("");
                setCat(null);
                setNiveau(null);
                setPrix("tous");
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {resultats.length > 0 ? (
          <div className="space-y-3">
            {resultats.map((c) => (
              <CarteCours key={c.id} cours={c} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-input px-6 py-12 text-center">
            <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-bold text-marine">Aucun cours ne correspond</p>
            <p className="mt-1 text-[15px] text-muted-foreground">Essayez un autre mot-clé ou retirez un filtre.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function RangeeFiltres({ libelle, children }: { libelle: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={libelle} className="scrollbar-none px-safe flex gap-2 overflow-x-auto py-1">
      {children}
    </div>
  );
}

function Puce({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={cn(
        "flex min-h-11 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-4 text-[14px] font-semibold whitespace-nowrap transition-colors",
        actif ? "border-orange-bord bg-orange-doux text-marine" : "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
