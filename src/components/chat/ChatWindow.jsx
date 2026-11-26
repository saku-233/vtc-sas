import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Cpu, Send } from "lucide-react";
import { askGemini } from "@/lib/server-fns";

const SUGGESTIONS = ["What assignments are due soon?", "This week's course schedule", "How is my attendance?"];

const ENGINES = [
  { id: "gemini", label: "Gemini", icon: Sparkles, hint: "Cloud AI, answers from your data" },
  { id: "local", label: "Local AI", icon: Cpu, hint: "Instant rule-based matching, no network needed" },
];

export default function ChatWindow({ courses, assignments, attendance }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I can help you check assignments, courses and attendance. Pick an engine above and try a suggestion or type your own question." },
  ]);
  const [input, setInput] = useState("");
  const [engine, setEngine] = useState("gemini");
  const [pending, setPending] = useState(false);
  const askGeminiFn = useServerFn(askGemini);

  function answer(q) {
    const ql = q.toLowerCase();
    if (ql.includes("assignment") || ql.includes("due") || ql.includes("deadline")) {
      const open = assignments
        .filter((a) => !["Submitted", "Graded"].includes(a.status))
        .slice()
        .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""))
        .slice(0, 3);
      if (!open.length) return "No outstanding assignments right now 🎉";
      return "Upcoming assignments:\n" + open.map((a) => `• ${a.title} (${a.courseCode}) — due ${a.due}`).join("\n");
    }
    if (ql.includes("attendance") || ql.includes("present")) {
      const total = attendance.length;
      const present = attendance.filter((a) => a.status === "Present").length;
      const rate = total ? Math.round((present / total) * 100) : 0;
      return `This semester's attendance rate is ${rate}% (present ${present} / ${total} sessions).`;
    }
    if (ql.includes("course") || ql.includes("class") || ql.includes("schedule") || ql.includes("time")) {
      return "This week's courses:\n" + courses.map((c) => `• ${c.name} (${c.code}) — ${c.scheduleDay} ${c.startTime}–${c.endTime}`).join("\n");
    }
    return "You can ask me about: assignments due, course schedule, or attendance rate.";
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
          { role: "assistant", text: "Sorry, Gemini can't respond right now. Please try again later or switch to Local AI." },
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
              Gemini is thinking…
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
          placeholder="Type your question…"
          disabled={pending}
          className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary/50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}