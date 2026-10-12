import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { QuestionBuilder } from "@/components/teacher/QuestionBuilder";

export const dynamic = "force-dynamic";

interface QuestionsPageProps {
  params: {
    id: string;
  };
}

export default async function QuizQuestionsPage({ params }: QuestionsPageProps) {
  const session = await requireRole([Role.TEACHER, Role.ADMIN]);

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        include: {
          options: true,
        },
        orderBy: { order: "asc" },
      },
    },
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
        title="Manage Questions"
        description={`Authoring questions for ${quiz.title}`}
      />
      <QuestionBuilder quiz={quiz} />
    </div>
  );
}

