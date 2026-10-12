import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  ShieldAlert,
  BookOpen,
  Users,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-950">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Generation College Assessment Platform</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                Online Quiz & Examination System for Higher Education
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 sm:text-xl font-normal leading-relaxed">
                Empower educators with dynamic quiz building and automated scoring. Provide students with timed, distraction-free assessments and immediate performance analytics.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link href="/register">
                  <Button size="lg" className="gap-2 shadow-md">
                    <span>Create Free Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="shadow-sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Everything required for academic assessments
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Engineered with strict server-side evaluation, multi-choice question builders, and transparent reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 mb-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <CardTitle>Intuitive Quiz Builder</CardTitle>
                  <CardDescription>
                    Teachers can construct quizzes with custom question weights, four options, shuffle preferences, and draft modes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Dynamic options & answer selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Automated total marks calculation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Publishing validations & previews</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-300 mb-2">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle>Synchronized Timed Exams</CardTitle>
                  <CardDescription>
                    Live countdown timer with server-authoritative deadline validation, preventing expired answer tampering.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Automatic submission on expiration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Single active attempt enforcement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Instant autosaving of student selections</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300 mb-2">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <CardTitle>Academic Analytics</CardTitle>
                  <CardDescription>
                    Visual performance reports, pass/fail ratios, class averages, and question-level review for faculty.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Interactive Recharts visualizations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Comprehensive attempt history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Admin oversight of all portal activity</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Roles Breakdown */}
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Designed for the Whole Academic Hierarchy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 mb-4">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Administrator</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Global system oversight. View and toggle user accounts, monitor system health, inspect all assessments and institutional metrics.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Teacher</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Author rich quizzes with multiple-choice questions, set time limits, publish drafts, and track student scores and performance statistics.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Browse open quizzes, take timed assessments with instant autosave, submit work, and review breakdown cards and attempt history.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <div className="container mx-auto px-4">
          <p>© 2026 AcademiQuiz. Designed for Higher Education Academic Assessment.</p>
          <p className="mt-1">Powered by Next.js App Router, Prisma ORM, and Neon Serverless PostgreSQL.</p>
        </div>
      </footer>
    </div>
  );
}
