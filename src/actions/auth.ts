"use server";

import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: "Please correct the errors in the form.", fieldErrors };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: validation.data.email.toLowerCase() },
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    if (!user.isActive) {
      return { error: "Your account has been deactivated. Please contact an administrator." };
    }

    const isValid = await verifyPassword(validation.data.password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid email or password." };
    }

    await setAuthCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login action error:", error);
    const msg = error?.message || "";
    if (msg.includes("DATABASE_URL") || msg.includes("DIRECT_URL") || msg.includes("Environment variable not found")) {
      return { error: "Database configuration error: Missing DATABASE_URL or DIRECT_URL in Vercel Environment Variables." };
    }
    if (msg.includes("Can't reach database server")) {
      return { error: "Cannot connect to Neon Database from live server. Please verify DATABASE_URL and sslmode=require." };
    }
    return { error: error?.message ? `Login error: ${error.message}` : "A server error occurred during login. Please try again." };
  }
}

export async function registerAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "STUDENT";

  const validation = registerSchema.safeParse({ name, email, password, role });
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: "Please correct the errors in the form.", fieldErrors };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: validation.data.email.toLowerCase() },
    });

    if (existing) {
      return {
        error: "An account with this email address already exists.",
        fieldErrors: { email: "Email already registered" },
      };
    }

    const passwordHash = await hashPassword(validation.data.password);
    const newUser = await prisma.user.create({
      data: {
        name: validation.data.name,
        email: validation.data.email.toLowerCase(),
        passwordHash,
        role: validation.data.role,
        isActive: true,
      },
    });

    await setAuthCookie({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Register action error:", error);
    const msg = error?.message || "";
    if (msg.includes("DATABASE_URL") || msg.includes("DIRECT_URL") || msg.includes("Environment variable not found")) {
      return { error: "Database configuration error: Missing DATABASE_URL or DIRECT_URL in Vercel Environment Variables." };
    }
    return { error: error?.message ? `Registration failed: ${error.message}` : "Failed to create account. Please try again later." };
  }
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect("/login");
}

