import { useState } from "react";
import { Send } from "lucide-react";

const SUGGESTIONS = ["我最近有什么作业到期？", "本周课程时间表", "我的出席率怎样？"];

export default function ChatWindow({ courses, assignments, attendance }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "你好！我可以帮你查看作业、课程和出席。试试下面的问题，或直接输入。" },
  ]);
  const [input, setInput] = useState("");

  function answer(q) {
    if (q.includes("作业") || q.includes("截止") || q.includes("到期")) {
      const open = assignments
        .filter((a) => !["已提交", "已评分"].includes(a.status))
        .slice()
        .sort((a, b) => a.due.localeCompare(b.due))
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
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: answer(q) }]);
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col rounded-2xl border border-border/80 bg-card">
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
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/70 px-4 pt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
          className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          aria-label="发送"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}