import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, BookOpen, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherProfilePage() {
  const session = await requireRole([Role.TEACHER, Role.ADMIN]);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      _count: {
        select: { quizzesCreated: true },
      },
    },
  });

  const totalAttemptsCount = await prisma.quizAttempt.count({
    where: { quiz: { teacherId: session.userId } },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <DashboardHeader
        user={session}
        title="Teacher Profile"
        description="Your academic instructor profile details and account status"
      />

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 text-2xl font-bold dark:bg-amber-950 dark:text-amber-300">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <Badge variant="warning">{user?.role}</Badge>
              </div>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Quizzes Created</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {user?._count.quizzesCreated || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Student Attempts Received</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {totalAttemptsCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Member Since</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {user ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Mail className="h-5 w-5 text-slate-500" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Account Status</span>
                <span className="text-base font-bold text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

