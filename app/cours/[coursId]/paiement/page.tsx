import { notFound } from "next/navigation";
import { COURS, trouverCours } from "@/data";
import { Paiement } from "@/components/ecrans/paiement";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURS.map((c) => ({ coursId: c.id }));
}

export default async function PagePaiement({ params }: PageProps<"/cours/[coursId]/paiement">) {
  const { coursId } = await params;
  if (!trouverCours(coursId)) notFound();
  return <Paiement coursId={coursId} />;
}
