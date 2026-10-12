"use client";

import * as React from "react";
import { logoutAction } from "@/actions/auth";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export function LogoutButton({ className, showText = true }: LogoutButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50",
        className
      )}
      title="Log out"
    >
      <LogOut className="h-4 w-4" />
      {showText && <span>{isPending ? "Logging out..." : "Log Out"}</span>}
    </button>
  );
}

