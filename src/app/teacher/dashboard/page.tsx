import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, QuizStatus, AttemptStatus } from "@prisma/client";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Users,
  Award,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { formatScore, formatPercentage } from "@/lib/utils";

export default async function TeacherDashboardPage() {
  const session = await requireRole([Role.TEACHER, Role.ADMIN]);

  // Aggregate stats for quizzes created by this teacher
  const [totalQuizzes, publishedQuizzes, attempts] = await Promise.all([
    prisma.quiz.count({ where: { teacherId: session.userId } }),
    prisma.quiz.count({
      where: { teacherId: session.userId, status: QuizStatus.PUBLISHED },
    }),
    prisma.quizAttempt.findMany({
      where: {
        quiz: { teacherId: session.userId },
        status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] },
      },
      include: {
        quiz: { select: { title: true, totalMarks: true, passingMarks: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalAttemptsCount = attempts.length;
  const averagePercentage =
    totalAttemptsCount > 0
      ? attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttemptsCount
      : 0;

  const passedAttemptsCount = attempts.filter(
    (a) => (a.score || 0) >= a.quiz.passingMarks
  ).length;

  // Chart data: Recent attempts per quiz
  const quizAttemptCountMap = new Map<string, number>();
  attempts.forEach((a) => {
    quizAttemptCountMap.set(a.quiz.title, (quizAttemptCountMap.get(a.quiz.title) || 0) + 1);
  });

  const barChartData = Array.from(quizAttemptCountMap.entries())
    .slice(0, 6)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.substring(0, 15) + "..." : name,
      count,
    }));

  const pieChartData = [
    { name: "Passed", value: passedAttemptsCount, color: "#10b981" },
    {
      name: "Failed",
      value: Math.max(0, totalAttemptsCount - passedAttemptsCount),
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Teacher Dashboard"
        description="Overview of your quizzes, student participation, and academic metrics"
      />

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back, {session.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor assessments, manage questions, and evaluate student achievements.
          </p>
        </div>
        <Link href="/teacher/quizzes/create">
          <Button className="gap-2 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Quiz</span>
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Quizzes
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuizzes}</div>
            <p className="text-xs text-slate-500 mt-1">Authored by you</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Published Quizzes
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{publishedQuizzes}</div>
            <p className="text-xs text-slate-500 mt-1">Currently open to students</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student Attempts
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalAttemptsCount}</div>
            <p className="text-xs text-slate-500 mt-1">Submitted submissions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Score
            </CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPercentage(averagePercentage)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Overall student pass rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts
        barData={barChartData}
        barTitle="Participation by Quiz"
        barDescription="Number of student submissions across your quizzes"
        pieData={pieChartData}
        pieTitle="Pass vs Fail Distribution"
        pieDescription="Overall student pass vs fail outcome"
      />

      {/* Recent Attempts Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Student Submissions</CardTitle>
            <CardDescription>Latest completed assessments across your quizzes</CardDescription>
          </div>
          <Link href="/teacher/results">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <span>View All Results</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No quiz attempts have been recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attempts.slice(0, 5).map((attempt) => {
                    const isPassed = (attempt.score || 0) >= attempt.quiz.passingMarks;
                    return (
                      <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          <div>{attempt.student.name}</div>
                          <div className="text-xs text-slate-400">{attempt.student.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {attempt.quiz.title}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {formatScore(attempt.score)} / {attempt.quiz.totalMarks}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {formatPercentage(attempt.percentage)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isPassed ? "success" : "destructive"}>
                            {isPassed ? "Passed" : "Failed"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

