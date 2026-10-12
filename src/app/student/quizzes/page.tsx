import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, QuizStatus } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { StudentQuizBrowser } from "@/components/student/StudentQuizBrowser";

export default async function StudentQuizzesPage() {
  const session = await requireRole([Role.STUDENT, Role.ADMIN]);

  const quizzes = await prisma.quiz.findMany({
    where: { status: QuizStatus.PUBLISHED },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Available Quizzes"
        description="Browse all published quizzes across subjects and start your assessment"
      />

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Examinations</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} currently available for attempts.
        </p>
      </div>

      <StudentQuizBrowser quizzes={quizzes} />
    </div>
  );
}

