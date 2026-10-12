import * as React from "react";
import { SessionUser } from "@/types";


interface DashboardHeaderProps {
  user: SessionUser;
  title: string;
  description?: string;
}

export function DashboardHeader({ user, title, description }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
          <span className="text-[10px] text-slate-400">{user.email}</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

