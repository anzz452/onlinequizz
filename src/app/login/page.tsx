"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Lock, Mail, ArrowRight, Shield, UserCheck, BookOpen } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const toast = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAction(null, formData);
      if (res.error) {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        toast.error(res.error);
      } else if (res.success) {
        toast.success("Login successful! Redirecting...");
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.refresh();
          router.push("/");
        }
      }
    });
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">AcademiQuiz</span>
        </Link>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign in to your academic dashboard to manage or take quizzes
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="you@quizplatform.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                  required
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
                  required
                  className="pl-9"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2 mt-2" isLoading={isPending}>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3 text-center">
              Quick Demo Auto-Fill
            </span>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs py-1.5 px-2 flex flex-col h-auto gap-0.5 border-slate-200"
                onClick={() => handleFillDemo("admin@quizplatform.edu", "Admin@1234")}
              >
                <Shield className="h-3.5 w-3.5 text-red-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Admin</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs py-1.5 px-2 flex flex-col h-auto gap-0.5 border-slate-200"
                onClick={() => handleFillDemo("teacher1@quizplatform.edu", "Teacher@1234")}
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Teacher</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs py-1.5 px-2 flex flex-col h-auto gap-0.5 border-slate-200"
                onClick={() => handleFillDemo("student1@quizplatform.edu", "Student@1234")}
              >
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Student</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 py-4 text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="ml-1 font-semibold text-blue-600 hover:underline dark:text-blue-400">
            Register here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
      <React.Suspense fallback={<div className="text-sm text-slate-400">Loading sign in form...</div>}>
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
