export interface QuestionOptionItem {
  id: string;
  isCorrect: boolean;
}

export interface QuestionScoringItem {
  id: string;
  marks: number;
  options: QuestionOptionItem[];
}

export interface AnswerSubmissionItem {
  questionId: string;
  selectedOptionId: string | null;
}

export interface ScoredAnswerResult {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface OverallScoringResult {
  totalMarks: number;
  passingMarks: number;
  score: number;
  percentage: number;
  isPassed: boolean;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  answers: ScoredAnswerResult[];
}

/**
 * Calculates score and correctness for a list of questions and submitted answers.
 * Server-authoritative calculation: never trusts client scores or correctness flags.
 */
export function calculateQuizScore(
  questions: QuestionScoringItem[],
  submissions: AnswerSubmissionItem[],
  passingMarks: number
): OverallScoringResult {
  let score = 0;
  let totalMarks = 0;
  let answeredCount = 0;
  let correctCount = 0;

  const answerMap = new Map<string, string | null>();
  submissions.forEach((s) => {
    answerMap.set(s.questionId, s.selectedOptionId);
  });

  const scoredAnswers: ScoredAnswerResult[] = [];

  for (const question of questions) {
    totalMarks += question.marks;
    const selectedOptionId = answerMap.get(question.id) || null;
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const correctOptionId = correctOption?.id || "";

    const isCorrect = Boolean(
      selectedOptionId && correctOptionId && selectedOptionId === correctOptionId
    );

    const marksAwarded = isCorrect ? question.marks : 0;

    if (selectedOptionId) {
      answeredCount++;
    }

    if (isCorrect) {
      correctCount++;
      score += marksAwarded;
    }

    scoredAnswers.push({
      questionId: question.id,
      selectedOptionId,
      correctOptionId,
      isCorrect,
      marksAwarded,
    });
  }

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  const isPassed = score >= passingMarks;

  return {
    totalMarks,
    passingMarks,
    score,
    percentage: Math.round(percentage * 100) / 100, // round to 2 decimal places
    isPassed,
    totalQuestions: questions.length,
    answeredCount,
    correctCount,
    answers: scoredAnswers,
  };
}

/**
 * Checks whether a quiz attempt has exceeded its scheduled expiration time.
 */
export function isAttemptExpired(expiresAt: Date, currentTime: Date = new Date(), gracePeriodSeconds: number = 5): boolean {
  return currentTime.getTime() > expiresAt.getTime() + gracePeriodSeconds * 1000;
}

