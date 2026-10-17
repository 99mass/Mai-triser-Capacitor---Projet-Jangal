"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  titre?: ReactNode;
  sousTitre?: ReactNode;
  /** Lien de retour ; à défaut, retour dans l'historique. */
  retour?: string | (() => void);
  droite?: ReactNode;
  className?: string;
  transparent?: boolean;
};

/** En-tête collant qui respecte la zone sûre du haut (encoche, barre de statut). */
export function EnTete({ titre, sousTitre, retour, droite, className, transparent }: Props) {
  const router = useRouter();
  const revenir = () => {
    if (typeof retour === "function") retour();
    else if (typeof retour === "string") router.push(retour);
    else router.back();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 pt-safe",
        !transparent && "border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="px-safe mx-auto flex min-h-14 w-full max-w-[640px] items-center gap-1">
        {retour !== undefined && (
          <button
            type="button"
            onClick={revenir}
            aria-label="Retour"
            className="-ml-2.5 grid size-11 shrink-0 place-items-center rounded-full text-marine active:bg-muted"
          >
            <ChevronLeft className="size-7" strokeWidth={2.2} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {titre && <h1 className="truncate text-[17px] font-bold text-marine">{titre}</h1>}
          {sousTitre && <p className="truncate text-[13px] text-muted-foreground">{sousTitre}</p>}
        </div>
        {droite && <div className="flex shrink-0 items-center gap-1">{droite}</div>}
      </div>
    </header>
  );
}
