import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, AttemptStatus } from "@prisma/client";
import Link from "next/link";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatScore, formatPercentage } from "@/lib/utils";
import { History, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentHistoryPage() {
  const session = await requireRole([Role.STUDENT, Role.ADMIN]);

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: session.userId,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] },
    },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          subject: true,
          totalMarks: true,
          passingMarks: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Attempt History"
        description="Review all completed examinations and archived performance scores"
      />

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Examination Log</CardTitle>
          <CardDescription>
            Showing {attempts.length} completed examination {attempts.length === 1 ? "attempt" : "attempts"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <History className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No attempts logged yet</p>
              <p className="text-xs text-slate-400 mt-1">Take an available quiz to view your score history here.</p>
              <div className="mt-4">
                <Link href="/student/quizzes">
                  <Button size="sm">Browse Available Quizzes</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Date Taken</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attempts.map((a) => {
                    const isPassed = (a.score || 0) >= a.quiz.passingMarks;
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {a.quiz.title}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {a.quiz.subject}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "N/A"}
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
                          <Link href={`/student/results/${a.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-blue-600">
                              <span>Details</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
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

