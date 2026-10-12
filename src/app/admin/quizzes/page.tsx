import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { AdminQuizList } from "@/components/admin/AdminQuizList";

export default async function AdminQuizzesPage() {
  const session = await requireRole([Role.ADMIN]);

  const quizzes = await prisma.quiz.findMany({
    include: {
      teacher: { select: { name: true, email: true } },
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
        title="All Quizzes"
        description="Global repository of assessments created across all academic subjects"
      />

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examination Catalog</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Total of {quizzes.length} examinations registered in the database.
        </p>
      </div>

      <AdminQuizList quizzes={quizzes} />
    </div>
  );
}

