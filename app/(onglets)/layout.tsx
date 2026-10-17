"use client";

import { BarreOnglets } from "@/components/barre-onglets";
import { BandeauHorsLigne, GardeProfil } from "@/components/etats";

export default function LayoutOnglets({ children }: { children: React.ReactNode }) {
  return (
    <GardeProfil>
      <div className="min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)]">
        <div className="sticky top-0 z-30">
          <BandeauHorsLigne />
        </div>
        {children}
      </div>
      <BarreOnglets />
    </GardeProfil>
  );
}
