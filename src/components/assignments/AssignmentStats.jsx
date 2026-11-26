const STATS = [
  { key: "open", label: "To do", hint: "Not started or in progress" },
  { key: "soon", label: "Due within 7 days", hint: "Needs priority" },
  { key: "submitted", label: "Submitted", hint: "Includes graded" },
];

export default function AssignmentStats({ summary }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {STATS.map((stat) => (
        <div key={stat.key} className="rounded-2xl border border-border/80 bg-card px-5 py-4">
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd className="mt-1.5 font-heading text-[26px] leading-none text-foreground">
            {summary[stat.key] ?? 0}
          </dd>
          <p className="mt-1 text-[11px] text-muted-foreground/80">{stat.hint}</p>
        </div>
      ))}
    </dl>
  );
}