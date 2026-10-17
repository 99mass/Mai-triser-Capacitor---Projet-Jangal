import { notFound } from "next/navigation";
import { COURS, trouverCours } from "@/data";
import { DetailCours } from "@/components/ecrans/detail-cours";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURS.map((c) => ({ coursId: c.id }));
}

export default async function PageCours({ params }: PageProps<"/cours/[coursId]">) {
  const { coursId } = await params;
  if (!trouverCours(coursId)) notFound();
  return <DetailCours coursId={coursId} />;
}
