export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="flex flex-col gap-6 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary/70">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 font-heading text-[30px] leading-[1.18] tracking-tight text-foreground sm:text-[38px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}