"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Annonce = { id: number; texte: string; type: "succes" | "erreur" };

const Contexte = createContext<(texte: string, type?: Annonce["type"]) => void>(() => {});

/** Petits messages éphémères (« Lien copié », « Leçon terminée »), lus par les lecteurs d'écran. */
export function FournisseurAnnonces({ children }: { children: ReactNode }) {
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout>>(undefined);

  const annoncer = useCallback((texte: string, type: Annonce["type"] = "succes") => {
    clearTimeout(minuteur.current);
    setAnnonce({ id: Date.now(), texte, type });
    minuteur.current = setTimeout(() => setAnnonce(null), 2800);
  }, []);

  return (
    <Contexte.Provider value={annoncer}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
      >
        {annonce && (
          <div
            key={annonce.id}
            className={cn(
              "flex max-w-[600px] animate-in items-center gap-2.5 rounded-2xl px-4 py-3 text-[15px] font-medium text-white shadow-lg fade-in slide-in-from-bottom-2",
              annonce.type === "succes" ? "bg-[#0f305b] dark:bg-[#24365a]" : "bg-[#b42318]",
            )}
          >
            {annonce.type === "succes" ? (
              <CircleCheck className="size-5 shrink-0 text-[#ffb366]" />
            ) : (
              <CircleAlert className="size-5 shrink-0" />
            )}
            {annonce.texte}
          </div>
        )}
      </div>
    </Contexte.Provider>
  );
}

export function useAnnonce() {
  return useContext(Contexte);
}
