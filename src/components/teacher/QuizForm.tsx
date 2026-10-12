"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quizSchema, QuizInput } from "@/lib/validations";
import { createQuizAction, updateQuizAction } from "@/actions/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface QuizFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    subject: string;
    durationMinutes: number;
    passingMarks: number;
    shuffleQuestions: boolean;
    showResultsImmediately: boolean;
    startAt: Date | null;
    endAt: Date | null;
  };
  mode: "create" | "edit";
}

export function QuizForm({ initialData, mode }: QuizFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(quizSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      subject: initialData?.subject || "",
      durationMinutes: initialData?.durationMinutes || 15,
      passingMarks: initialData?.passingMarks || 10,
      shuffleQuestions: initialData?.shuffleQuestions ?? false,
      showResultsImmediately: initialData?.showResultsImmediately ?? true,
      startAt: initialData?.startAt ? new Date(initialData.startAt).toISOString().slice(0, 16) : "",
      endAt: initialData?.endAt ? new Date(initialData.endAt).toISOString().slice(0, 16) : "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setServerError(null);
    setIsSubmitting(true);

    if (mode === "create") {
      const res = await createQuizAction(data);
      setIsSubmitting(false);

      if (res.error) {
        setServerError(res.error);
        toast.error(res.error);
      } else if (res.success && res.data?.id) {
        toast.success("Quiz draft created! Now add your questions.");
        router.push(`/teacher/quizzes/${res.data.id}/questions`);
      }
    } else if (mode === "edit" && initialData) {
      const res = await updateQuizAction(initialData.id, data);
      setIsSubmitting(false);

      if (res.error) {
        setServerError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Quiz settings saved successfully!");
        router.push("/teacher/quizzes");
      }
    }
  };

  return (
    <Card className="max-w-3xl border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/teacher/quizzes">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-slate-500">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Quizzes</span>
            </Button>
          </Link>
        </div>
        <CardTitle>{mode === "create" ? "Create New Quiz" : "Edit Quiz Settings"}</CardTitle>
        <CardDescription>
          Configure the examination title, subject, duration, and passing criteria.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {serverError && (
            <Alert variant="destructive">
              {serverError}
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Quiz Title *
              </label>
              <Input
                placeholder="e.g. Data Structures & Algorithms Midterm"
                {...register("title")}
                error={errors.title?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Subject / Department *
                </label>
                <Input
                  placeholder="e.g. Computer Science"
                  {...register("subject")}
                  error={errors.subject?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Duration (Minutes) *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="360"
                  placeholder="15"
                  {...register("durationMinutes")}
                  error={errors.durationMinutes?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description / Syllabus Scope *
              </label>
              <Textarea
                placeholder="Provide a description, instructions, or topics covered in this quiz..."
                rows={3}
                {...register("description")}
                error={errors.description?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Passing Marks *
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="10"
                  {...register("passingMarks")}
                  error={errors.passingMarks?.message}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Students scoring at or above this mark will receive a &ldquo;Passed&rdquo; status.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="shuffleQuestions"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    {...register("shuffleQuestions")}
                  />
                  <label htmlFor="shuffleQuestions" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Randomize question order for students
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showResultsImmediately"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    {...register("showResultsImmediately")}
                  />
                  <label htmlFor="showResultsImmediately" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Show detailed answers immediately after submission
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Scheduled Start Time (Optional)
                </label>
                <Input
                  type="datetime-local"
                  {...register("startAt")}
                  error={errors.startAt?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Deadline / End Time (Optional)
                </label>
                <Input
                  type="datetime-local"
                  {...register("endAt")}
                  error={errors.endAt?.message}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 py-4">
          <Link href="/teacher/quizzes">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            <span>{mode === "create" ? "Save & Add Questions" : "Save Settings"}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

