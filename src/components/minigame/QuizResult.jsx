import { RotateCcw, Award } from "lucide-react";
import { scoreToRank } from "./quizData";

export default function QuizResult({ score, maxCombo, hits, total, onRestart }) {
  const { rank, label } = scoreToRank(score);
  const destroyed = total - hits;

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <Award className="h-10 w-10 text-yellow-500" />
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">MISSION COMPLETE</p>
        <p className="mt-1 font-heading text-5xl text-primary">{rank}</p>
        <p className="font-mono text-sm tracking-[0.25em] text-foreground/80">{label}</p>
      </div>
      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/70 bg-background/40 p-3">
          <p className="text-xs text-muted-foreground">总分</p>
          <p className="font-mono text-lg text-foreground">{score}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3">
          <p className="text-xs text-muted-foreground">最高连击</p>
          <p className="font-mono text-lg text-foreground">×{maxCombo}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3">
          <p className="text-xs text-muted-foreground">击落</p>
          <p className="font-mono text-lg text-foreground">{destroyed}/{total}</p>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.03]"
      >
        <RotateCcw className="h-4 w-4" /> 再次出击
      </button>
    </div>
  );
}