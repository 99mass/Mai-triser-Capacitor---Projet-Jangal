import type { BlocTexte, LeconQuiz, LeconTexte, LeconVideo, Question } from "./types";
import { VIDEOS } from "./videos";

// Petits constructeurs pour garder les fichiers de cours lisibles.

export function video(
  id: string,
  titre: string,
  duree: number,
  source: keyof typeof VIDEOS,
  resume: string,
): LeconVideo {
  const { url, tailleMo } = VIDEOS[source];
  return { id, titre, duree, type: "video", videoUrl: url, tailleMo, resume };
}

export function texte(id: string, titre: string, duree: number, contenu: BlocTexte[]): LeconTexte {
  return { id, titre, duree, type: "texte", contenu };
}

export function quiz(id: string, titre: string, questions: Omit<Question, "id">[]): LeconQuiz {
  return {
    id,
    titre,
    duree: Math.max(3, questions.length),
    type: "quiz",
    questions: questions.map((q, i) => ({ ...q, id: `${id}-q${i + 1}` })),
  };
}

export const t = (texte: string): BlocTexte => ({ type: "titre", texte });
export const p = (texte: string): BlocTexte => ({ type: "paragraphe", texte });
export const liste = (...elements: string[]): BlocTexte => ({ type: "liste", elements });
export const code = (langage: string, code: string): BlocTexte => ({ type: "code", langage, code });
export const astuce = (texte: string): BlocTexte => ({ type: "astuce", texte });
