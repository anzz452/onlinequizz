"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PlusCircle,
  FileCheck2,
  UserCircle,
  History,
  GraduationCap,
  BookCheck,
  Menu,
  X,
} from "lucide-react";
import { Role } from "@prisma/client";
import { SessionUser } from "@/types";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  user: SessionUser;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  let navItems: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [];

  if (user.role === Role.ADMIN) {
    navItems = [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User Management", href: "/admin/users", icon: Users },
      { label: "All Quizzes", href: "/admin/quizzes", icon: BookOpen },
      { label: "Platform Results", href: "/admin/results", icon: FileCheck2 },
    ];
  } else if (user.role === Role.TEACHER) {
    navItems = [
      { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
      { label: "My Quizzes", href: "/teacher/quizzes", icon: BookOpen },
      { label: "Create Quiz", href: "/teacher/quizzes/create", icon: PlusCircle },
      { label: "Student Results", href: "/teacher/results", icon: FileCheck2 },
      { label: "My Profile", href: "/teacher/profile", icon: UserCircle },
    ];
  } else if (user.role === Role.STUDENT) {
    navItems = [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "Available Quizzes", href: "/student/quizzes", icon: BookCheck },
      { label: "Attempt History", href: "/student/history", icon: History },
      { label: "My Profile", href: "/student/profile", icon: UserCircle },
    ];
  }

  const roleBadgeVariant =
    user.role === Role.ADMIN
      ? "destructive"
      : user.role === Role.TEACHER
      ? "warning"
      : "default";

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">AcademiQuiz</span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">College Portal</span>
          </div>
        </div>

        {/* User Card */}
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed in as</span>
              <Badge variant={roleBadgeVariant} className="text-[10px] uppercase font-bold py-0">
                {user.role}
              </Badge>
            </div>
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/teacher/dashboard" && item.href !== "/admin/dashboard" && item.href !== "/student/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <LogoutButton className="w-full justify-start" />
        </div>
      </aside>
    </>
  );
}

