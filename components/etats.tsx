"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import { useApp } from "./fournisseur-app";
import { LogoEmbleme } from "./logo";

/** Écran de chargement (le temps de lire le stockage local). */
export function Chargement() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background" aria-busy="true" aria-label="Chargement">
      <LogoEmbleme className="w-20 animate-pulse" priority />
    </div>
  );
}

/** Redirige vers l'onboarding tant qu'aucun profil n'existe. */
export function GardeProfil({ children }: { children: ReactNode }) {
  const { pret, profil } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (pret && !profil) router.replace("/onboarding/");
  }, [pret, profil, router]);

  if (!pret || !profil) return <Chargement />;
  return <>{children}</>;
}

export function BandeauHorsLigne() {
  const { enLigne } = useApp();
  if (enLigne) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-marine px-4 py-2 text-[13px] font-medium text-background">
      <WifiOff className="size-4" aria-hidden="true" />
      Hors ligne · vos cours téléchargés restent disponibles
    </div>
  );
}
