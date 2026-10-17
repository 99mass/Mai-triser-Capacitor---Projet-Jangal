"use client";

import { useState } from "react";
import { ArrowRight, Check, RotateCcw, Trophy, X } from "lucide-react";
import type { LeconQuiz } from "@/data";
import { Button } from "@/components/ui/button";
import { BarreProgression } from "@/components/cours-ui";
import { vibrerErreur, vibrerSucces } from "@/lib/platform/haptics";
import { cn } from "@/lib/utils";

export const SEUIL_REUSSITE = 0.6;
const LETTRES = ["A", "B", "C", "D", "E"];

type Props = {
  lecon: LeconQuiz;
  meilleurScore?: number;
  onTermine: (score: number, total: number) => void;
  onContinuer?: () => void;
};

/** QCM une question à la fois, avec retour immédiat (couleur, texte, vibration). */
export function Quiz({ lecon, meilleurScore, onTermine, onContinuer }: Props) {
  const { questions } = lecon;
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);

  const question = questions[index];
  const repondu = choix !== null;
  const juste = repondu && choix === question.bonneReponse;

  const repondre = (i: number) => {
    if (repondu) return;
    setChoix(i);
    if (i === question.bonneReponse) {
      setScore((s) => s + 1);
      vibrerSucces();
    } else {
      vibrerErreur();
    }
  };

  const suivante = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setChoix(null);
    } else {
      setTermine(true);
      onTermine(score, questions.length);
    }
  };

  const recommencer = () => {
    setIndex(0);
    setChoix(null);
    setScore(0);
    setTermine(false);
  };

  if (termine) {
    const reussi = score / questions.length >= SEUIL_REUSSITE;
    return (
      <div className="animate-in rounded-3xl bg-card p-6 text-center ombre-carte fade-in zoom-in-95">
        <span
          className={cn(
            "mx-auto grid size-20 place-items-center rounded-full",
            reussi ? "bg-orange-doux text-orange" : "bg-muted text-muted-foreground",
          )}
        >
          <Trophy className="size-10" aria-hidden="true" />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-muted-foreground">Votre score</p>
        <p className="text-[44px] leading-none font-extrabold text-marine">
          {score}
          <span className="text-[28px] text-muted-foreground">/{questions.length}</span>
        </p>
        <p className="mt-3 text-[16px] font-bold text-marine">
          {score === questions.length ? "Parfait, bravo\u00a0!" : reussi ? "Quiz réussi, bien joué\u00a0!" : "Encore un petit effort\u00a0!"}
        </p>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {reussi
            ? "La leçon est validée. Vous pouvez passer à la suite."
            : `Il faut ${Math.ceil(questions.length * SEUIL_REUSSITE)} bonnes réponses pour valider. Relisez les leçons puis réessayez.`}
        </p>
        {meilleurScore !== undefined && meilleurScore > 0 && (
          <p className="mt-2 text-[13px] text-muted-foreground">
            Meilleur score : {Math.max(meilleurScore, score)}/{questions.length}
          </p>
        )}
        <div className="mt-6 space-y-3">
          {reussi && onContinuer && (
            <Button size="cta" onClick={onContinuer}>
              Continuer <ArrowRight />
            </Button>
          )}
          <Button size="cta" variant={reussi ? "outline" : "default"} onClick={recommencer}>
            <RotateCcw /> Recommencer le quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[14px]">
        <span className="font-semibold text-marine">
          Question {index + 1} sur {questions.length}
        </span>
        <span className="text-muted-foreground">Score : {score}</span>
      </div>
      <BarreProgression valeur={((index + (repondu ? 1 : 0)) / questions.length) * 100} className="h-2" label="Avancement du quiz" />

      <fieldset className="mt-6" key={question.id}>
        <legend className="text-[20px] leading-snug font-bold text-marine">{question.enonce}</legend>
        <div className="mt-5 space-y-3">
          {question.choix.map((texte, i) => {
            const estBonne = i === question.bonneReponse;
            const estChoisie = i === choix;
            return (
              <button
                key={texte}
                type="button"
                onClick={() => repondre(i)}
                disabled={repondu}
                aria-pressed={estChoisie}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-2xl border-[1.5px] bg-card px-4 py-3 text-left text-[16px] font-medium text-marine transition-colors disabled:cursor-default",
                  !repondu && "border-border active:border-orange-bord active:bg-orange-doux",
                  repondu && estBonne && "border-vert bg-vert-doux",
                  repondu && estChoisie && !estBonne && "border-destructive bg-destructive/10",
                  repondu && !estBonne && !estChoisie && "border-border opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-[14px] font-bold",
                    repondu && estBonne
                      ? "bg-vert text-white dark:text-[#0b1424]"
                      : repondu && estChoisie
                        ? "bg-destructive text-white"
                        : "bg-muted text-marine",
                  )}
                  aria-hidden="true"
                >
                  {repondu && estBonne ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : repondu && estChoisie ? (
                    <X className="size-4" strokeWidth={3} />
                  ) : (
                    LETTRES[i]
                  )}
                </span>
                <span className="flex-1">{texte}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {repondu && (
        <div
          role="status"
          className={cn(
            "mt-5 animate-in rounded-2xl p-4 fade-in slide-in-from-bottom-2",
            juste ? "bg-vert-doux" : "bg-destructive/10",
          )}
        >
          <p className={cn("font-bold", juste ? "text-vert" : "text-destructive")}>
            {juste ? "Bonne réponse\u00a0!" : "Pas tout à fait…"}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-foreground/85">{question.explication}</p>
        </div>
      )}

      <Button size="cta" className="mt-6" disabled={!repondu} onClick={suivante}>
        {index + 1 < questions.length ? "Question suivante" : "Voir mon score"} <ArrowRight />
      </Button>
    </div>
  );
}
