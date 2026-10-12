import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, QuizStatus, AttemptStatus } from "@prisma/client";
import Link from "next/link";
import {
  BookCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatScore, formatPercentage, formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await requireRole([Role.STUDENT, Role.ADMIN]);

  // Aggregate stats for this student
  const [availableQuizzes, studentAttempts] = await Promise.all([
    prisma.quiz.findMany({
      where: { status: QuizStatus.PUBLISHED },
      include: {
        _count: { select: { questions: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.quizAttempt.findMany({
      where: {
        studentId: session.userId,
        status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] },
      },
      include: {
        quiz: {
          select: {
            title: true,
            totalMarks: true,
            passingMarks: true,
            subject: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const totalCompleted = studentAttempts.length;
  const passedAttempts = studentAttempts.filter(
    (a) => (a.score || 0) >= a.quiz.passingMarks
  );
  const passRate = totalCompleted > 0 ? (passedAttempts.length / totalCompleted) * 100 : 0;
  const avgPercentage =
    totalCompleted > 0
      ? studentAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalCompleted
      : 0;

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Student Dashboard"
        description="Monitor your ongoing assessments, view grades, and browse open quizzes"
      />

      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Welcome, {session.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keep track of your academic performance and upcoming examination deadlines.
          </p>
        </div>
        <Link href="/student/quizzes">
          <Button className="gap-2 shadow-sm">
            <BookCheck className="h-4 w-4" />
            <span>Browse Quizzes</span>
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Quizzes
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalCompleted}</div>
            <p className="text-xs text-slate-500 mt-1">Submitted attempts</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Score
            </CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPercentage(avgPercentage)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all completed quizzes</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pass Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalCompleted > 0 ? formatPercentage(passRate) : "N/A"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {passedAttempts.length} of {totalCompleted} passed
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Available Quizzes
            </CardTitle>
            <BookCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {availableQuizzes.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Ready to take now</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Available Quizzes & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Quizzes Section */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available Quizzes</CardTitle>
              <CardDescription>Open examinations ready for participation</CardDescription>
            </div>
            <Link href="/student/quizzes">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {availableQuizzes.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No quizzes are currently published.</p>
            ) : (
              <div className="space-y-3">
                {availableQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          {quiz.subject}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatDuration(quiz.durationMinutes)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {quiz.totalMarks} Marks | {quiz._count.questions} Questions | By {quiz.teacher.name}
                      </p>
                    </div>

                    <Link href={`/student/quizzes/${quiz.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs">
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results Section */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Quiz Results</CardTitle>
              <CardDescription>Your latest examination scores and outcomes</CardDescription>
            </div>
            <Link href="/student/history">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <span>Full History</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {studentAttempts.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">You have not taken any quizzes yet.</p>
            ) : (
              <div className="space-y-3">
                {studentAttempts.slice(0, 4).map((a) => {
                  const isPassed = (a.score || 0) >= a.quiz.passingMarks;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={isPassed ? "success" : "destructive"} className="text-[10px]">
                            {isPassed ? "Passed" : "Failed"}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {a.quiz.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Score: {formatScore(a.score)} / {a.quiz.totalMarks} ({formatPercentage(a.percentage)})
                        </p>
                      </div>

                      <Link href={`/student/results/${a.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Breakdown
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

