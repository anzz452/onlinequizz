import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "TEACHER"] as const),
});

export const quizSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().trim().min(5, "Description must be at least 5 characters").max(1000),
    subject: z.string().trim().min(2, "Subject must be at least 2 characters").max(50),
    durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute").max(360, "Duration cannot exceed 6 hours"),
    passingMarks: z.coerce.number().int().min(1, "Passing marks must be at least 1"),
    shuffleQuestions: z.boolean().default(false),
    showResultsImmediately: z.boolean().default(true),
    startAt: z.string().optional().nullable(),
    endAt: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startAt && data.endAt) {
        return new Date(data.endAt) > new Date(data.startAt);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endAt"],
    }
  );

export const questionSchema = z.object({
  questionText: z.string().trim().min(5, "Question text must be at least 5 characters"),
  marks: z.coerce.number().int().min(1, "Marks must be at least 1").max(100),
  options: z
    .array(
      z.object({
        optionText: z.string().trim().min(1, "Option text cannot be empty"),
        isCorrect: z.boolean().default(false),
      })
    )
    .length(4, "Each multiple-choice question must have exactly 4 options")
    .refine(
      (options) => options.filter((o) => o.isCorrect).length === 1,
      "Exactly one option must be selected as the correct answer"
    ),
});

export const saveAnswerSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1).nullable(),
});

export const submitAttemptSchema = z.object({
  attemptId: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
