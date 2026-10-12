import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Button } from "@/components/ui/button";
import { TeacherQuizList } from "@/components/teacher/TeacherQuizList";

export const dynamic = "force-dynamic";

export default async function TeacherQuizzesPage() {
  const session = await requireRole([Role.TEACHER, Role.ADMIN]);

  const quizzes = await prisma.quiz.findMany({
    where: { teacherId: session.userId },
    include: {
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="My Quizzes"
        description="Create, edit, publish, and manage questions for your examinations"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Authored Quizzes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You have created {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}.
          </p>
        </div>
        <Link href="/teacher/quizzes/create">
          <Button className="gap-2 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Quiz</span>
          </Button>
        </Link>
      </div>

      <TeacherQuizList quizzes={quizzes} />
    </div>
  );
}

