import { Link } from "@tanstack/react-router";

export default function SectionPending({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <h2 className="font-heading text-xl text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      <Link
        to="/assignments"
        className="mt-6 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        先看我的作业
      </Link>
    </div>
  );
}