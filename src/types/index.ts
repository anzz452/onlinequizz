import { Role, QuizStatus, AttemptStatus } from "@prisma/client";

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface QuizWithStats {
  id: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: QuizStatus;
  startAt: Date | null;
  endAt: Date | null;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  teacherId: string;
  teacherName?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface QuestionWithOptions {
  id: string;
  quizId: string;
  questionText: string;
  marks: number;
  order: number;
  options: {
    id: string;
    optionText: string;
    isCorrect?: boolean;
  }[];
}

export interface AttemptWithDetails {
  id: string;
  quizId: string;
  studentId: string;
  startedAt: Date;
  submittedAt: Date | null;
  expiresAt: Date;
  score: number | null;
  percentage: number | null;
  status: AttemptStatus;
  quiz: {
    id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    showResultsImmediately: boolean;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
}

