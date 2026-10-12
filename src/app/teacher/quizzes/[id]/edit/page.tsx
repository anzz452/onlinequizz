import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { QuizForm } from "@/components/teacher/QuizForm";

export const dynamic = "force-dynamic";

interface EditQuizPageProps {
  params: {
    id: string;
  };
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const session = await requireRole([Role.TEACHER, Role.ADMIN]);

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
  });

  if (!quiz) {
    notFound();
  }

  if (session.role === Role.TEACHER && quiz.teacherId !== session.userId) {
    redirect("/unauthorized");
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Edit Quiz Settings"
        description={`Modifying settings for ${quiz.title}`}
      />
      <div className="flex justify-center">
        <QuizForm
          mode="edit"
          initialData={{
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            subject: quiz.subject,
            durationMinutes: quiz.durationMinutes,
            passingMarks: quiz.passingMarks,
            shuffleQuestions: quiz.shuffleQuestions,
            showResultsImmediately: quiz.showResultsImmediately,
            startAt: quiz.startAt,
            endAt: quiz.endAt,
          }}
        />
      </div>
    </div>
  );
}

