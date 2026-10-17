"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/fournisseur-app";
import { Chargement } from "@/components/etats";

/** Point d'entrée : onboarding au premier lancement, accueil ensuite. */
export default function Demarrage() {
  const { pret, profil } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (pret) router.replace(profil ? "/accueil/" : "/onboarding/");
  }, [pret, profil, router]);

  return <Chargement />;
}
