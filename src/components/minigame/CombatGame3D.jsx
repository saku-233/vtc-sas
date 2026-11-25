import { useEffect, useRef, useState } from "react";
import { QUIZ_QUESTIONS, MAX_HP, QUESTION_TIME } from "./quizData";
import Game3DScene from "./Game3DScene";
import QuizStart from "./QuizStart";
import QuizResult from "./QuizResult";

export default function CombatGame3D({ fullscreen = false }) {
  const [phase, setPhase] = useState("idle");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [hits, setHits] = useState(0);
  const [remaining, setRemaining] = useState(QUESTION_TIME);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const sceneRef = useRef(null);
  const locked = useRef(false);

  function start() {
    setPhase("active");
    setQIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHp(MAX_HP);
    setHits(0);
    setPicked(null);
    setFeedback(null);
    setRemaining(QUESTION_TIME);
    locked.current = false;
    sceneRef.current?.reset();
  }

  useEffect(() => {
    if (phase !== "active") return;
    setRemaining(QUESTION_TIME);
    setPicked(null);
    setFeedback(null);
    locked.current = false;
    sceneRef.current?.reset();
    const startT = Date.now();
    const id = setInterval(() => {
      if (locked.current) return; // pause countdown while aiming after a pick
      const left = QUESTION_TIME - (Date.now() - startT) / 1000;
      if (left <= 0) {
        clearInterval(id);
        if (!locked.current) {
          locked.current = true;
          resolveAnswer(null, 0);
        }
      } else {
        setRemaining(left);
      }
    }, 80);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex]);

  function resolveAnswer(pickedIdx, timeLeft) {
    const q = QUIZ_QUESTIONS[qIndex];
    const correct = pickedIdx === q.answer;
    setPicked(pickedIdx);
    setFeedback(correct ? "hit" : "miss");

    if (pickedIdx === null) {
      sceneRef.current?.shake?.();
    } else {
      sceneRef.current?.fireAt(pickedIdx, correct);
    }

    let nextHp = hp;
    let nextCombo = combo;
    if (correct) {
      nextCombo = combo + 1;
      const mult = Math.min(5, 1 + Math.floor((nextCombo - 1) / 2));
      const gained = (100 + Math.round(Math.max(0, timeLeft) * 10)) * mult;
      setScore((s) => s + gained);
      setMaxCombo((m) => Math.max(m, nextCombo));
    } else {
      nextCombo = 0;
      nextHp = hp - 1;
      setHits((h) => h + 1);
      setHp(nextHp);
    }
    setCombo(nextCombo);

    const end = nextHp <= 0 || qIndex + 1 >= QUIZ_QUESTIONS.length;
    setTimeout(() => {
      if (end) setPhase("over");
      else setQIndex((i) => i + 1);
    }, 950);
  }

  function choose(i) {
    if (locked.current) return;
    locked.current = true;
    sceneRef.current?.lockOn?.(i);
    setTimeout(() => resolveAnswer(i, remaining), 1500);
  }

  const q = QUIZ_QUESTIONS[qIndex];
  const pct = Math.max(0, (remaining / QUESTION_TIME) * 100);
  const low = remaining <= 5;

  return (
    <section
      className={`relative w-full overflow-hidden bg-black transition-colors ${
        fullscreen ? "h-full" : "h-[74vh] min-h-[560px] rounded-2xl border"
      } ${
        fullscreen
          ? feedback === "hit"
            ? "ring-2 ring-emerald-400/70"
            : feedback === "miss"
            ? "ring-2 ring-red-500/70"
            : ""
          : feedback === "hit"
          ? "border-emerald-400/70"
          : feedback === "miss"
          ? "border-red-500/70"
          : "border-primary/40"
      }`}
    >
      <Game3DScene ref={sceneRef} />

      {/* cockpit corner brackets */}
      {phase === "active" && (
        <div className="pointer-events-none absolute inset-3 z-10 sm:inset-5">
          <span className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-cyan-300/50" />
          <span className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-cyan-300/50" />
          <span className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-cyan-300/50" />
          <span className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-cyan-300/50" />
        </div>
      )}



      {/* top status strip */}
      {phase === "active" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-5">
          <div className="flex items-start justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-white/90">
            <div className="flex flex-col gap-0.5">
              <span className="text-cyan-300">
                TGT {String(qIndex + 1).padStart(2, "0")} / {String(QUIZ_QUESTIONS.length).padStart(2, "0")}
              </span>
              <span className="text-[9px] tracking-[0.3em] text-white/40">F-15EX · MISSION</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-cyan-300">COMBO ×{Math.min(5, 1 + Math.floor(combo / 2))}</span>
              <span className="text-[9px] tracking-[0.3em] text-white/40">CHAIN</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-cyan-300">SCORE {String(score).padStart(5, "0")}</span>
              <span className="text-[9px] tracking-[0.3em] text-white/40">POINTS</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">T-MINUS</span>
            <div className="h-2 flex-1 overflow-hidden rounded-sm bg-white/10">
              <div
                className={`h-full rounded-sm transition-[width] duration-75 ${low ? "bg-red-500 shadow-[0_0_10px_0] shadow-red-500/70" : "bg-cyan-300"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`font-mono text-xs tabular-nums ${low ? "text-red-400" : "text-white/80"}`}>
              {remaining.toFixed(1)}s
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80">HULL</span>
            <div className="flex flex-1 gap-1">
              {Array.from({ length: MAX_HP }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-[1px] transition-all ${
                    i < hp ? "bg-red-500 shadow-[0_0_8px_0] shadow-red-500/60" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* bottom-left telemetry readout */}
      {phase === "active" && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-cyan-300/60 sm:block">
          <p>ALT 14,000 FT</p>
          <p>SPD 0.92 M</p>
          <p>HDG 270°</p>
        </div>
      )}

      {/* question + options — side panel on desktop, bottom on mobile */}
      {phase === "active" && (
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:bottom-4 sm:inset-x-auto sm:left-1/2 sm:w-[380px] sm:-translate-x-1/2 sm:p-4">
          <div className="rounded-2xl border border-cyan-300/30 bg-slate-900/75 p-4 backdrop-blur-md">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">{q.subject}</p>
            <p className="mt-1.5 font-heading text-base text-white">{q.question}</p>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const reveal = picked !== null;
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={reveal}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition-all ${
                      isPicked
                        ? feedback === "hit"
                          ? "border-emerald-400 bg-emerald-400/15"
                          : "border-red-500 bg-red-500/15"
                        : "border-white/20 bg-white/5 hover:-translate-y-0.5 hover:border-cyan-300/50"
                    } ${reveal ? "opacity-50" : ""}`}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/10 font-mono text-xs text-cyan-200">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-[12px] leading-tight text-white">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* start overlay */}
      {phase === "idle" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/65 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-primary/25 bg-background/95 p-6 shadow-2xl">
            <QuizStart onStart={start} />
          </div>
        </div>
      )}

      {/* result overlay */}
      {phase === "over" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/65 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-primary/25 bg-background/95 p-6 shadow-2xl">
            <QuizResult
              score={score}
              maxCombo={maxCombo}
              hits={hits}
              total={QUIZ_QUESTIONS.length}
              onRestart={start}
            />
          </div>
        </div>
      )}
    </section>
  );
}