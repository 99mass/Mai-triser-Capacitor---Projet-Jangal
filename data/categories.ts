import type { CategorieId, Niveau } from "./types";

export type Categorie = {
  id: CategorieId;
  /** Libellé court (onboarding, filtres). */
  nom: string;
  /** Libellé affiché sur les cartes de cours. */
  domaine: string;
};

export const CATEGORIES: Categorie[] = [
  { id: "web", nom: "Développement web", domaine: "Développement web" },
  { id: "mobile", nom: "Mobile", domaine: "Développement mobile" },
  { id: "data", nom: "Data & IA", domaine: "Data & IA" },
  { id: "design", nom: "Design", domaine: "Design" },
  { id: "business", nom: "Business", domaine: "Business" },
  { id: "langues", nom: "Langues", domaine: "Langues" },
];

export const NIVEAUX: Niveau[] = ["Débutant", "Intermédiaire", "Avancé"];

export function categorie(id: CategorieId): Categorie {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
