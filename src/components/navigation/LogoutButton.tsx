"use client";

import * as React from "react";
import { logoutAction } from "@/actions/auth";
import { LogOut, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export function LogoutButton({ className, showText = true }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50",
          className
        )}
        title="Log out"
      >
        <LogOut className="h-4 w-4" />
        {showText && <span>Log Out</span>}
      </button>

      <Dialog
        isOpen={showConfirm}
        onClose={() => !isPending && setShowConfirm(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to end your current session?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3.5 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-100 dark:border-red-900/40">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
            <p>
              You will be signed out of your account and redirected back to the login screen.
            </p>
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isPending}
              onClick={handleLogout}
              className="gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isPending ? "Logging out..." : "Yes, Log Out"}</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
