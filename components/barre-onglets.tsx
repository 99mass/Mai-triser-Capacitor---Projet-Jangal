"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookCheck, BookOpen, House, UserRound, type LucideIcon } from "lucide-react";
import { intercepterRetour } from "@/lib/platform/app-lifecycle";
import { cn } from "@/lib/utils";

const ACCUEIL = "/accueil/";

const ONGLETS: { href: string; libelle: string; icone: LucideIcon }[] = [
  { href: ACCUEIL, libelle: "Accueil", icone: House },
  { href: "/catalogue/", libelle: "Catalogue", icone: BookOpen },
  { href: "/mes-cours/", libelle: "Mes cours", icone: BookCheck },
  { href: "/profil/", libelle: "Profil", icone: UserRound },
];


/**
 * Barre d'onglets du bas, au-dessus de la zone sûre (barre de gestes Android / iPhone).
 *
 * Comme dans une app native (règle Material Design), changer d'onglet n'empile
 * pas d'historique : les liens utilisent `replace`. Le bouton retour depuis un
 * autre onglet ramène à l'Accueil, puis un second retour quitte l'app.
 */
export function BarreOnglets() {
  const chemin = usePathname();
  const router = useRouter();

  useEffect(
    () =>
      intercepterRetour(({ peutRevenir }) => {
        // Arrivé ici par un lien (ex. « Voir tout ») : retour normal dans l'historique.
        if (peutRevenir || chemin === ACCUEIL) return false;
        router.replace(ACCUEIL);
        return true;
      }),
    [chemin, router],
  );

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <ul className="mx-auto grid max-w-[640px] grid-cols-4">
        {ONGLETS.map(({ href, libelle, icone: Icone }) => {
          const actif = chemin.startsWith(href.slice(0, -1));
          return (
            <li key={href}>
              <Link
                href={href}
                replace
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-medium transition-colors active:bg-muted/60",
                  actif ? "text-orange-texte" : "text-muted-foreground",
                )}
              >
                <Icone
                  className={cn("size-6", actif && "text-orange")}
                  strokeWidth={actif ? 2.2 : 1.8}
                  fill={actif && Icone === House ? "currentColor" : "none"}
                />
                <span className={cn(actif && "font-semibold")}>{libelle}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
