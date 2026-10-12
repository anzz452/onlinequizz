"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { startQuizAttemptAction } from "@/actions/attempts";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { Play, RotateCcw, AlertTriangle } from "lucide-react";

interface QuizDetailClientProps {
  quizId: string;
  activeAttemptId?: string | null;
}

export function QuizDetailClient({ quizId, activeAttemptId }: QuizDetailClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const [isStarting, setIsStarting] = React.useState(false);

  const handleStartOrResume = async () => {
    if (activeAttemptId) {
      router.push(`/student/attempts/${activeAttemptId}`);
      return;
    }

    setIsStarting(true);
    setError(null);
    const res = await startQuizAttemptAction(quizId);
    setIsStarting(false);

    if (res.error) {
      setError(res.error);
      toast.error(res.error);
    } else if (res.attemptId) {
      toast.success("Quiz attempt started. Good luck!");
      router.push(`/student/attempts/${res.attemptId}`);
    }
  };

  return (
    <div className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      {activeAttemptId && (
        <Alert variant="warning" className="text-xs">
          <AlertTriangle className="h-4 w-4" />
          <span>You already have an ongoing attempt for this quiz. You can resume right where you left off.</span>
        </Alert>
      )}

      <Button
        size="lg"
        className="w-full sm:w-auto gap-2 text-base font-semibold shadow-md"
        isLoading={isStarting}
        onClick={handleStartOrResume}
      >
        {activeAttemptId ? (
          <>
            <RotateCcw className="h-5 w-5" />
            <span>Resume In-Progress Attempt</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            <span>Start Quiz Assessment</span>
          </>
        )}
      </Button>
    </div>
  );
}

