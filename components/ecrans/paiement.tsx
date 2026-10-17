"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, FlaskConical, Loader2, LockKeyhole, Smartphone } from "lucide-react";
import { formaterPrix, trouverCours, type Cours } from "@/data";
import { useApp } from "@/components/fournisseur-app";
import { EnTete } from "@/components/en-tete";
import { VignetteCours } from "@/components/cours-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { enregistrerAchat, type Achat } from "@/lib/storage";
import { estAchete } from "@/lib/progression";
import { cn } from "@/lib/utils";

type Moyen = Achat["moyen"];

const MOYENS: { id: Moyen; nom: string; detail: string; couleur: string; initiales: string }[] = [
  { id: "wave", nom: "Wave", detail: "Frais : 1 %", couleur: "bg-[#1dc8ff] text-[#062a4d]", initiales: "W" },
  { id: "orange-money", nom: "Orange Money", detail: "Paiement par code", couleur: "bg-[#ff7900] text-white", initiales: "OM" },
];

/** Mobiles sénégalais : 9 chiffres commençant par 70, 75, 76, 77 ou 78. */
const FORMAT_NUMERO = /^7[05678]\d{7}$/;

function formaterNumero(chiffres: string): string {
  return chiffres.replace(/^(\d{2})(\d{0,3})(\d{0,2})(\d{0,2}).*/, (_, a, b, c, d) => [a, b, c, d].filter(Boolean).join(" "));
}

