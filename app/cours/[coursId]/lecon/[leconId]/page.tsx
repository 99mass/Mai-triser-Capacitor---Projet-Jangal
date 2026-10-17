import { notFound } from "next/navigation";
import { COURS, toutesLecons, trouverCours } from "@/data";
import { LecteurLecon } from "@/components/ecrans/lecteur-lecon";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURS.flatMap((c) => toutesLecons(c).map(({ lecon }) => ({ coursId: c.id, leconId: lecon.id })));
}

export default async function PageLecon({ params }: PageProps<"/cours/[coursId]/lecon/[leconId]">) {
  const { coursId, leconId } = await params;
  const cours = trouverCours(coursId);
  if (!cours || !toutesLecons(cours).some((l) => l.lecon.id === leconId)) notFound();
  // `key` : repartir d'un état propre (notes, vidéo, quiz) à chaque leçon.
  return <LecteurLecon key={`${coursId}/${leconId}`} coursId={coursId} leconId={leconId} />;
}
