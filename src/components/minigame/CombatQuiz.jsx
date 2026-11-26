import { useState } from "react";
import { QUIZ_QUESTIONS, MAX_HP, QUESTION_TIME, scoreToRank } from "./quizData";
import QuizStart from "./QuizStart";
import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";

export default function CombatQuiz() {
  const [phase, setPhase] = useState("idle");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [hits, setHits] = useState(0);
  const [destroyed, setDestroyed] = useState(0);

  function start() {
    setPhase("active");
    setQIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHp(MAX_HP);
    setHits(0);
    setDestroyed(0);
  }

  function handleAnswer(picked, timeLeft) {
    const q = QUIZ_QUESTIONS[qIndex];
    const correct = picked === q.answer;
    let nextHp = hp;
    let nextCombo = combo;
    if (correct) {
      nextCombo = combo + 1;
      const multiplier = Math.min(5, 1 + Math.floor((nextCombo - 1) / 2));
      const gained = (100 + Math.round(Math.max(0, timeLeft) * 10)) * multiplier;
      setScore((s) => s + gained);
      setMaxCombo((m) => Math.max(m, nextCombo));
      setDestroyed((d) => d + 1);
    } else {
      nextCombo = 0;
      nextHp = hp - 1;
      setHits((h) => h + 1);
      setHp(nextHp);
    }
    setCombo(nextCombo);

    if (nextHp <= 0 || qIndex + 1 >= QUIZ_QUESTIONS.length) {
      setPhase("over");
      return;
    }
    setQIndex((i) => i + 1);
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/5 to-card p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(var(--primary))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          COURSE PRACTICE · MINIGAME
        </div>
        {phase === "idle" && <QuizStart onStart={start} />}
        {phase === "active" && (
          <QuizQuestion
            question={QUIZ_QUESTIONS[qIndex]}
            index={qIndex}
            total={QUIZ_QUESTIONS.length}
            score={score}
            combo={combo}
            hp={hp}
            onAnswer={handleAnswer}
            duration={QUESTION_TIME}
          />
        )}
        {phase === "over" && (
          <QuizResult
            score={score}
            maxCombo={maxCombo}
            hits={hits}
            destroyed={destroyed}
            total={QUIZ_QUESTIONS.length}
            onRestart={start}
          />
        )}
      </div>
    </section>
  );
}