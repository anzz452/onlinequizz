"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { saveAnswerAction, submitQuizAttemptAction } from "@/actions/attempts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface OptionForStudent {
  id: string;
  optionText: string;
}

interface QuestionForStudent {
  id: string;
  questionText: string;
  marks: number;
  order: number;
  options: OptionForStudent[];
}

interface QuizTakingProps {
  attemptId: string;
  expiresAt: string; // ISO string
  quiz: {
    id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    totalMarks: number;
    questions: QuestionForStudent[];
  };
  initialAnswers: Record<string, string>; // questionId -> selectedOptionId
}

export function QuizTakingInterface({
  attemptId,
  expiresAt,
  quiz,
  initialAnswers,
}: QuizTakingProps) {
  const router = useRouter();
  const toast = useToast();

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>(initialAnswers);
  const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [isTimedOut, setIsTimedOut] = React.useState(false);

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];

  const handleAutoSubmit = React.useCallback(async () => {
    toast.error("Time has expired! Submitting your answers automatically...", "Time Expired");
    setIsSubmitting(true);
    await submitQuizAttemptAction(attemptId);
    router.push(`/student/results/${attemptId}`);
  }, [attemptId, router, toast]);

  // Expiration countdown timer
  React.useEffect(() => {
    const targetTime = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = Math.max(0, Math.floor((targetTime - now) / 1000));
      setTimeLeft(difference);

      if (difference <= 0 && !isTimedOut) {
        setIsTimedOut(true);
        handleAutoSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, isTimedOut, handleAutoSubmit]);

  const handleSelectOption = async (optionId: string) => {
    if (isTimedOut) return;

    const qId = currentQuestion.id;
    const isAlreadySelected = answers[qId] === optionId;
    const newSelectedId = isAlreadySelected ? null : optionId;

    setAnswers((prev) => {
      const updated = { ...prev };
      if (newSelectedId) {
        updated[qId] = newSelectedId;
      } else {
        delete updated[qId];
      }
      return updated;
    });

    const res = await saveAnswerAction(attemptId, qId, newSelectedId);

    if (res.isExpired) {
      setIsTimedOut(true);
      router.push(`/student/results/${attemptId}`);
    } else if (res.error) {
      toast.error(res.error, "Save Failed");
    }
  };

  const handleClearCurrentSelection = async () => {
    if (isTimedOut) return;
    const qId = currentQuestion.id;
    if (!answers[qId]) return;

    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[qId];
      return updated;
    });

    await saveAnswerAction(attemptId, qId, null);
  };

  const handleManualSubmit = async () => {
    setIsSubmitting(true);
    const res = await submitQuizAttemptAction(attemptId);
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error, "Submission Failed");
    } else {
      toast.success("Quiz submitted successfully!");
      setSubmitDialogOpen(false);
      router.push(`/student/results/${attemptId}`);
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatCountdown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isTimeCritical = timeLeft < 120 && timeLeft > 0; // Less than 2 minutes

  return (
    <div className="space-y-6">
      {/* Quiz Top Action Bar with Countdown & Progress */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {quiz.subject}
            </Badge>
            <span className="text-xs font-semibold text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
            {quiz.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-base font-bold transition-colors shadow-sm",
              isTimeCritical
                ? "bg-red-500 text-white animate-pulse"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>{formatCountdown(timeLeft)}</span>
          </div>

          {/* Submit Quiz Trigger Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setSubmitDialogOpen(true)}
            className="gap-2 shadow-sm font-semibold"
          >
            <Send className="h-4 w-4" />
            <span>Submit Quiz</span>
          </Button>
        </div>
      </div>

      {/* Main Examination Layout: Question Area + Navigation Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Question {currentIndex + 1}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-semibold text-slate-600 dark:text-slate-300">
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? "Mark" : "Marks"}
                </span>
              </div>
              <CardTitle className="text-lg font-bold leading-relaxed pt-2 text-slate-900 dark:text-slate-100">
                {currentQuestion.questionText}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const letters = ["A", "B", "C", "D"];
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-100 font-semibold shadow-sm"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {letters[optIdx]}
                    </div>
                    <span className="flex-1 text-sm">{opt.optionText}</span>
                  </button>
                );
              })}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                {answers[currentQuestion.id] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCurrentSelection}
                    className="text-xs text-slate-500 hover:text-red-600"
                  >
                    Clear Choice
                  </Button>
                )}

                {currentIndex < questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="gap-1.5"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => setSubmitDialogOpen(true)}
                    className="gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    <span>Review & Submit</span>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right 1 Column: Question Navigation Palette */}
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Question Palette
              </CardTitle>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Answered: <strong className="text-emerald-600">{answeredCount}</strong>
                </span>
                <span>
                  Remaining: <strong className="text-amber-600">{unansweredCount}</strong>
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Question Buttons Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, qIndex) => {
                  const isCurrent = qIndex === currentIndex;
                  const isAnswered = Boolean(answers[q.id]);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(qIndex)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all",
                        isCurrent && "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900",
                        isAnswered
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      )}
                    >
                      {qIndex + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-emerald-600" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded ring-2 ring-blue-600" />
                  <span>Current Question</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final Submission Confirmation Dialog */}
      <Dialog
        isOpen={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        title="Submit Quiz Assessment"
        description="Are you sure you want to finish and submit your quiz answers?"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Questions:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Questions Answered:</span>
              <span className="font-bold text-emerald-600">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unanswered Questions:</span>
              <span className="font-bold text-amber-600">{unansweredCount}</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <Alert variant="warning" className="text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>You have {unansweredCount} unanswered questions. Unanswered questions will receive 0 marks.</span>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Continue Working
            </Button>
            <Button
              variant="default"
              isLoading={isSubmitting}
              onClick={handleManualSubmit}
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>Yes, Submit Now</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

