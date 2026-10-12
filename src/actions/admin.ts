"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ActionResult } from "./quizzes";

export async function toggleUserStatusAction(userId: string): Promise<ActionResult> {
  const currentAdmin = await requireRole([Role.ADMIN]);

  if (currentAdmin.userId === userId) {
    return { error: "You cannot change your own active status." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found." };

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { error: "Failed to update user status." };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const currentAdmin = await requireRole([Role.ADMIN]);

  if (currentAdmin.userId === userId) {
    return { error: "You cannot delete your own admin account." };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user." };
  }
}

export async function adminDeleteQuizAction(quizId: string): Promise<ActionResult> {
  await requireRole([Role.ADMIN]);

  try {
    await prisma.quiz.delete({ where: { id: quizId } });

    revalidatePath("/admin/quizzes");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Admin delete quiz error:", error);
    return { error: "Failed to delete quiz." };
  }
}

