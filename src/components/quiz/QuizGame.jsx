import { useEffect, useRef, useState } from "react";
import { Crosshair, Timer, Flame, Trophy, RotateCcw, Plane, Target, Zap, X } from "lucide-react";

const QUESTION_TIME = 15;

const QUESTIONS = [
  {
    intel: "识别目标机型：F-22 的官方绰号是？",
    options: ["Raptor", "Eagle", "Falcon", "Lightning"],
    answer: 0,
  },
  {
    intel: "飞行参数：「Mach 1」指的是哪种速度？",
    options: ["光速", "音速", "风速", "转速"],
    answer: 1,
  },
  {
    intel: "历史档案：首位突破音障的飞行员是？",
    options: ["阿姆斯特朗", "林白", "Chuck Yeager", "奥维尔·莱特"],
    answer: 2,
  },
  {
    intel: "战术代号：「BVR」代表哪种交战方式？",
    options: ["超视距", "视距内", "近距缠斗", "低空突防"],
    answer: 0,
  },
  {
    intel: "机动解析：哪种机动通过半筋斗加半滚转实现反向爬升？",
    options: ["桶滚", "眼镜机动", "Immelmann 翻转", "分离机动"],
    answer: 2,
  },
  {
    intel: "战区设定：Ace Combat 系列故事发生在哪颗虚构星球？",
    options: ["Strangereal", "Earth", "Gaia", "Usea"],
    answer: 0,
  },
  {
    intel: "通讯协议：战斗机呼号「Fox」用于通报什么？",
    options: ["发现敌机", "请求加油", "投放导弹", "返航"],
    answer: 2,
  },
  {
    intel: "机型识别：F-35 的垂直起降型号代号是？",
    options: ["F-35A", "F-35B", "F-35C", "F-35D"],
    answer: 1,
  },
];

const RANKS = [
  { min: 1600, grade: "S", label: "王牌飞行员" },
  { min: 1100, grade: "A", label: "精英射手" },
  { min: 700, grade: "B", label: "合格飞行员" },
  { min: 0, grade: "C", label: "新兵归航" },
];

const RANK_COLOR = { S: "text-amber-300", A: "text-cyan-300", B: "text-emerald-300", C: "text-rose-300" };

