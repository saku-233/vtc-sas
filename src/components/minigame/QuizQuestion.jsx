import { useEffect, useRef, useState } from "react";

export default function QuizQuestion({ question, index, total, score, combo, hp, onAnswer, duration }) {
  const [remaining, setRemaining] = useState(duration);
  const [picked, setPicked] = useState(null);
  const locked = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    setPicked(null);
    locked.current = false;
    const start = Date.now();
    const id = setInterval(() => {
      const left = duration - (Date.now() - start) / 1000;
      if (left <= 0) {
        clearInterval(id);
        if (!locked.current) {
          locked.current = true;
          onAnswer(null, 0);
        }
      } else {
        setRemaining(left);
      }
    }, 80);
    return () => clearInterval(id);
  }, [index]);

  function choose(i) {
    if (locked.current) return;
    locked.current = true;
    setPicked(i);
    onAnswer(i, remaining);
  }

  const pct = Math.max(0, (remaining / duration) * 100);
  const low = remaining <= 5;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-primary">TGT {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span>COMBO ×{Math.min(5, 1 + Math.floor(combo / 2))}</span>
        <span>SCORE {score}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-[width] duration-75 ${low ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`font-mono text-xs ${low ? "text-red-500" : "text-muted-foreground"}`}>
          {remaining.toFixed(1)}s
        </span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i < hp ? "bg-red-500" : "bg-secondary"}`} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-card p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/70">{question.subject}</p>
        <p className="mt-2 font-heading text-lg text-foreground">{question.question}</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const isPicked = picked === i;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`group flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                isPicked
                  ? "border-primary bg-primary/10"
                  : "border-border/70 bg-background/40 hover:-translate-y-0.5 hover:border-primary/40"
              } ${picked !== null ? "opacity-60" : ""}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary font-mono text-xs text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm text-foreground">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}