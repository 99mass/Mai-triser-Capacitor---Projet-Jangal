export type CategorieId = "web" | "mobile" | "data" | "design" | "business" | "langues";

export type Niveau = "Débutant" | "Intermédiaire" | "Avancé";

export type BlocTexte =
  | { type: "titre"; texte: string }
  | { type: "paragraphe"; texte: string }
  | { type: "liste"; elements: string[] }
  | { type: "code"; code: string; langage: string }
  | { type: "astuce"; texte: string };

export type Question = {
  id: string;
  enonce: string;
  choix: string[];
  /** Index de la bonne réponse dans `choix`. */
  bonneReponse: number;
  explication: string;
};

type LeconBase = {
  id: string;
  titre: string;
  /** Durée estimée en minutes. */
  duree: number;
};

export type LeconVideo = LeconBase & {
  type: "video";
  videoUrl: string;
  /** Taille approximative du fichier, pour prévenir avant téléchargement. */
  tailleMo: number;
  resume: string;
};

export type LeconTexte = LeconBase & {
  type: "texte";
  contenu: BlocTexte[];
};

export type LeconQuiz = LeconBase & {
  type: "quiz";
  questions: Question[];
};

export type Lecon = LeconVideo | LeconTexte | LeconQuiz;

export type Chapitre = {
  id: string;
  titre: string;
  lecons: Lecon[];
};

export type Formateur = {
  nom: string;
  role: string;
  ville: string;
};

export type Cours = {
  id: string;
  titre: string;
  accroche: string;
  description: string;
  categorie: CategorieId;
  niveau: Niveau;
  formateur: Formateur;
  image: string;
  /** Prix en FCFA, 0 pour un cours gratuit. */
  prix: number;
  note: number;
  nbAvis: number;
  nbApprenants: number;
  objectifs: string[];
  chapitres: Chapitre[];
};
