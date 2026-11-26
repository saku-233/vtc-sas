import { useState } from "react";
import { Cpu, Send, Sparkles, BrainCircuit, Orbit } from "lucide-react";
import { localApi } from "@/api/localClient";

const SUGGESTIONS = ["What assignments are due soon?", "This week's course schedule", "How is my attendance?"];

const PROVIDERS = [
  { id: "local", label: "Local AI", icon: Cpu, hint: "Instant rule-based matching" },
  { id: "gemini", label: "Gemini", icon: Sparkles, hint: "Google AI" },
  { id: "deepseek", label: "DeepSeek", icon: BrainCircuit, hint: "DeepSeek AI" },
  { id: "grok", label: "Grok", icon: Orbit, hint: "xAI Grok" },
];

export default function ChatWindow({ courses, assignments, attendance }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I can help you check assignments, courses and attendance. Try a suggestion or type your own question." },
  ]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("local");
  const [pending, setPending] = useState(false);

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

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || pending) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");

    if (provider === "local") {
      setMessages((m) => [...m, { role: "assistant", text: answer(q) }]);
      return;
    }

    setPending(true);
    try {
      const answerText = await localApi.ai.chat(q, provider);
      setMessages((m) => [...m, { role: "assistant", text: answerText }]);
    } catch (error) {
      setMessages((m) => [...m, { role: "assistant", text: error.message || `${provider} is unavailable right now.` }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col rounded-2xl border border-border/80 bg-card">
      {/* AI provider selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
        {PROVIDERS.map((item) => {
          const Icon = item.icon;
          const active = provider === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setProvider(item.id)}
              disabled={pending}
              title={item.hint}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
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
              {PROVIDERS.find((item) => item.id === provider)?.label} is thinking…
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
          placeholder="Type your question…"
          className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}