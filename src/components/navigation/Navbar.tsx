import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await getSession();

  let dashboardUrl = "/student/dashboard";
  if (session?.role === "ADMIN") dashboardUrl = "/admin/dashboard";
  else if (session?.role === "TEACHER") dashboardUrl = "/teacher/dashboard";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 dark:text-white leading-none">AcademiQuiz</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">University Assessment Portal</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {session ? (
            <Link href={dashboardUrl}>
              <Button size="sm" className="gap-2">
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5">
                  <span>Sign Up</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

