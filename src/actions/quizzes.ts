"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { quizSchema, QuizInput } from "@/lib/validations";
import { Role, QuizStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createQuizAction(data: QuizInput): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  const validation = quizSchema.safeParse(data);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: "Validation failed.", fieldErrors };
  }

  try {
    const quiz = await prisma.quiz.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        subject: validation.data.subject,
        durationMinutes: validation.data.durationMinutes,
        passingMarks: validation.data.passingMarks,
        totalMarks: 0,
        status: QuizStatus.DRAFT,
        startAt: validation.data.startAt ? new Date(validation.data.startAt) : null,
        endAt: validation.data.endAt ? new Date(validation.data.endAt) : null,
        shuffleQuestions: validation.data.shuffleQuestions,
        showResultsImmediately: validation.data.showResultsImmediately,
        teacherId: user.userId,
      },
    });

    revalidatePath("/teacher/quizzes");
    revalidatePath("/teacher/dashboard");
    return { success: true, data: { id: quiz.id } };
  } catch (error) {
    console.error("Create quiz error:", error);
    return { error: "Failed to create quiz in the database." };
  }
}

export async function updateQuizAction(quizId: string, data: QuizInput): Promise<ActionResult> {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  const validation = quizSchema.safeParse(data);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: "Validation failed.", fieldErrors };
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return { error: "Quiz not found." };
    }

    if (user.role === Role.TEACHER && quiz.teacherId !== user.userId) {
      return { error: "You are not authorized to modify this quiz." };
    }

    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: validation.data.title,
        description: validation.data.description,
        subject: validation.data.subject,
        durationMinutes: validation.data.durationMinutes,
        passingMarks: validation.data.passingMarks,
        startAt: validation.data.startAt ? new Date(validation.data.startAt) : null,
        endAt: validation.data.endAt ? new Date(validation.data.endAt) : null,
        shuffleQuestions: validation.data.shuffleQuestions,
        showResultsImmediately: validation.data.showResultsImmediately,
      },
    });

    revalidatePath(`/teacher/quizzes/${quizId}/edit`);
    revalidatePath("/teacher/quizzes");
    return { success: true };
  } catch (error) {
    console.error("Update quiz error:", error);
    return { error: "Failed to update quiz." };
  }
}

export async function togglePublishQuizAction(quizId: string): Promise<ActionResult> {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) return { error: "Quiz not found." };
    if (user.role === Role.TEACHER && quiz.teacherId !== user.userId) {
      return { error: "You are not authorized to publish/unpublish this quiz." };
    }

    if (quiz.status === QuizStatus.PUBLISHED) {
      // Unpublish quiz
      await prisma.quiz.update({
        where: { id: quizId },
        data: { status: QuizStatus.DRAFT },
      });
      revalidatePath("/teacher/quizzes");
      revalidatePath("/student/quizzes");
      return { success: true };
    }

    // Attempting to publish: Validate prerequisites
    if (quiz.questions.length === 0) {
      return { error: "Cannot publish a quiz with no questions. Please add questions first." };
    }

    for (const q of quiz.questions) {
      if (q.options.length !== 4) {
        return { error: `Question "${q.questionText.substring(0, 30)}..." must have exactly 4 options.` };
      }
      const correctOpts = q.options.filter((o) => o.isCorrect);
      if (correctOpts.length !== 1) {
        return { error: `Question "${q.questionText.substring(0, 30)}..." must have exactly one correct answer selected.` };
      }
    }

    if (quiz.passingMarks > quiz.totalMarks) {
      return { error: `Passing marks (${quiz.passingMarks}) cannot exceed total marks (${quiz.totalMarks}).` };
    }

    await prisma.quiz.update({
      where: { id: quizId },
      data: { status: QuizStatus.PUBLISHED },
    });

    revalidatePath("/teacher/quizzes");
    revalidatePath("/student/quizzes");
    revalidatePath("/student/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Toggle publish error:", error);
    return { error: "Failed to update quiz status." };
  }
}

export async function deleteQuizAction(quizId: string): Promise<ActionResult> {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) return { error: "Quiz not found." };
    if (user.role === Role.TEACHER && quiz.teacherId !== user.userId) {
      return { error: "You are not authorized to delete this quiz." };
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    revalidatePath("/teacher/quizzes");
    revalidatePath("/teacher/dashboard");
    revalidatePath("/student/quizzes");
    return { success: true };
  } catch (error) {
    console.error("Delete quiz error:", error);
    return { error: "Failed to delete quiz." };
  }
}