export function Paiement({ coursId }: { coursId: string }) {
  const cours = trouverCours(coursId)!;
  const { achats } = useApp();
  const [moyen, setMoyen] = useState<Moyen>("wave");
  const [chiffres, setChiffres] = useState("");
  const [touche, setTouche] = useState(false);
  const [etat, setEtat] = useState<"saisie" | "traitement" | "succes">("saisie");
  const [reference, setReference] = useState("");

  const valide = FORMAT_NUMERO.test(chiffres);
  const dejaAchete = estAchete(cours, achats) && etat === "saisie";

  const payer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouche(true);
    if (!valide) return;
    setEtat("traitement");
    // Simulation : aucune requête n'est envoyée, on attend 2 secondes.
    await new Promise((r) => setTimeout(r, 2000));
    const ref = `JNG-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    await enregistrerAchat({ coursId: cours.id, moyen, numero: `+221${chiffres}`, montant: cours.prix, reference: ref });
    setReference(ref);
    setEtat("succes");
  };

  return (
    <div className="min-h-dvh">
      <EnTete retour={`/cours/${cours.id}/`} titre="Paiement" />
      <main className="px-safe mx-auto w-full max-w-[640px] pt-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div
          role="note"
          className="flex items-start gap-3 rounded-2xl border-[1.5px] border-dashed border-orange-bord bg-orange-doux p-4"
        >
          <FlaskConical className="mt-0.5 size-5 shrink-0 text-orange-texte" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-extrabold text-marine">Paiement simulé – démo</p>
            <p className="mt-0.5 text-[14px] leading-relaxed text-foreground/85">
              Aucun argent n&apos;est débité et aucune donnée n&apos;est envoyée. Cet écran illustre le parcours d&apos;achat.
            </p>
          </div>
        </div>

        <Recapitulatif cours={cours} />

        {etat === "succes" ? (
          <Succes cours={cours} reference={reference} moyen={moyen} numero={chiffres} />
        ) : dejaAchete ? (
          <div className="mt-6 rounded-2xl bg-vert-doux p-5 text-center">
            <p className="font-bold text-vert">{cours.prix ? "Vous avez déjà accès à ce cours." : "Ce cours est gratuit."}</p>
            <Link href={`/cours/${cours.id}/`} className={buttonVariants({ size: "cta", className: "mt-4" })}>
              Aller au cours
            </Link>
          </div>
        ) : (
          <form onSubmit={payer} noValidate className="mt-6">
            <fieldset disabled={etat === "traitement"}>
              <legend className="text-[17px] font-bold text-marine">Moyen de paiement</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {MOYENS.map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "relative flex min-h-[96px] cursor-pointer flex-col justify-between rounded-2xl border-[1.5px] p-3.5 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-orange/30",
                      moyen === m.id ? "border-orange-bord bg-orange-doux" : "border-border bg-card",
                    )}
                  >
                    <input
                      type="radio"
                      name="moyen"
                      value={m.id}
                      checked={moyen === m.id}
                      onChange={() => setMoyen(m.id)}
                      className="sr-only"
                    />
                    <span className={cn("grid size-10 place-items-center rounded-xl text-[14px] font-extrabold", m.couleur)}>
                      {m.initiales}
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold text-marine">{m.nom}</span>
                      <span className="block text-[12px] text-muted-foreground">{m.detail}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-3 right-3 size-5 rounded-full border-[1.5px]",
                        moyen === m.id ? "border-[6px] border-orange" : "border-input bg-card",
                      )}
                    />
                  </label>
                ))}
              </div>

              <label htmlFor="numero" className="mt-6 block text-[17px] font-bold text-marine">
                Numéro {moyen === "wave" ? "Wave" : "Orange Money"}
              </label>
              <div
                className={cn(
                  "mt-3 flex h-14 items-center overflow-hidden rounded-2xl border-[1.5px] bg-card focus-within:ring-3",
                  touche && !valide
                    ? "border-destructive focus-within:ring-destructive/20"
                    : "border-input focus-within:border-orange focus-within:ring-orange/25",
                )}
              >
                <span className="flex h-full items-center gap-2 border-r border-border bg-muted px-3.5 text-[16px] font-semibold text-marine">
                  <span aria-hidden="true">🇸🇳</span> +221
                </span>
                <input
                  id="numero"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={formaterNumero(chiffres)}
                  onChange={(e) => setChiffres(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  onBlur={() => setTouche(true)}
                  placeholder="77 123 45 67"
                  aria-invalid={touche && !valide}
                  aria-describedby="aide-numero"
                  className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[18px] font-semibold tracking-wide text-marine outline-none placeholder:font-normal placeholder:text-muted-foreground/70"
                />
                <Smartphone className="mr-3.5 size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p
                id="aide-numero"
                className={cn("mt-2 text-[13px]", touche && !valide ? "font-medium text-destructive" : "text-muted-foreground")}
              >
                {touche && !valide
                  ? "Entrez un numéro sénégalais valide : 9 chiffres commençant par 70, 75, 76, 77 ou 78."
                  : "Vous recevriez une demande de confirmation sur ce numéro."}
              </p>

              <Button type="submit" size="cta" variant="orange" className="mt-7">
                {etat === "traitement" ? (
                  <>
                    <Loader2 className="animate-spin" /> Confirmation en cours…
                  </>
                ) : (
                  <>
                    <LockKeyhole /> Payer {formaterPrix(cours.prix)}
                  </>
                )}
              </Button>
              {etat === "traitement" && (
                <p className="mt-3 text-center text-[14px] text-muted-foreground" role="status">
                  Simulation : validation sur le téléphone…
                </p>
              )}
            </fieldset>
          </form>
        )}
      </main>
    </div>
  );
}

function Recapitulatif({ cours }: { cours: Cours }) {
  return (
    <section aria-label="Récapitulatif" className="mt-5 flex items-center gap-3.5 rounded-2xl bg-card p-3 ombre-carte">
      <VignetteCours cours={cours} className="size-16 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] leading-snug font-bold text-marine">{cours.titre}</p>
        <p className="text-[13px] text-muted-foreground">{cours.formateur.nom} · accès à vie</p>
      </div>
      <p className="shrink-0 text-[16px] font-extrabold text-marine">{formaterPrix(cours.prix)}</p>
    </section>
  );
}

function Succes({ cours, reference, moyen, numero }: { cours: Cours; reference: string; moyen: Moyen; numero: string }) {
  return (
    <section role="status" className="mt-6 animate-in rounded-3xl bg-card p-6 text-center ombre-carte fade-in zoom-in-95">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-vert-doux text-vert">
        <CircleCheck className="size-11" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-[22px] font-extrabold text-marine">Paiement confirmé</h2>
      <p className="mt-1 text-[15px] text-muted-foreground">(simulation – aucun débit réel)</p>
      <dl className="mt-5 space-y-2 rounded-2xl bg-muted p-4 text-left text-[14px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Montant</dt>
          <dd className="font-semibold text-marine">{formaterPrix(cours.prix)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Moyen</dt>
          <dd className="font-semibold text-marine">{moyen === "wave" ? "Wave" : "Orange Money"} · +221 {formaterNumero(numero)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Référence</dt>
          <dd className="font-mono font-semibold text-marine">{reference}</dd>
        </div>
      </dl>
      <Link href={`/cours/${cours.id}/`} className={buttonVariants({ size: "cta", className: "mt-6" })}>
        Commencer le cours
      </Link>
    </section>
  );
}
