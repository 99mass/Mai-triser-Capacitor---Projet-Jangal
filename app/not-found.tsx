import Link from "next/link";
import { LogoEmbleme } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";

export default function PageIntrouvable() {
  return (
    <main className="px-safe mx-auto flex min-h-dvh max-w-[640px] flex-col items-center justify-center gap-4 text-center">
      <LogoEmbleme className="w-24" />
      <h1 className="text-2xl font-extrabold text-marine">Page introuvable</h1>
      <p className="text-muted-foreground">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/accueil/" className={buttonVariants({ size: "cta", className: "mt-2 max-w-xs" })}>
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
