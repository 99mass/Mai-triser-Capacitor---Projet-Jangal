import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { categorie, formaterPrix, type Cours } from "@/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VignetteCours({ cours, className, priority }: { cours: Cours; className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative block overflow-hidden rounded-xl bg-muted", className)}>
      <Image src={cours.image} alt="" fill sizes="160px" priority={priority} className="object-cover" />
    </span>
  );
}

export function BadgePrix({ cours, className }: { cours: Cours; className?: string }) {
  return (
    <Badge variant={cours.prix === 0 ? "gratuit" : "prix"} className={className}>
      {formaterPrix(cours.prix)}
    </Badge>
  );
}

export function Note({ cours, className }: { cours: Cours; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px] text-muted-foreground", className)}>
      <Star className="size-4 fill-[#f6a609] text-[#f6a609]" aria-hidden="true" />
      <span>
        {cours.note.toLocaleString("fr-FR")} <span className="sr-only">sur 5, </span>({cours.nbAvis}
        <span className="sr-only"> avis</span>)
      </span>
    </span>
  );
}

export function BarreProgression({
  valeur,
  className,
  label,
}: {
  valeur: number;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(valeur)}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-piste", className)}
    >
      <div className="h-full rounded-full bg-orange transition-[width] duration-500" style={{ width: `${valeur}%` }} />
    </div>
  );
}

/** Carte de cours en ligne, comme « Cours recommandés » sur la maquette. */
export function CarteCours({ cours, extra }: { cours: Cours; extra?: React.ReactNode }) {
  return (
    <Link
      href={`/cours/${cours.id}/`}
      className="ombre-carte flex gap-3.5 rounded-2xl bg-card p-3 transition-transform active:scale-[0.99]"
    >
      <VignetteCours cours={cours} className="size-[88px] shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="line-clamp-2 text-[15px] leading-snug font-bold text-marine">{cours.titre}</span>
        <span className="mt-0.5 truncate text-[13px] text-muted-foreground">{cours.formateur.nom}</span>
        <span className="truncate text-[13px] text-muted-foreground">{categorie(cours.categorie).domaine}</span>
        <span className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Note cours={cours} />
          {extra ?? <BadgePrix cours={cours} />}
        </span>
      </span>
    </Link>
  );
}
