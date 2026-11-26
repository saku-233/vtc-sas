import { BarChart3 } from "lucide-react";

const SUBMITTED = new Set(["Submitted", "Graded"]);

function parseGrade(g) {
  if (!g) return null;
  const n = parseFloat(g);
  return Number.isFinite(n) ? n : null;
}

export default function SubjectStatsPanel({ courses, assignments }) {
  const rows = courses
    .map((c) => {
      const items = assignments.filter((a) => a.courseCode === c.code);
      const total = items.length;
      const submitted = items.filter((a) => SUBMITTED.has(a.status)).length;
      const rate = total ? Math.round((submitted / total) * 100) : 0;
      const graded = items
        .map((a) => parseGrade(a.grade))
        .filter((n) => n !== null);
      const avg = graded.length ? Math.round((graded.reduce((s, n) => s + n, 0) / graded.length) * 10) / 10 : null;
      return { code: c.code, name: c.name, color: c.color, total, submitted, rate, avg };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.rate - a.rate || b.total - a.total);

  const allTotal = rows.reduce((s, r) => s + r.total, 0);
  const allSubmitted = rows.reduce((s, r) => s + r.submitted, 0);
  const overallRate = allTotal ? Math.round((allSubmitted / allTotal) * 100) : 0;
  const allGraded = assignments
    .map((a) => parseGrade(a.grade))
    .filter((n) => n !== null);
  const overallAvg = allGraded.length ? Math.round((allGraded.reduce((s, n) => s + n, 0) / allGraded.length) * 10) / 10 : null;

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="font-heading text-lg text-foreground">Subject progress</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Submission rate and average grade per subject, so you can track your pace.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary/60 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Overall submission rate</p>
          <p className="mt-1 font-heading text-2xl text-foreground">
            {overallRate}<span className="text-base text-muted-foreground">%</span>
          </p>
        </div>
        <div className="rounded-xl bg-secondary/60 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Average grade</p>
          <p className="mt-1 font-heading text-2xl text-foreground">
            {overallAvg !== null ? overallAvg : "—"}
            {overallAvg !== null && <span className="text-base text-muted-foreground"> pts</span>}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No assignment data to analyze yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {rows.map((r) => (
            <li key={r.code}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{r.name}</span>
                <span className="text-muted-foreground">
                  {r.submitted}/{r.total} submitted · avg {r.avg !== null ? `${r.avg} pts` : "—"}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${r.rate}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}