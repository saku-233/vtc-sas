const STATUS_STYLE = {
  Present: "bg-[hsl(152_40%_92%)] text-[hsl(150_42%_26%)]",
  Late: "bg-[hsl(38_78%_92%)] text-[hsl(28_68%_30%)]",
  Excused: "bg-[hsl(262_28%_93%)] text-[hsl(262_28%_34%)]",
  Absent: "bg-[hsl(0_68%_94%)] text-[hsl(0_60%_38%)]",
};

export default function AttendanceSummary({ attendance }) {
  const total = attendance.length;
  const counts = { Present: 0, Late: 0, Excused: 0, Absent: 0 };
  attendance.forEach((row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  });
  const rate = total ? Math.round((counts.Present / total) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-border/80 bg-card px-5 py-4 sm:col-span-1">
        <dt className="text-xs text-muted-foreground">Attendance rate</dt>
        <dd className="mt-1.5 font-heading text-[26px] leading-none text-foreground">{rate}%</dd>
        <p className="mt-1 text-[11px] text-muted-foreground/80">Present {counts.Present} / {total} sessions</p>
      </div>
      {Object.entries(counts).map(([status, count]) => (
        <div key={status} className="rounded-2xl border border-border/80 bg-card px-5 py-4">
          <dt className="text-xs text-muted-foreground">{status}</dt>
          <dd className="mt-1.5 font-heading text-[26px] leading-none text-foreground">{count}</dd>
          <p className="mt-1 text-[11px] text-muted-foreground/80">This semester total</p>
        </div>
      ))}
    </div>
  );
}

export function AttendanceBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[status] ?? "bg-secondary text-secondary-foreground"}`}>
      {status}
    </span>
  );
}