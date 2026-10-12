import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  quizSchema,
  questionSchema,
} from "@/lib/validations";
import { Role } from "@prisma/client";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const res = loginSchema.safeParse({
        email: "student@university.edu",
        password: "securePassword123",
      });
      expect(res.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const res = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("accepts student and teacher registrations", () => {
      const studentRes = registerSchema.safeParse({
        name: "Alice Johnson",
        email: "alice@university.edu",
        password: "password123",
        role: Role.STUDENT,
      });
      expect(studentRes.success).toBe(true);

      const teacherRes = registerSchema.safeParse({
        name: "Dr. Turing",
        email: "turing@university.edu",
        password: "password123",
        role: Role.TEACHER,
      });
      expect(teacherRes.success).toBe(true);
    });

    it("rejects unauthorized role registrations like ADMIN", () => {
      const res = registerSchema.safeParse({
        name: "Hacker",
        email: "hacker@test.com",
        password: "password123",
        role: "ADMIN",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("quizSchema", () => {
    it("validates valid quiz inputs", () => {
      const res = quizSchema.safeParse({
        title: "Algorithms Exam",
        description: "Comprehensive algorithms evaluation",
        subject: "Computer Science",
        durationMinutes: 30,
        passingMarks: 15,
        shuffleQuestions: true,
        showResultsImmediately: true,
      });
      expect(res.success).toBe(true);
    });

    it("rejects negative or zero durations", () => {
      const res = quizSchema.safeParse({
        title: "Test Quiz",
        description: "Valid description",
        subject: "Math",
        durationMinutes: 0,
        passingMarks: 5,
      });
      expect(res.success).toBe(false);
    });
  });

  describe("questionSchema", () => {
    it("accepts questions with exactly 4 options and 1 correct answer", () => {
      const res = questionSchema.safeParse({
        questionText: "What is 2 + 2?",
        marks: 5,
        options: [
          { optionText: "3", isCorrect: false },
          { optionText: "4", isCorrect: true },
          { optionText: "5", isCorrect: false },
          { optionText: "6", isCorrect: false },
        ],
      });
      expect(res.success).toBe(true);
    });

    it("rejects questions when more or less than 4 options are provided", () => {
      const res = questionSchema.safeParse({
        questionText: "What is 2 + 2?",
        marks: 5,
        options: [
          { optionText: "3", isCorrect: false },
          { optionText: "4", isCorrect: true },
        ],
      });
      expect(res.success).toBe(false);
    });

    it("rejects questions with no correct option selected", () => {
      const res = questionSchema.safeParse({
        questionText: "What is 2 + 2?",
        marks: 5,
        options: [
          { optionText: "3", isCorrect: false },
          { optionText: "4", isCorrect: false },
          { optionText: "5", isCorrect: false },
          { optionText: "6", isCorrect: false },
        ],
      });
      expect(res.success).toBe(false);
    });

    it("rejects questions with multiple correct options selected", () => {
      const res = questionSchema.safeParse({
        questionText: "What is 2 + 2?",
        marks: 5,
        options: [
          { optionText: "3", isCorrect: true },
          { optionText: "4", isCorrect: true },
          { optionText: "5", isCorrect: false },
          { optionText: "6", isCorrect: false },
        ],
      });
      expect(res.success).toBe(false);
    });
  });
});

