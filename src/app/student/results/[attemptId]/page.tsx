import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, AttemptStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatScore, formatPercentage } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ResultsPageProps {
  params: {
    attemptId: string;
  };
}

export default async function StudentResultsPage({ params }: ResultsPageProps) {
  const session = await requireRole([Role.STUDENT, Role.TEACHER, Role.ADMIN]);

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: { order: "asc" },
          },
          teacher: { select: { name: true } },
        },
      },
      student: { select: { id: true, name: true, email: true } },
      answers: {
        include: {
          selectedOption: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  // Permission check: student can only view own result; teacher can view if owned; admin can view all
  if (
    session.role === Role.STUDENT &&
    attempt.studentId !== session.userId
  ) {
    redirect("/unauthorized");
  }

  if (
    session.role === Role.TEACHER &&
    attempt.quiz.teacherId !== session.userId
  ) {
    redirect("/unauthorized");
  }

  const isPassed = (attempt.score || 0) >= attempt.quiz.passingMarks;
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  // Calculate duration taken
  let timeTakenSeconds = 0;
  if (attempt.submittedAt && attempt.startedAt) {
    timeTakenSeconds = Math.max(
      0,
      Math.floor((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000)
    );
  }
  const timeTakenMinutes = Math.max(1, Math.round(timeTakenSeconds / 60));

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <DashboardHeader
        user={session}
        title="Assessment Result"
        description={`Examination outcomes for ${attempt.quiz.title}`}
      />

      {/* Main Scorecard Banner */}
      <Card
        className={`border-2 shadow-md overflow-hidden ${
          isPassed
            ? "border-emerald-500 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900"
            : "border-red-500 bg-gradient-to-b from-red-50/50 to-white dark:from-red-950/20 dark:to-slate-900"
        }`}
      >
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md dark:bg-slate-800">
            {isPassed ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            ) : (
              <XCircle className="h-10 w-10 text-red-500" />
            )}
          </div>

          <div>
            <Badge
              variant={isPassed ? "success" : "destructive"}
              className="text-sm font-bold uppercase tracking-wider px-3 py-1"
            >
              {isPassed ? "PASSED" : "FAILED"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {attempt.quiz.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Subject: {attempt.quiz.subject} | Student: {attempt.student.name}
            </p>
          </div>

          {/* Score Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
            <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Score
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatScore(attempt.score)} / {attempt.quiz.totalMarks}
              </span>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Percentage
              </span>
              <span className={`text-2xl font-black ${isPassed ? "text-emerald-600" : "text-red-600"}`}>
                {formatPercentage(attempt.percentage)}
              </span>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Passing Mark
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {attempt.quiz.passingMarks}
              </span>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Time Taken
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {timeTakenMinutes}m
              </span>
            </div>
          </div>

          {attempt.status === AttemptStatus.TIMED_OUT && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚠ This attempt was automatically submitted due to time limit expiration.
            </p>
          )}

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm">
                Student Dashboard
              </Button>
            </Link>
            <Link href="/student/history">
              <Button variant="outline" size="sm">
                View Attempt History
              </Button>
            </Link>
            <Link href={`/student/quizzes/${attempt.quiz.id}`}>
              <Button size="sm" className="gap-1.5">
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Detailed Review (If showResultsImmediately is enabled) */}
      {attempt.quiz.showResultsImmediately ? (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Detailed Question Analysis
            </h3>
            <span className="text-xs text-slate-500">
              {attempt.quiz.questions.length} Questions Reviewed
            </span>
          </div>

          <div className="space-y-4">
            {attempt.quiz.questions.map((q, idx) => {
              const studentAns = answerMap.get(q.id);
              const isCorrect = Boolean(studentAns?.isCorrect);
              const isUnanswered = !studentAns || !studentAns.selectedOptionId;

              return (
                <Card
                  key={q.id}
                  className={`border ${
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40"
                      : isUnanswered
                      ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40"
                      : "border-red-200 bg-red-50/20 dark:border-red-900/40"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : isUnanswered
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <CardTitle className="text-base font-semibold leading-relaxed">
                            {q.questionText}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                isCorrect ? "success" : isUnanswered ? "warning" : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {isCorrect
                                ? "Correct"
                                : isUnanswered
                                ? "Unanswered"
                                : "Incorrect"}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              Points: {studentAns?.marksAwarded || 0} / {q.marks}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {q.options.map((opt, oIdx) => {
                        const letters = ["A", "B", "C", "D"];
                        const isStudentChoice = studentAns?.selectedOptionId === opt.id;
                        const isTheCorrectAnswer = opt.isCorrect;

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs ${
                              isTheCorrectAnswer
                                ? "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 font-semibold"
                                : isStudentChoice && !isTheCorrectAnswer
                                ? "border-red-400 bg-red-50 text-red-950 dark:bg-red-950/60 dark:text-red-200 line-through"
                                : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                            }`}
                          >
                            <span className="font-bold">{letters[oIdx]}.</span>
                            <span className="flex-1">{opt.optionText}</span>
                            {isTheCorrectAnswer && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                            {isStudentChoice && !isTheCorrectAnswer && (
                              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 text-center py-8 text-slate-500 text-sm">
          Detailed question reviews for this quiz have been hidden by the instructor.
        </Card>
      )}
    </div>
  );
}

