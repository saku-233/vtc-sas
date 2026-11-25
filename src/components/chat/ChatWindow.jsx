import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Cpu, Send } from "lucide-react";
import { askGemini } from "@/lib/server-fns";

const SUGGESTIONS = ["我最近有什么作业到期？", "本周课程时间表", "我的出席率怎样？"];

const ENGINES = [
  { id: "gemini", label: "Gemini", icon: Sparkles, hint: "云端 AI，按数据智能回答" },
  { id: "local", label: "本地AI", icon: Cpu, hint: "即时规则匹配，无需联网" },
];

export default function ChatWindow({ courses, assignments, attendance }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "你好！我可以帮你查看作业、课程和出席。选择上方引擎，试试下面的问题或直接输入。" },
  ]);
  const [input, setInput] = useState("");
  const [engine, setEngine] = useState("gemini");
  const [pending, setPending] = useState(false);
  const askGeminiFn = useServerFn(askGemini);

  function answer(q) {
    if (q.includes("作业") || q.includes("截止") || q.includes("到期")) {
      const open = assignments
        .filter((a) => !["已提交", "已评分"].includes(a.status))
        .slice()
        .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""))
        .slice(0, 3);
      if (!open.length) return "暂时没有未完成的作业 🎉";
      return "最近的待办作业：\n" + open.map((a) => `• ${a.title}（${a.courseCode}）— 截止 ${a.due}`).join("\n");
    }
    if (q.includes("出席") || q.includes("attendance")) {
      const total = attendance.length;
      const present = attendance.filter((a) => a.status === "出席").length;
      const rate = total ? Math.round((present / total) * 100) : 0;
      return `本学期出席率 ${rate}%（出席 ${present} / 共 ${total} 节）。`;
    }
    if (q.includes("课") || q.includes("时间") || q.includes("节")) {
      return "本周课程：\n" + courses.map((c) => `• ${c.name}（${c.code}）— ${c.scheduleDay} ${c.startTime}–${c.endTime}`).join("\n");
    }
    return "你可以问我：作业到期、课程时间或出席率。";
  }

  function send(text) {
    const q = (text ?? input).trim();
    if (!q || pending) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");

    if (engine === "local") {
      setMessages((m) => [...m, { role: "assistant", text: answer(q) }]);
      return;
    }

    setPending(true);
    askGeminiFn({ data: { question: q } })
      .then((res) => setMessages((m) => [...m, { role: "assistant", text: res }]))
      .catch(() =>
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "抱歉，Gemini 暂时无法回应，请稍后再试或切换到本地AI。" },
        ])
      )
      .finally(() => setPending(false));
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col rounded-2xl border border-border/80 bg-card">
      {/* engine selector */}
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        {ENGINES.map((e) => {
          const Icon = e.icon;
          const active = engine === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setEngine(e.id)}
              disabled={pending}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${pending ? "opacity-60" : ""}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {e.label}
            </button>
          );
        })}
        <span className="ml-1 hidden text-xs text-muted-foreground/80 sm:inline">
          {ENGINES.find((e) => e.id === engine)?.hint}
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <p
              className={
                m.role === "user"
                  ? "max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                  : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm text-secondary-foreground"
              }
            >
              {m.text}
            </p>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <p className="rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
              Gemini 思考中…
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/70 px-4 pt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={pending}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-border/70 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题…"
          disabled={pending}
          className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary/50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="发送"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}