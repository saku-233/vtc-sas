import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  ChevronDown,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

function isLinkActive(pathname, link) {
  if (link.exact) return pathname === link.to;
  if (link.to === "/") return false;
  return pathname === link.to || pathname.startsWith(link.to + "/");
}

export default function AppNav() {
  const { user, logout, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // 导航与主题按当前页面区域决定：学生区显示学生导航，教师区显示教师导航，
  // 其余区域才回退到用户角色。
  const isStudentArea = pathname.startsWith("/student");
  const isTeacherArea = pathname.startsWith("/teacher");
  const isTeacher = isTeacherArea || (!isStudentArea && user?.role === "admin");
  const links = user ? (isTeacher ? TEACHER_LINKS : STUDENT_LINKS) : [];
  const displayName = user?.email || user?.full_name || "?";
  const initial = displayName.charAt(0).toUpperCase();
  const brandTo = user ? (isTeacher ? "/teacher" : "/student/dashboard") : "/";
  const activeLink = links.find((l) => isLinkActive(pathname, l)) ?? links[0];
  // 平板优先露出的常用项，其余收进「更多」。
  const PRIMARY_COUNT = 3;
  const primaryLinks = links.slice(0, PRIMARY_COUNT);
  const moreLinks = links.slice(PRIMARY_COUNT);

  function renderInline(link) {
    const Icon = link.icon;
    return (
      <Link
        key={link.to}
        to={link.to}
        className="inline-flex shrink-0 items-center gap-[7px] rounded-full px-[11px] py-[10px] text-[13px] leading-[18px] whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-nav ease-nav active:scale-[.97] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px]"
        activeOptions={{ exact: !!link.exact }}
        activeProps={{ className: "bg-[#265e53] text-white shadow-[0_4px_10px_rgba(38,94,83,.2)] hover:bg-[#265e53] hover:text-white animate-[nav-settle_.55s_cubic-bezier(.2,.8,.2,1)_both]" }}
        inactiveProps={{ className: "text-[#6b7280] hover:bg-[#f1f5f4] hover:text-[#1f2937]" }}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
        {link.label}
      </Link>
    );
  }

  function renderItem(link) {
    const Icon = link.icon;
    const active = isLinkActive(pathname, link);
    return (
      <DropdownMenuItem
        key={link.to}
        asChild
        onSelect={() => navigate({ to: link.to })}
        className={`gap-2.5 rounded-lg px-3 py-2 text-[13px] outline-none transition-colors ${
          active
            ? "bg-[#e8f1ee] font-medium text-[#265e53]"
            : "text-[#4b5563] focus:bg-[#f1f5f4] focus:text-[#1f2937]"
        }`}
      >
        <button type="button" className="w-full">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {link.label}
        </button>
      </DropdownMenuItem>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-[22px] sm:py-[14px]">
        <Link
          to={brandTo}
          className="flex shrink-0 items-center gap-2.5 text-[#1f2937] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px]"
        >
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-[#265e53] text-[11px] font-bold tracking-[-0.04em] text-white">
            VS
          </span>
          <strong className="font-heading text-[15px] font-bold tracking-[0.12em] whitespace-nowrap text-[#1f2937]">
            VTC-SAS
          </strong>
        </Link>

        {links.length > 0 ? (
          <>
          {/* xl+：全部内联 */}
          <nav className="hidden flex-1 items-center justify-center gap-1.5 xl:flex">
            {links.map(renderInline)}
          </nav>
          {/* md–xl：首页等常用项内联 + 更多下拉 */}
          <div className="hidden flex-1 items-center justify-center gap-1.5 md:flex xl:hidden">
            {primaryLinks.map(renderInline)}
            {moreLinks.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full px-[11px] py-[10px] text-[13px] leading-[18px] text-[#6b7280] transition-[color,background-color,transform] duration-nav ease-nav hover:bg-[#f1f5f4] hover:text-[#1f2937] active:scale-[.97] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px] [[data-state=open]_&]:bg-[#265e53] [[data-state=open]_&]:text-white"
                  >
                    <span>更多</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-nav ease-nav [[data-state=open]>&]:rotate-180" strokeWidth={1.8} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  sideOffset={8}
                  className="min-w-[12rem] rounded-xl border-[#e5e7eb] p-1.5 shadow-[0_18px_44px_-24px_rgba(20,40,35,.45)]"
                >
                  {moreLinks.map(renderItem)}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
          {/* <md：整组下拉 */}
          <div className="flex flex-1 justify-center md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#265e53] px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_4px_10px_rgba(38,94,83,.18)] transition-[background-color,transform] duration-nav ease-nav hover:bg-[#1f4a42] active:scale-[.97] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px]"
                >
                  <Menu className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                  <span className="max-w-[8.5rem] truncate">
                    {activeLink?.label ?? "菜单"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-nav ease-nav [[data-state=open]>&]:rotate-180" strokeWidth={1.8} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={8}
                className="min-w-[12rem] rounded-xl border-[#e5e7eb] p-1.5 shadow-[0_18px_44px_-24px_rgba(20,40,35,.45)]"
              >
                {links.map(renderItem)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </>
        ) : (
          <div className="flex-1" />
        )}

        {user ? (
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f1ee] text-[13px] font-bold text-[#265e53]"
              title={displayName}
            >
              {initial}
            </span>
            <span className="hidden text-[11px] whitespace-nowrap text-[#6b7280] md:block">
              {isTeacher ? "教师" : "学生"}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d9e2df] bg-white px-2.5 py-2 text-xs whitespace-nowrap text-[#4b5563] transition-[color,border-color,background-color,transform] duration-nav ease-nav hover:border-[#9ac7ba] hover:bg-[#f7fbf9] hover:text-[#265e53] active:scale-[.97] focus-visible:outline-[3px_solid_#9ac7ba] focus-visible:outline-offset-[3px] sm:px-3"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span className="hidden sm:inline">退出</span>
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