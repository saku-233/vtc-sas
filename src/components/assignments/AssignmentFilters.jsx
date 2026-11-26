import { cn } from "@/lib/utils";

const FILTERS = ["All", "Not Started", "In Progress", "Submitted", "Graded"];

export default function AssignmentFilters({ active, counts, onChange }) {
  return (
    <div className="-mx-1 flex items-center gap-1 overflow-x-auto py-1">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-200",
            active === filter
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {filter}
          <span className={cn("ml-1.5 text-[11px]", active === filter ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
            {counts[filter] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}