import type { CategorieId } from "@/data/types";
import { cn } from "@/lib/utils";

type Props = { className?: string };

// Icônes colorées des centres d'intérêt, redessinées d'après la maquette.

function Ordinateur({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="7" y="8" width="26" height="18" rx="2.5" fill="#1d4f91" />
      <rect x="9.5" y="10.5" width="21" height="13" rx="1" fill="#bfe0fb" />
      <path d="M3 28h34l-2.2 3.2a2 2 0 0 1-1.7.8H6.9a2 2 0 0 1-1.7-.8z" fill="#1d4f91" />
      <rect x="16" y="28" width="8" height="1.6" rx=".8" fill="#4d82c4" />
    </svg>
  );
}

function Telephone({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="11" y="4" width="18" height="32" rx="4" fill="#1d4f91" />
      <rect x="13.2" y="7.5" width="13.6" height="22" rx="1.5" fill="#bfe0fb" />
      <circle cx="20" cy="32.6" r="1.4" fill="#bfe0fb" />
    </svg>
  );
}

function Barres({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="7" y="22" width="7" height="12" rx="1.5" fill="#fbbf24" />
      <rect x="16.5" y="15" width="7" height="19" rx="1.5" fill="#f9a825" />
      <rect x="26" y="6" width="7" height="28" rx="1.5" fill="#f59e0b" />
    </svg>
  );
}

function Palette({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 5C11.2 5 5 11 5 19c0 7.6 6 14 13 14 2.6 0 3.6-1.6 3-3.4-.6-1.8.2-3.6 2.4-3.6H28c4.4 0 7-2.8 7-7C35 10.6 28.4 5 20 5z"
        fill="#8e44c9"
      />
      <circle cx="13" cy="17" r="2.6" fill="#fff" />
      <circle cx="19" cy="11.5" r="2.6" fill="#fff" />
      <circle cx="26.5" cy="13" r="2.6" fill="#fff" />
      <circle cx="13.5" cy="24.5" r="2.4" fill="#fff" />
    </svg>
  );
}

function Mallette({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M15 11V8.5A2.5 2.5 0 0 1 17.5 6h5A2.5 2.5 0 0 1 25 8.5V11" fill="none" stroke="#a5401d" strokeWidth="2.6" />
      <rect x="5" y="11" width="30" height="22" rx="3" fill="#b9502a" />
      <rect x="5" y="11" width="30" height="9" rx="3" fill="#cf6438" />
      <rect x="17" y="17.5" width="6" height="5" rx="1.2" fill="#f6d2b8" />
    </svg>
  );
}

function Globe({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="#1f6fe5" />
      <g fill="none" stroke="#fff" strokeWidth="2">
        <ellipse cx="20" cy="20" rx="6.5" ry="15" />
        <path d="M5 20h30M7.2 12.5h25.6M7.2 27.5h25.6" />
      </g>
    </svg>
  );
}

const ICONES: Record<CategorieId, (p: Props) => React.JSX.Element> = {
  web: Ordinateur,
  mobile: Telephone,
  data: Barres,
  design: Palette,
  business: Mallette,
  langues: Globe,
};

export function IconeCategorie({ id, className }: { id: CategorieId; className?: string }) {
  const Icone = ICONES[id];
  return <Icone className={cn("size-10", className)} />;
}

/** Cible de l'objectif hebdomadaire. */
export function IconeCible({ className }: Props) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="22" cy="26" r="18" fill="#fbbf24" />
      <circle cx="22" cy="26" r="12.5" fill="#fff" />
      <circle cx="22" cy="26" r="8" fill="#f59e0b" />
      <circle cx="22" cy="26" r="3.4" fill="#fff" />
      <path d="M22 26 37 11" stroke="#f67b0d" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M34 8h6v6l-3 3h-6v-6z" fill="#f67b0d" />
    </svg>
  );
}
