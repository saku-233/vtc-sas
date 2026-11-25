import { Plane, Target, Heart, Zap } from "lucide-react";

export default function QuizStart({ onStart }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_-6px_hsl(var(--primary))]">
        <Plane className="h-7 w-7" />
      </span>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary/70">SIMULATION</p>
        <h3 className="mt-1 font-heading text-2xl text-foreground">战斗测验 · 知识空战</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          在限时内击落每个目标（答对题目）。速度越快、连击越高，得分越多。生命归零任务终止。
        </p>
      </div>
      <div className="grid w-full max-w-sm grid-cols-3 gap-3 text-left">
        <div className="rounded-xl border border-border/70 bg-background/40 p-3">
          <Target className="h-4 w-4 text-primary" />
          <p className="mt-1 text-xs text-muted-foreground">目标</p>
          <p className="font-mono text-sm text-foreground">10</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3">
          <Heart className="h-4 w-4 text-red-500" />
          <p className="mt-1 text-xs text-muted-foreground">生命</p>
          <p className="font-mono text-sm text-foreground">3</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3">
          <Zap className="h-4 w-4 text-yellow-500" />
          <p className="mt-1 text-xs text-muted-foreground">限时</p>
          <p className="font-mono text-sm text-foreground">15s</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="rounded-full bg-primary px-8 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.03]"
      >
        起飞 · Launch
      </button>
    </div>
  );
}