"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { questionSchema, QuestionInput } from "@/lib/validations";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ActionResult } from "./quizzes";

async function recalculateQuizTotalMarks(quizId: string) {
  const aggregate = await prisma.question.aggregate({
    where: { quizId },
    _sum: { marks: true },
  });
  const total = aggregate._sum.marks || 0;
  await prisma.quiz.update({
    where: { id: quizId },
    data: { totalMarks: total },
  });
}

export async function createQuestionAction(quizId: string, data: QuestionInput): Promise<ActionResult> {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  const validation = questionSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid question input." };
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { _count: { select: { questions: true } } },
    });

    if (!quiz) return { error: "Quiz not found." };
    if (user.role === Role.TEACHER && quiz.teacherId !== user.userId) {
      return { error: "Not authorized to modify this quiz." };
    }

    const order = quiz._count.questions + 1;

    await prisma.question.create({
      data: {
        quizId,
        questionText: validation.data.questionText,
        marks: validation.data.marks,
        order,
        options: {
          create: validation.data.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })),
        },
      },
    });

    await recalculateQuizTotalMarks(quizId);
    revalidatePath(`/teacher/quizzes/${quizId}/questions`);
    return { success: true };
  } catch (error) {
    console.error("Create question error:", error);
    return { error: "Failed to save question." };
  }
}

export async function updateQuestionAction(questionId: string, data: QuestionInput): Promise<ActionResult> {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  const validation = questionSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid question input." };
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { quiz: true, options: true },
    });

    if (!question) return { error: "Question not found." };
    if (user.role === Role.TEACHER && question.quiz.teacherId !== user.userId) {
      return { error: "Not authorized to edit this question." };
    }

    // Update question details and replace options inside a transaction
    await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: questionId },
        data: {
          questionText: validation.data.questionText,
          marks: validation.data.marks,
        },
      });

      // Delete existing options and recreate with updated selections
      await tx.option.deleteMany({
        where: { questionId },
      });

      await tx.option.createMany({
        data: validation.data.options.map((opt) => ({
          questionId,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
      });
    });

    await recalculateQuizTotalMarks(question.quizId);
    revalidatePath(`/teacher/quizzes/${question.quizId}/questions`);
    return { success: true };
  } catch (error) {
    console.error("Update question error:", error);
    return { error: "Failed to update question." };
  }
}

export async function deleteQuestionAction(questionId: string): Promise<ActionResult> {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { quiz: true },
    });

    if (!question) return { error: "Question not found." };
    if (user.role === Role.TEACHER && question.quiz.teacherId !== user.userId) {
      return { error: "Not authorized to delete this question." };
    }

    const quizId = question.quizId;
    await prisma.question.delete({
      where: { id: questionId },
    });

    await recalculateQuizTotalMarks(quizId);
    revalidatePath(`/teacher/quizzes/${quizId}/questions`);
    return { success: true };
  } catch (error) {
    console.error("Delete question error:", error);
    return { error: "Failed to delete question." };
  }
}

