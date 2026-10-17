"use client";

import { BandeauHorsLigne, GardeProfil } from "@/components/etats";

export default function LayoutCours({ children }: { children: React.ReactNode }) {
  return (
    <GardeProfil>
      <BandeauHorsLigne />
      {children}
    </GardeProfil>
  );
}
