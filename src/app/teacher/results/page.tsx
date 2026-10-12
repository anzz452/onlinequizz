import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, AttemptStatus } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatScore, formatPercentage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeacherResultsPage({
  searchParams,
}: {
  searchParams?: { quizId?: string };
}) {
  const session = await requireRole([Role.TEACHER, Role.ADMIN]);

  // Fetch teacher's quizzes for filter dropdown
  const teacherQuizzes = await prisma.quiz.findMany({
    where: { teacherId: session.userId },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const selectedQuizId = searchParams?.quizId;

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quiz: {
        teacherId: session.userId,
        ...(selectedQuizId ? { id: selectedQuizId } : {}),
      },
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
      student: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const totalAttempts = attempts.length;
  const passedCount = attempts.filter((a) => (a.score || 0) >= a.quiz.passingMarks).length;
  const avgPercentage =
    totalAttempts > 0
      ? attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttempts
      : 0;

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Student Performance & Results"
        description="Review student exam scores, pass rates, and individual submissions"
      />

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Evaluated Submissions
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {totalAttempts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Average Class Score
            </span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatPercentage(avgPercentage)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Pass Rate
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {totalAttempts > 0 ? formatPercentage((passedCount / totalAttempts) * 100) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Exam Submissions</CardTitle>
              <CardDescription>Records of students who have completed your quizzes</CardDescription>
            </div>

            {/* Filter by Quiz */}
            <form method="GET" className="flex items-center gap-2">
              <select
                name="quizId"
                defaultValue={selectedQuizId || ""}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">All Quizzes</option>
                {teacherQuizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Filter
              </button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No results found for the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Quiz</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attempts.map((a) => {
                    const isPassed = (a.score || 0) >= a.quiz.passingMarks;
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                          <div>{a.student.name}</div>
                          <div className="text-xs text-slate-400">{a.student.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {a.quiz.title}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {a.quiz.subject}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {formatScore(a.score)} / {a.quiz.totalMarks}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {formatPercentage(a.percentage)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Badge variant={isPassed ? "success" : "destructive"}>
                              {isPassed ? "Passed" : "Failed"}
                            </Badge>
                            {a.status === AttemptStatus.TIMED_OUT && (
                              <Badge variant="secondary" className="text-[10px]">
                                Timed Out
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "N/A"}
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

