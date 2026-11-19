const STATS = [
  { key: "open", label: "待完成", hint: "未开始或进行中" },
  { key: "soon", label: "七天内截止", hint: "需要优先处理" },
  { key: "submitted", label: "已提交", hint: "含已评分" },
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