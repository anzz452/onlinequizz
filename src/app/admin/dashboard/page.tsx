import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, AttemptStatus } from "@prisma/client";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ArrowRight,
} from "lucide-react";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { formatScore, formatPercentage } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await requireRole([Role.ADMIN]);

  // Aggregate global platform statistics
  const [
    totalUsers,
    totalTeachers,
    totalStudents,
    totalQuizzes,
    totalAttempts,
    recentAttempts,
    quizzesBySubject,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.TEACHER } }),
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.quiz.count(),
    prisma.quizAttempt.count({
      where: { status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] } },
    }),
    prisma.quizAttempt.findMany({
      where: { status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] } },
      include: {
        quiz: { select: { title: true, totalMarks: true, passingMarks: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
    prisma.quiz.groupBy({
      by: ["subject"],
      _count: { id: true },
    }),
  ]);

  const barChartData = quizzesBySubject.map((s) => ({
    name: s.subject,
    count: s._count.id,
  }));

  const pieChartData = [
    { name: "Students", value: totalStudents, color: "#3b82f6" },
    { name: "Teachers", value: totalTeachers, color: "#f59e0b" },
    { name: "Admins", value: Math.max(1, totalUsers - totalStudents - totalTeachers), color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Admin Control Center"
        description="Global academic assessment system oversight, user management, and institutional metrics"
      />

      {/* Greeting and Quick Links */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Administration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics across all departments, instructors, and student candidates.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </Button>
          </Link>
          <Link href="/admin/quizzes">
            <Button size="sm" className="gap-1.5 text-xs">
              <BookOpen className="h-4 w-4" />
              <span>All Quizzes</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">
              {totalStudents} Students, {totalTeachers} Faculty
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Faculty
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalTeachers}</div>
            <p className="text-xs text-slate-500 mt-1">Quiz instructors</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Quizzes
            </CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuizzes}</div>
            <p className="text-xs text-slate-500 mt-1">Created on the platform</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Attempts
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalAttempts}</div>
            <p className="text-xs text-slate-500 mt-1">Recorded assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts
        barData={barChartData}
        barTitle="Quizzes by Subject Department"
        barDescription="Distribution of exams across academic subjects"
        pieData={pieChartData}
        pieTitle="User Role Distribution"
        pieDescription="Platform breakdown between students, teachers, and admins"
      />

      {/* Recent Submissions Feed */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Platform Assessments</CardTitle>
            <CardDescription>Latest examination completions across all departments</CardDescription>
          </div>
          <Link href="/admin/results">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <span>View All Results</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentAttempts.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No assessments recorded yet.</p>
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
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentAttempts.map((a) => {
                    const isPassed = (a.score || 0) >= a.quiz.passingMarks;
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          <div>{a.student.name}</div>
                          <div className="text-xs text-slate-400">{a.student.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{a.quiz.title}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {formatScore(a.score)} / {a.quiz.totalMarks}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {formatPercentage(a.percentage)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isPassed ? "success" : "destructive"}>
                            {isPassed ? "Passed" : "Failed"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleTimeString() : ""}
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