function getRank(score) {
  return RANKS.find((r) => score >= r.min);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Reticle({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="32" cy="32" r="26" strokeDasharray="4 4" opacity="0.5" />
      <circle cx="32" cy="32" r="14" opacity="0.7" />
      <path d="M32 2v12M32 50v12M2 32h12M50 32h12" />
      <circle cx="32" cy="32" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Launcher({ onEngage }) {
  return (
    <button
      onClick={onEngage}
      className="group relative w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 to-slate-900 p-5 text-left transition-all hover:border-cyan-400/60 hover:shadow-[0_0_30px_-12px_rgba(34,211,238,0.6)]"
    >
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300">
          <Crosshair className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-400/70">STRIKE MISSION</p>
          <h3 className="font-heading text-base text-cyan-50">速答演练 · 限时积分挑战</h3>
          <p className="mt-0.5 truncate text-xs text-slate-400">在作业间隙起飞，击落目标、累积分数、挑战王牌评级。</p>
        </div>
        <span className="shrink-0 rounded-full border border-cyan-400/50 px-3 py-1.5 font-mono text-xs text-cyan-200 transition-colors group-hover:bg-cyan-400/10">
          ENGAGE ›
        </span>
      </div>
    </button>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2">
      <Icon className={`h-4 w-4 ${tone}`} />
      <div className="leading-tight">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
        <p className="font-mono text-sm text-cyan-100">{value}</p>
      </div>
    </div>
  );
}

export default function QuizGame() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Launcher onEngage={() => setOpen(true)} />
      {open ? <GameOverlay onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function GameOverlay({ onClose }) {
  const [questions] = useState(() => shuffle(QUESTIONS).slice(0, 8));
  const [phase, setPhase] = useState("briefing");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null); // { correct, gained, choice }
  const answer = useRef(null);

  function choose(choice) {
    if (locked) return;
    setLocked(true);
    const q = questions[index];
    const correct = choice === q.answer;
    let gained = 0;
    let newStreak = 0;
    if (correct) {
      gained = 100 + timeLeft * 10 + streak * 20;
      newStreak = streak + 1;
      setScore((s) => s + gained);
      setHits((h) => h + 1);
      setMaxStreak((m) => Math.max(m, newStreak));
    }
    setStreak(newStreak);
    setResult({ correct, gained, choice });
  }

  answer.current = choose;

  // countdown
  useEffect(() => {
    if (phase !== "playing" || locked) return;
    if (timeLeft <= 0) {
      answer.current(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, locked, timeLeft]);

  // keyboard 1-4
  useEffect(() => {
    if (phase !== "playing" || locked) return;
    const onKey = (e) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) answer.current(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, locked, index]);

  function next() {
    if (index + 1 >= questions.length) {
      setPhase("results");
      return;
    }
    setIndex((i) => i + 1);
    setTimeLeft(QUESTION_TIME);
    setLocked(false);
    setResult(null);
  }

  function restart() {
    setPhase("playing");
    setIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setHits(0);
    setTimeLeft(QUESTION_TIME);
    setLocked(false);
    setResult(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 font-mono backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950 shadow-[0_0_60px_-15px_rgba(34,211,238,0.45)]">
        {/* HUD corner ticks */}
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-cyan-400/60" />
          <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-cyan-400/60" />
          <span className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-cyan-400/60" />
          <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-cyan-400/60" />
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-200"
          aria-label="退出任务"
        >
          <X className="h-4 w-4" />
        </button>

        {phase === "briefing" && <Briefing onStart={restart} />}

        {phase === "playing" && (
          <Play
            questions={questions}
            index={index}
            score={score}
            streak={streak}
            timeLeft={timeLeft}
            locked={locked}
            result={result}
            onChoose={choose}
            onNext={next}
          />
        )}

        {phase === "results" && (
          <Results score={score} hits={hits} total={questions.length} maxStreak={maxStreak} onRestart={restart} onExit={onClose} />
        )}
      </div>
    </div>
  );
}

function Briefing({ onStart }) {
  return (
    <div className="p-8 sm:p-10">
      <div className="flex items-center gap-3">
        <Reticle className="h-9 w-9 text-cyan-400" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/70">MISSION BRIEFING</p>
          <h2 className="font-heading text-xl text-cyan-50">OPERATION · 学生苍穹</h2>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-slate-300">
        飞行员，欢迎登机。本任务为限时速答演练：每道题 <span className="text-cyan-300">{QUESTION_TIME} 秒</span>，
        命中目标得分，剩余时间越多奖励越高，连击可叠加分数倍率。超时或脱靶则连击清零。
      </p>
      <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
        <li>· 基础命中 100 分，时间奖励 = 剩余秒数 × 10</li>
        <li>· 连击奖励 = 当前连击数 × 20 分</li>
        <li>· 全部目标清除后按总分评定飞行评级 S / A / B / C</li>
        <li>· 可用键盘 1–4 快速锁定选项</li>
      </ul>
      <button
        onClick={onStart}
        className="mt-7 inline-flex items-center gap-2 rounded-lg border border-cyan-400/60 bg-cyan-500/10 px-6 py-2.5 text-sm uppercase tracking-[0.2em] text-cyan-200 transition-all hover:bg-cyan-400/20 hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.7)]"
      >
        <Plane className="h-4 w-4" /> ENGAGE
      </button>
    </div>
  );
}

function Play({ questions, index, score, streak, timeLeft, locked, result, onChoose, onNext }) {
  const q = questions[index];
  const pct = Math.max(0, (timeLeft / QUESTION_TIME) * 100);
  const barColor = timeLeft <= 4 ? "bg-rose-500" : timeLeft <= 8 ? "bg-amber-400" : "bg-cyan-400";
  const optionLetter = ["A", "B", "C", "D"];

  return (
    <div className="p-6 sm:p-8">
      {/* HUD bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Stat icon={Crosshair} label="SCORE" value={score.toLocaleString()} tone="text-cyan-300" />
        <Stat icon={Flame} label="STREAK" value={`x${streak}`} tone="text-amber-300" />
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2">
          <Timer className="h-4 w-4 text-cyan-300" />
          <span className={`font-mono text-sm tabular-nums ${timeLeft <= 4 ? "text-rose-300" : "text-cyan-100"}`}>
            {String(timeLeft).padStart(2, "0")}s
          </span>
        </div>
      </div>

      {/* target / progress */}
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-cyan-400" /> TARGET {index + 1} / {questions.length}</span>
        <span className={timeLeft <= 4 ? "text-rose-400" : "text-slate-500"}>{timeLeft <= 4 ? "WARNING · 即将脱靶" : "LOCK ON"}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full ${barColor} transition-[width] duration-1000 ease-linear`} style={{ width: `${pct}%` }} />
      </div>

      {/* intel / question */}
      <div className="mt-5 rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/60">INTEL</p>
        <p className="mt-1.5 font-heading text-base leading-relaxed text-cyan-50">{q.intel}</p>
      </div>

      {/* options */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = result?.choice === i;
          let cls = "border-cyan-500/25 bg-slate-900/40 hover:border-cyan-400/60 hover:bg-slate-800/60";
          if (locked) {
            if (isAnswer) cls = "border-emerald-400/70 bg-emerald-500/15 text-emerald-100";
            else if (isPicked) cls = "border-rose-500/70 bg-rose-500/15 text-rose-100";
            else cls = "border-slate-700/50 bg-slate-900/30 opacity-50";
          }
          return (
            <button
              key={i}
              disabled={locked}
              onClick={() => onChoose(i)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm text-cyan-50 transition-all ${cls}`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded border border-cyan-400/40 font-mono text-[11px] text-cyan-300">
                {optionLetter[i]}
              </span>
              <span className="flex-1">{opt}</span>
              {locked && isAnswer ? <Zap className="h-4 w-4 text-emerald-300" /> : null}
            </button>
          );
        })}
      </div>

      {/* feedback */}
      {locked && result && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-cyan-500/20 bg-slate-900/60 px-4 py-3">
          <div className="flex items-center gap-2">
            {result.correct ? (
              <>
                <Crosshair className="h-5 w-5 text-emerald-300" />
                <span className="font-mono text-sm uppercase tracking-widest text-emerald-300">TARGET DESTROYED</span>
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-rose-300" />
                <span className="font-mono text-sm uppercase tracking-widest text-rose-300">
                  {result.choice === null ? "TARGET ESCAPED · 超时" : "MISS · 脱靶"}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">+{result.gained} pts</span>
            <button
              onClick={onNext}
              className="rounded-md border border-cyan-400/50 px-3 py-1.5 text-cyan-200 transition-colors hover:bg-cyan-400/10"
            >
              {index + 1 >= questions.length ? "任务结算 ›" : "下一目标 ›"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Results({ score, hits, total, maxStreak, onRestart, onExit }) {
  const rank = getRank(score);
  const accuracy = Math.round((hits / total) * 100);
  return (
    <div className="p-8 text-center sm:p-10">
      <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/70">MISSION COMPLETE</p>
      <div className="mt-4 flex items-center justify-center gap-4">
        <Reticle className="h-12 w-12 text-cyan-400" />
        <div>
          <p className={`font-heading text-6xl leading-none ${RANK_COLOR[rank.grade]}`}>{rank.grade}</p>
          <p className={`mt-1 font-mono text-xs uppercase tracking-widest ${RANK_COLOR[rank.grade]}`}>{rank.label}</p>
        </div>
        <Reticle className="h-12 w-12 text-cyan-400" />
      </div>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">
        <Stat icon={Trophy} label="SCORE" value={score.toLocaleString()} tone="text-amber-300" />
        <Stat icon={Crosshair} label="命中" value={`${hits}/${total}`} tone="text-cyan-300" />
        <Stat icon={Flame} label="最高连击" value={`x${maxStreak}`} tone="text-amber-300" />
      </div>
      <p className="mt-3 font-mono text-xs text-slate-400">命中率 {accuracy}%</p>

      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/60 bg-cyan-500/10 px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-cyan-200 transition-all hover:bg-cyan-400/20"
        >
          <RotateCcw className="h-4 w-4" /> 再战
        </button>
        <button
          onClick={onExit}
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-slate-300 transition-colors hover:bg-slate-800"
        >
          返航
        </button>
      </div>
    </div>
  );
}