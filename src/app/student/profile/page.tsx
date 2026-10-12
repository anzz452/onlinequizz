import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, AttemptStatus } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Award, BookCheck } from "lucide-react";
import { formatPercentage } from "@/lib/utils";

export default async function StudentProfilePage() {
  const session = await requireRole([Role.STUDENT, Role.ADMIN]);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: session.userId,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] },
    },
    include: {
      quiz: { select: { passingMarks: true } },
    },
  });

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => (a.score || 0) >= a.quiz.passingMarks);
  const avgPercentage =
    totalAttempts > 0
      ? attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttempts
      : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <DashboardHeader
        user={session}
        title="Student Profile"
        description="Your academic student profile and cumulative achievements"
      />

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 text-2xl font-bold dark:bg-blue-950 dark:text-blue-300">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <Badge variant="default">{user?.role}</Badge>
              </div>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <BookCheck className="h-5 w-5 text-blue-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Quizzes Taken</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {totalAttempts}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Quizzes Passed</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {passedAttempts.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Cumulative Average</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatPercentage(avgPercentage)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Enrolled Since</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {user ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

