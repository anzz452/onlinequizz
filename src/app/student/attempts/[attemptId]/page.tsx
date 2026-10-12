import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, AttemptStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { QuizTakingInterface } from "@/components/student/QuizTakingInterface";
import { isAttemptExpired } from "@/lib/scoring";
import { submitQuizAttemptAction } from "@/actions/attempts";

export const dynamic = "force-dynamic";

interface AttemptPageProps {
  params: {
    attemptId: string;
  };
}

export default async function QuizAttemptPage({ params }: AttemptPageProps) {
  const session = await requireRole([Role.STUDENT, Role.ADMIN]);

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: {
                select: {
                  id: true,
                  optionText: true,
                  // NOTE: NEVER SELECT isCorrect HERE! Protects exam answers from client-side inspection!
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt) {
    notFound();
  }

  // Ensure only the student who owns the attempt (or admin) can access
  if (attempt.studentId !== session.userId && session.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  // If already submitted or timed out, redirect to results view
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    redirect(`/student/results/${attempt.id}`);
  }

  // Check if server time has already passed expiresAt
  const now = new Date();
  if (isAttemptExpired(attempt.expiresAt, now)) {
    await submitQuizAttemptAction(attempt.id);
    redirect(`/student/results/${attempt.id}`);
  }

  // Prepare initial answers map: questionId -> selectedOptionId
  const initialAnswers: Record<string, string> = {};
  attempt.answers.forEach((ans) => {
    if (ans.selectedOptionId) {
      initialAnswers[ans.questionId] = ans.selectedOptionId;
    }
  });

  // Prepare questions (optionally shuffle if quiz.shuffleQuestions is true)
  let questionsToTake = attempt.quiz.questions;
  if (attempt.quiz.shuffleQuestions) {
    // Deterministic pseudo-random shuffle based on attempt.id seed
    questionsToTake = [...questionsToTake].sort((a, b) => {
      const hashA = (a.id + attempt.id).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = (b.id + attempt.id).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return hashA - hashB;
    });
  }

  return (
    <div className="max-w-5xl mx-auto py-2">
      <QuizTakingInterface
        attemptId={attempt.id}
        expiresAt={attempt.expiresAt.toISOString()}
        quiz={{
          id: attempt.quiz.id,
          title: attempt.quiz.title,
          subject: attempt.quiz.subject,
          durationMinutes: attempt.quiz.durationMinutes,
          totalMarks: attempt.quiz.totalMarks,
          questions: questionsToTake,
        }}
        initialAnswers={initialAnswers}
      />
    </div>
  );
}

