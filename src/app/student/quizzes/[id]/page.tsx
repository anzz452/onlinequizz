import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, QuizStatus, AttemptStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Award,
  FileQuestion,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizDetailClient } from "@/components/student/QuizDetailClient";
import { formatDuration, formatScore } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface StudentQuizDetailPageProps {
  params: { id: string };
}

export default async function StudentQuizDetailPage({ params }: StudentQuizDetailPageProps) {
  const session = await requireRole([Role.STUDENT, Role.ADMIN]);

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: {
      teacher: { select: { name: true, email: true } },
      _count: { select: { questions: true } },
    },
  });

  if (!quiz || quiz.status !== QuizStatus.PUBLISHED) {
    notFound();
  }

  // Check if student has an in-progress attempt or previous completed attempts
  const [activeAttempt, completedAttempts] = await Promise.all([
    prisma.quizAttempt.findFirst({
      where: {
        quizId: quiz.id,
        studentId: session.userId,
        status: AttemptStatus.IN_PROGRESS,
      },
    }),
    prisma.quizAttempt.findMany({
      where: {
        quizId: quiz.id,
        studentId: session.userId,
        status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.TIMED_OUT] },
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <DashboardHeader
        user={session}
        title={quiz.title}
        description={`Subject: ${quiz.subject} | Instructor: ${quiz.teacher.name}`}
      />

      <div className="flex items-center gap-2">
        <Link href="/student/quizzes">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-slate-500">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Quizzes</span>
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{quiz.subject}</Badge>
            <span className="text-xs text-slate-400">Created by {quiz.teacher.name}</span>
          </div>
          <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
          <CardDescription className="text-sm mt-1">{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Quiz Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Clock className="h-4 w-4" />
                <span>Time Limit</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {formatDuration(quiz.durationMinutes)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Award className="h-4 w-4" />
                <span>Total Marks</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {quiz.totalMarks} Marks
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Passing Criteria</span>
              </div>
              <span className="text-lg font-bold text-emerald-600">
                {quiz.passingMarks} Marks
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <FileQuestion className="h-4 w-4" />
                <span>Questions</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {quiz._count.questions} MCQs
              </span>
            </div>
          </div>

          {/* Exam Rules & Guidelines */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Exam Instructions & Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc pl-5">
              <li>Once started, the countdown timer will run continuously on the server.</li>
              <li>Your selections are saved automatically in real-time as you click them.</li>
              <li>You can navigate between questions, review unanswered questions, and change your selections before submission.</li>
              <li>If the timer expires, your answers will be automatically submitted by the system.</li>
              <li>Ensure you have a reliable internet connection throughout the quiz duration.</li>
            </ul>
          </div>

          {/* Previous Attempts (if any) */}
          {completedAttempts.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Previous Submissions ({completedAttempts.length})
              </h4>
              <div className="space-y-2">
                {completedAttempts.map((ca, idx) => {
                  const isPassed = (ca.score || 0) >= quiz.passingMarks;
                  return (
                    <div
                      key={ca.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Attempt #{completedAttempts.length - idx}
                        </span>
                        <span className="text-slate-400 ml-2">
                          {ca.submittedAt ? new Date(ca.submittedAt).toLocaleDateString() : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold">
                          {formatScore(ca.score)} / {quiz.totalMarks} ({ca.percentage?.toFixed(1)}%)
                        </span>
                        <Badge variant={isPassed ? "success" : "destructive"}>
                          {isPassed ? "Passed" : "Failed"}
                        </Badge>
                        <Link href={`/student/results/${ca.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View Result
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <QuizDetailClient
              quizId={quiz.id}
              activeAttemptId={activeAttempt?.id}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

