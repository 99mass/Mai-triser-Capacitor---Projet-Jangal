import Image from "next/image";
import { cn } from "@/lib/utils";

/** Emblème Jàngal (toque, apprenant, livre ouvert). */
export function LogoEmbleme({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/images/logo-embleme.png"
      alt=""
      width={360}
      height={328}
      priority={priority}
      className={cn("h-auto select-none dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.7)]", className)}
    />
  );
}

/** Logotype « Jàngal » : marine en clair, blanc en sombre. */
export function LogoTexte({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <Image
        src="/images/logo-jangal.png"
        alt="Jàngal"
        width={560}
        height={168}
        priority={priority}
        className="h-full w-auto select-none dark:hidden"
      />
      <Image
        src="/images/logo-jangal-sombre.png"
        alt="Jàngal"
        width={560}
        height={168}
        priority={priority}
        className="hidden h-full w-auto select-none dark:block"
      />
    </span>
  );
}

/** Version compacte pour les en-têtes (emblème + logotype). */
export function LogoCompact({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-end gap-1", className)}>
      <LogoEmbleme className="w-9" />
      <LogoTexte className="h-6" />
    </span>
  );
}
