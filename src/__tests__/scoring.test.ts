import { describe, it, expect } from "vitest";
import { calculateQuizScore, isAttemptExpired } from "@/lib/scoring";

describe("Scoring Engine & Attempt Expiration", () => {
  const sampleQuestions = [
    {
      id: "q1",
      marks: 4,
      options: [
        { id: "opt1-a", isCorrect: false },
        { id: "opt1-b", isCorrect: true },
        { id: "opt1-c", isCorrect: false },
        { id: "opt1-d", isCorrect: false },
      ],
    },
    {
      id: "q2",
      marks: 6,
      options: [
        { id: "opt2-a", isCorrect: false },
        { id: "opt2-b", isCorrect: false },
        { id: "opt2-c", isCorrect: true },
        { id: "opt2-d", isCorrect: false },
      ],
    },
    {
      id: "q3",
      marks: 10,
      options: [
        { id: "opt3-a", isCorrect: true },
        { id: "opt3-b", isCorrect: false },
        { id: "opt3-c", isCorrect: false },
        { id: "opt3-d", isCorrect: false },
      ],
    },
  ];

  it("calculates 100% score when all submitted answers are correct", () => {
    const submissions = [
      { questionId: "q1", selectedOptionId: "opt1-b" },
      { questionId: "q2", selectedOptionId: "opt2-c" },
      { questionId: "q3", selectedOptionId: "opt3-a" },
    ];

    const result = calculateQuizScore(sampleQuestions, submissions, 12);

    expect(result.totalMarks).toBe(20);
    expect(result.score).toBe(20);
    expect(result.percentage).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(result.answeredCount).toBe(3);
    expect(result.correctCount).toBe(3);
  });

  it("calculates partial marks and failure when below passing threshold", () => {
    const submissions = [
      { questionId: "q1", selectedOptionId: "opt1-b" }, // Correct: 4 marks
      { questionId: "q2", selectedOptionId: "opt2-a" }, // Incorrect: 0 marks
      { questionId: "q3", selectedOptionId: "opt3-b" }, // Incorrect: 0 marks
    ];

    const result = calculateQuizScore(sampleQuestions, submissions, 12);

    expect(result.score).toBe(4);
    expect(result.percentage).toBe(20);
    expect(result.isPassed).toBe(false);
    expect(result.answeredCount).toBe(3);
    expect(result.correctCount).toBe(1);
  });

  it("handles unanswered questions gracefully without awarding marks", () => {
    const submissions = [
      { questionId: "q1", selectedOptionId: "opt1-b" }, // Correct: 4 marks
      // q2 and q3 left unanswered
    ];

    const result = calculateQuizScore(sampleQuestions, submissions, 4);

    expect(result.score).toBe(4);
    expect(result.answeredCount).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.isPassed).toBe(true); // 4 >= passingMarks(4)
  });

  it("detects attempt expiration accurately according to server clock", () => {
    const now = new Date("2026-10-12T12:00:00Z");
    const futureExpiry = new Date("2026-10-12T12:15:00Z");
    const pastExpiry = new Date("2026-10-12T11:59:00Z");

    expect(isAttemptExpired(futureExpiry, now, 0)).toBe(false);
    expect(isAttemptExpired(pastExpiry, now, 0)).toBe(true);
  });
});

