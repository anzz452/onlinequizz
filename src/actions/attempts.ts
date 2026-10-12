"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { calculateQuizScore, isAttemptExpired } from "@/lib/scoring";
import { Role, QuizStatus, AttemptStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface AttemptStartResult {
  success?: boolean;
  attemptId?: string;
  error?: string;
}

export interface SaveAnswerResult {
  success?: boolean;
  isExpired?: boolean;
  error?: string;
}

export interface SubmitAttemptResult {
  success?: boolean;
  attemptId?: string;
  isExpired?: boolean;
  score?: number;
  percentage?: number;
  error?: string;
}

export async function startQuizAttemptAction(quizId: string): Promise<AttemptStartResult> {
  const user = await requireRole([Role.STUDENT]);

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: { select: { questions: true } },
      },
    });

    if (!quiz) {
      return { error: "Quiz not found." };
    }

    if (quiz.status !== QuizStatus.PUBLISHED) {
      return { error: "This quiz is not currently available for attempts." };
    }

    if (quiz._count.questions === 0) {
      return { error: "This quiz has no questions available." };
    }

    const now = new Date();
    if (quiz.startAt && now < quiz.startAt) {
      return { error: `This quiz is scheduled to open on ${quiz.startAt.toLocaleString()}.` };
    }
    if (quiz.endAt && now > quiz.endAt) {
      return { error: `This quiz closed on ${quiz.endAt.toLocaleString()}.` };
    }

    // Check if user already has an active IN_PROGRESS attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId: user.userId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    if (existingAttempt) {
      // Check if that existing attempt has already expired
      if (isAttemptExpired(existingAttempt.expiresAt, now)) {
        // Auto-finalize the expired attempt
        await finalizeExpiredAttempt(existingAttempt.id);
      } else {
        // Return existing active attempt
        return { success: true, attemptId: existingAttempt.id };
      }
    }

    // Create a new attempt
    const expiresAt = new Date(now.getTime() + quiz.durationMinutes * 60 * 1000);

    const newAttempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: user.userId,
        startedAt: now,
        expiresAt,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    revalidatePath(`/student/attempts/${newAttempt.id}`);
    revalidatePath("/student/dashboard");
    return { success: true, attemptId: newAttempt.id };
  } catch (error) {
    console.error("Start quiz attempt error:", error);
    return { error: "Failed to initialize quiz attempt." };
  }
}

export async function saveAnswerAction(
  attemptId: string,
  questionId: string,
  selectedOptionId: string | null
): Promise<SaveAnswerResult> {
  const user = await requireRole([Role.STUDENT]);

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) return { error: "Attempt not found." };
    if (attempt.studentId !== user.userId) return { error: "Unauthorized attempt access." };

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return { error: "This attempt has already been submitted or finalized." };
    }

    const now = new Date();
    if (isAttemptExpired(attempt.expiresAt, now)) {
      await finalizeExpiredAttempt(attemptId);
      return { isExpired: true, error: "Time has expired for this quiz." };
    }

    if (selectedOptionId) {
      await prisma.studentAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId,
          },
        },
        create: {
          attemptId,
          questionId,
          selectedOptionId,
        },
        update: {
          selectedOptionId,
        },
      });
    } else {
      // If student unselected option
      await prisma.studentAnswer.deleteMany({
        where: {
          attemptId,
          questionId,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Save answer error:", error);
    return { error: "Failed to save answer choice." };
  }
}

export async function submitQuizAttemptAction(attemptId: string): Promise<SubmitAttemptResult> {
  const user = await requireRole([Role.STUDENT]);

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) return { error: "Attempt not found." };
    if (attempt.studentId !== user.userId) return { error: "Unauthorized." };

    // Idempotent: If already submitted, return existing result
    if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.TIMED_OUT) {
      return {
        success: true,
        attemptId: attempt.id,
        score: attempt.score ?? 0,
        percentage: attempt.percentage ?? 0,
      };
    }

    const now = new Date();
    const expired = isAttemptExpired(attempt.expiresAt, now);
    const finalStatus = expired ? AttemptStatus.TIMED_OUT : AttemptStatus.SUBMITTED;

    // Server-authoritative calculation
    const scoringResult = calculateQuizScore(
      attempt.quiz.questions,
      attempt.answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
      })),
      attempt.quiz.passingMarks
    );

    // Save final scores and answer breakdown in a database transaction
    await prisma.$transaction(async (tx) => {
      // Update each student answer with isCorrect and marksAwarded
      for (const scored of scoringResult.answers) {
        if (scored.selectedOptionId) {
          await tx.studentAnswer.upsert({
            where: {
              attemptId_questionId: {
                attemptId,
                questionId: scored.questionId,
              },
            },
            create: {
              attemptId,
              questionId: scored.questionId,
              selectedOptionId: scored.selectedOptionId,
              isCorrect: scored.isCorrect,
              marksAwarded: scored.marksAwarded,
            },
            update: {
              isCorrect: scored.isCorrect,
              marksAwarded: scored.marksAwarded,
            },
          });
        }
      }

      // Update attempt status, score, percentage, submittedAt
      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          status: finalStatus,
          submittedAt: now,
          score: scoringResult.score,
          percentage: scoringResult.percentage,
        },
      });
    });

    revalidatePath(`/student/results/${attemptId}`);
    revalidatePath("/student/history");
    revalidatePath("/student/dashboard");
    revalidatePath("/teacher/results");

    return {
      success: true,
      attemptId,
      isExpired: expired,
      score: scoringResult.score,
      percentage: scoringResult.percentage,
    };
  } catch (error) {
    console.error("Submit quiz attempt error:", error);
    return { error: "Failed to submit quiz attempt." };
  }
}

async function finalizeExpiredAttempt(attemptId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            include: { options: true },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt || attempt.status !== AttemptStatus.IN_PROGRESS) return;

  const scoringResult = calculateQuizScore(
    attempt.quiz.questions,
    attempt.answers.map((a) => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
    })),
    attempt.quiz.passingMarks
  );

  await prisma.$transaction(async (tx) => {
    for (const scored of scoringResult.answers) {
      if (scored.selectedOptionId) {
        await tx.studentAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: scored.questionId,
            },
          },
          create: {
            attemptId,
            questionId: scored.questionId,
            selectedOptionId: scored.selectedOptionId,
            isCorrect: scored.isCorrect,
            marksAwarded: scored.marksAwarded,
          },
          update: {
            isCorrect: scored.isCorrect,
            marksAwarded: scored.marksAwarded,
          },
        });
      }
    }

    await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.TIMED_OUT,
        submittedAt: new Date(),
        score: scoringResult.score,
        percentage: scoringResult.percentage,
      },
    });
  });
}

