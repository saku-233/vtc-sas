import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const LINKS = [
  { to: "/", label: "首页" },
  { to: "/courses", label: "我的课程" },
  { to: "/assignments", label: "我的作业" },
  { to: "/attendance", label: "出席" },
  { to: "/chat", label: "Chatbot" },
  { to: "/reminders", label: "提醒" },
  { to: "/minigame", label: "课程巩固" },
  { to: "/profile", label: "我的档案" },
  { to: "/teacher", label: "教师后台" },
];

export default function AppNav() {
  const { user, logout } = useAuth();
  const initial = (user?.email || user?.full_name || "?").charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:gap-10 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-[11px] font-semibold tracking-tight text-primary-foreground">
            VS
          </span>
          <strong className="font-heading text-[15px] font-semibold tracking-[0.16em] text-foreground">
            VTC-SAS
          </strong>
        </Link>

        <nav className="-mx-1 flex flex-1 items-center gap-0.5 overflow-x-auto py-1">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
              activeProps={{ className: "bg-secondary font-medium text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="hidden h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:grid"
              title={user.email}
            >
              {initial}
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              {user.role === "admin" ? "教师" : "学生"}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              退出
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}