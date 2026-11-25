import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  LogIn,
  Home,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  MessageSquare,
  Bell,
  Gamepad2,
  User,
  Eye,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useViewAs } from "@/lib/ViewAsContext";

const STUDENT_LINKS = [
  { to: "/", label: "首页", icon: Home, exact: true },
  { to: "/student/dashboard", label: "仪表板", icon: LayoutDashboard },
  { to: "/student/courses", label: "我的课程", icon: BookOpen },
  { to: "/student/assignments", label: "我的作业", icon: ClipboardList },
  { to: "/student/attendance", label: "出席", icon: CalendarCheck },
  { to: "/student/chat", label: "Chatbot", icon: MessageSquare },
  { to: "/student/reminders", label: "提醒", icon: Bell },
  { to: "/minigame", label: "课程巩固", icon: Gamepad2 },
  { to: "/student/profile", label: "我的档案", icon: User },
];

const TEACHER_LINKS = [
  { to: "/teacher", label: "首页", icon: Home, exact: true },
  { to: "/teacher/courses", label: "我的课程", icon: BookOpen },
  { to: "/teacher/assignments", label: "我发布的作业", icon: ClipboardList },
  { to: "/teacher/attendance", label: "出席", icon: CalendarCheck },
  { to: "/teacher/chat", label: "Chatbot", icon: MessageSquare },
  { to: "/teacher/reminders", label: "提醒", icon: Bell },
  { to: "/teacher/profile", label: "我的档案", icon: User },
];

const LINK_BASE =
  "inline-flex shrink-0 items-center gap-[7px] rounded-full px-[11px] py-[10px] text-[13px] leading-[18px] whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-nav ease-nav active:scale-[.97] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px]";
const LINK_INACTIVE = "text-[#6b7280] hover:bg-[#f1f5f4] hover:text-[#1f2937]";
const LINK_ACTIVE =
  "bg-[#265e53] text-white shadow-[0_4px_10px_rgba(38,94,83,.2)] hover:bg-[#265e53] hover:text-white animate-[nav-settle_.55s_cubic-bezier(.2,.8,.2,1)_both]";

export default function AppNav() {
  const { user, logout, navigateToLogin } = useAuth();
  const { viewAs, clearViewAs } = useViewAs();
  const navigate = useNavigate();
  // 以某用户身份查看时，导航栏按该用户的角色呈现。
  const effectiveRole = viewAs?.role ?? user?.role;
  const isTeacher = effectiveRole === "admin";
  const links = user ? (isTeacher ? TEACHER_LINKS : STUDENT_LINKS) : [];
  const displayName = viewAs?.email || user?.email || user?.full_name || "?";
  const initial = displayName.charAt(0).toUpperCase();
  const brandTo = user ? (isTeacher ? "/teacher" : "/student/dashboard") : "/";

  function exitViewAs() {
    clearViewAs();
    navigate({ to: "/admin" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-[22px] py-[14px]">
        <Link to={brandTo} className="flex shrink-0 items-center gap-2.5 text-[#1f2937] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px]">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-[#265e53] text-[11px] font-bold tracking-[-0.04em] text-white">
            VS
          </span>
          <strong className="font-heading text-[15px] font-bold tracking-[0.12em] whitespace-nowrap text-[#1f2937]">
            VTC-SAS
          </strong>
        </Link>

        {links.length > 0 ? (
          <nav className="flex flex-1 items-center justify-center gap-1.5 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: !!link.exact }}
                  className={LINK_BASE}
                  activeProps={{ className: LINK_ACTIVE }}
                  inactiveProps={{ className: LINK_INACTIVE }}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        {user ? (
          <div className="flex shrink-0 items-center gap-2.5">
            {viewAs ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7ed] px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-[#9a3412]"
                title={`正在以 ${viewAs.email} 身份查看`}
              >
                <Eye className="h-3.5 w-3.5" />
                {viewAs.email}
              </span>
            ) : null}
            <span
              className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f1ee] text-[13px] font-bold text-[#265e53]"
              title={displayName}
            >
              {initial}
            </span>
            <span className="hidden text-[11px] whitespace-nowrap text-[#6b7280] sm:block">
              {isTeacher ? "教师" : "学生"}
            </span>
            {viewAs ? (
              <button
                type="button"
                onClick={exitViewAs}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-xs whitespace-nowrap text-[#9a3412] transition-[color,border-color,background-color,transform] duration-nav ease-nav hover:bg-[#ffedd5] active:scale-[.97]"
              >
                <X className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                退出查看
              </button>
            ) : null}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d9e2df] bg-white px-3 py-2 text-xs whitespace-nowrap text-[#4b5563] transition-[color,border-color,background-color,transform] duration-nav ease-nav hover:border-[#9ac7ba] hover:bg-[#f7fbf9] hover:text-[#265e53] active:scale-[.97] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px]"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              退出
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigateToLogin()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#265e53] px-4 py-2 text-xs font-medium text-white transition-opacity duration-nav hover:opacity-90 active:scale-[.97] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px]"
          >
            <LogIn className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
            登录
          </button>
        )}
      </div>
    </header>
  );
}