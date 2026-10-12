import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, AttemptStatus } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatScore, formatPercentage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const session = await requireRole([Role.ADMIN]);

  const statusFilter = searchParams?.status;

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] },
      ...(statusFilter ? { status: statusFilter as AttemptStatus } : {}),
    },
    include: {
      quiz: {
        select: {
          title: true,
          subject: true,
          totalMarks: true,
          passingMarks: true,
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

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Institutional Results"
        description="Comprehensive audit of all examination attempts completed by students"
      />

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Master Results Ledger</CardTitle>
              <CardDescription>
                Showing {attempts.length} evaluated attempt {attempts.length === 1 ? "record" : "records"}
              </CardDescription>
            </div>

            <form method="GET" className="flex items-center gap-2">
              <select
                name="status"
                defaultValue={statusFilter || ""}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="TIMED_OUT">Timed Out</option>
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
              No results found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
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
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
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
                          <Badge variant={isPassed ? "success" : "destructive"}>
                            {isPassed ? "Passed" : "Failed"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={a.status === AttemptStatus.TIMED_OUT ? "warning" : "secondary"}>
                            {a.status}
                          </Badge>
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

