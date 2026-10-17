import { notFound } from "next/navigation";
import { COURS, trouverCours } from "@/data";
import { Certificat } from "@/components/ecrans/certificat";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURS.map((c) => ({ coursId: c.id }));
}

export default async function PageCertificat({ params }: PageProps<"/cours/[coursId]/certificat">) {
  const { coursId } = await params;
  if (!trouverCours(coursId)) notFound();
  return <Certificat coursId={coursId} />;
}
