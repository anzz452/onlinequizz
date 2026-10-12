"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  Eye,
  Globe,
  FileQuestion,
  ArrowLeft,
} from "lucide-react";
import { QuizStatus } from "@prisma/client";
import { createQuestionAction, updateQuestionAction, deleteQuestionAction } from "@/actions/questions";
import { togglePublishQuizAction } from "@/actions/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

interface OptionItem {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  questionText: string;
  marks: number;
  order: number;
  options: {
    id: string;
    optionText: string;
    isCorrect: boolean;
  }[];
}

interface QuestionBuilderProps {
  quiz: {
    id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    status: QuizStatus;
    questions: QuestionItem[];
  };
}

export function QuestionBuilder({ quiz }: QuestionBuilderProps) {
  const router = useRouter();
  const toast = useToast();

  const [questions, setQuestions] = React.useState<QuestionItem[]>(quiz.questions);
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<QuestionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<QuestionItem | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Form State for current question being added or edited
  const [questionText, setQuestionText] = React.useState("");
  const [marks, setMarks] = React.useState(5);
  const [options, setOptions] = React.useState<OptionItem[]>([
    { optionText: "", isCorrect: true },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  // Sync questions from prop changes
  React.useEffect(() => {
    setQuestions(quiz.questions);
  }, [quiz.questions]);

  const resetForm = () => {
    setQuestionText("");
    setMarks(5);
    setOptions([
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ]);
    setFormError(null);
    setIsAdding(false);
    setEditingQuestion(null);
  };

  const handleStartEdit = (q: QuestionItem) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setMarks(q.marks);
    setOptions(
      q.options.map((o) => ({
        id: o.id,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      }))
    );
    setIsAdding(true);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], optionText: text };
      return copy;
    });
  };

  const handleSetCorrectOption = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }))
    );
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (questionText.trim().length < 5) {
      setFormError("Question prompt must be at least 5 characters long.");
      return;
    }

    if (marks < 1) {
      setFormError("Marks must be at least 1.");
      return;
    }

    const emptyOptions = options.some((o) => !o.optionText.trim());
    if (emptyOptions) {
      setFormError("All 4 options must have text. Please fill in all options.");
      return;
    }

    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      setFormError("Please select exactly one correct answer option.");
      return;
    }

    setIsSaving(true);

    if (editingQuestion) {
      const res = await updateQuestionAction(editingQuestion.id, {
        questionText,
        marks,
        options,
      });
      setIsSaving(false);

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Question updated successfully!");
        resetForm();
        router.refresh();
      }
    } else {
      const res = await createQuestionAction(quiz.id, {
        questionText,
        marks,
        options,
      });
      setIsSaving(false);

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Question added successfully!");
        resetForm();
        router.refresh();
      }
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    const res = await deleteQuestionAction(deleteTarget.id);
    setDeleteTarget(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Question deleted successfully.");
      router.refresh();
    }
  };

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    const res = await togglePublishQuizAction(quiz.id);
    setIsPublishing(false);

    if (res.error) {
      toast.error(res.error, "Cannot Publish");
    } else {
      toast.success(
        quiz.status === QuizStatus.PUBLISHED ? "Quiz moved to drafts." : "Quiz is now live and published!",
        "Quiz Status Updated"
      );
      router.refresh();
    }
  };

  const calculatedTotalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Summary Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/teacher/quizzes">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-slate-500">
                <ArrowLeft className="h-3 w-3" />
                <span>Quizzes</span>
              </Button>
            </Link>
            <Badge variant="outline">{quiz.subject}</Badge>
            <Badge
              variant={
                quiz.status === QuizStatus.PUBLISHED
                  ? "success"
                  : quiz.status === QuizStatus.DRAFT
                  ? "warning"
                  : "secondary"
              }
            >
              {quiz.status}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {quiz.durationMinutes} minutes duration | Passing Criteria: {quiz.passingMarks} marks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="gap-1.5 text-xs"
            disabled={questions.length === 0}
          >
            <Eye className="h-4 w-4 text-slate-600" />
            <span>Student Preview</span>
          </Button>

          <Button
            size="sm"
            variant={quiz.status === QuizStatus.PUBLISHED ? "secondary" : "success"}
            className="gap-1.5 text-xs"
            isLoading={isPublishing}
            onClick={handleTogglePublish}
          >
            <Globe className="h-4 w-4" />
            <span>{quiz.status === QuizStatus.PUBLISHED ? "Unpublish Quiz" : "Publish Quiz"}</span>
          </Button>

          {!isAdding && (
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="gap-1.5 text-xs shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Question</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Total Questions</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{questions.length}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Calculated Marks</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{calculatedTotalMarks}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Required Passing Marks</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{quiz.passingMarks}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Publish Status</span>
          <span className={`text-sm font-bold block mt-1 ${calculatedTotalMarks >= quiz.passingMarks && questions.length > 0 ? "text-emerald-600" : "text-amber-500"}`}>
            {calculatedTotalMarks >= quiz.passingMarks && questions.length > 0 ? "✓ Ready to Publish" : "⚠ Incomplete"}
          </span>
        </div>
      </div>

      {/* Add / Edit Question Form Drawer / Card */}
      {isAdding && (
        <Card className="border-blue-200 bg-blue-50/20 dark:border-blue-900/40 dark:bg-slate-900 shadow-md animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-900 dark:text-blue-300">
              {editingQuestion ? `Edit Question #${editingQuestion.order}` : "Add Multiple-Choice Question"}
            </CardTitle>
            <CardDescription>
              Write the question prompt, assign points, and click the radio button beside the correct option.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveQuestion}>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="destructive">{formError}</Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Prompt *
                  </label>
                  <Textarea
                    placeholder="Enter the question text clearly..."
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Marks / Points *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Weight for this question</p>
                </div>
              </div>

              {/* 4 Options */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Answer Options (Select the Radio Button for the Correct Answer) *
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {options.map((opt, index) => {
                    const letters = ["A", "B", "C", "D"];
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                          opt.isCorrect
                            ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/30"
                            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOption"
                          id={`opt-${index}`}
                          checked={opt.isCorrect}
                          onChange={() => handleSetCorrectOption(index)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="font-bold text-xs text-slate-500 w-4">{letters[index]}.</span>
                        <input
                          type="text"
                          placeholder={`Option ${letters[index]} text...`}
                          value={opt.optionText}
                          onChange={(e) => handleOptionTextChange(index, e.target.value)}
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          required
                        />
                        {opt.isCorrect && (
                          <Badge variant="success" className="text-[10px]">
                            Correct Answer
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-slate-200 dark:border-slate-800 py-3">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSaving} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{editingQuestion ? "Update Question" : "Save Question"}</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Quiz Questions ({questions.length})
        </h3>

        {questions.length === 0 ? (
          <Card className="border-dashed py-12 text-center text-slate-500">
            <FileQuestion className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No questions added yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click &ldquo;Add Question&rdquo; above to start adding multiple-choice questions to this quiz.
            </p>
          </Card>
        ) : (
          questions.map((q, qIndex) => (
            <Card key={q.id} className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {qIndex + 1}
                  </span>
                  <div>
                    <CardTitle className="text-base font-semibold leading-relaxed">
                      {q.questionText}
                    </CardTitle>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 inline-block">
                      {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                    onClick={() => handleStartEdit(q)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteTarget(q)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {q.options.map((opt, optIndex) => {
                    const letters = ["A", "B", "C", "D"];
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                          opt.isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                            : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <span className="font-bold text-slate-400">{letters[optIndex]}.</span>
                        <span className="flex-1 truncate">{opt.optionText}</span>
                        {opt.isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Question Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Question"
        description="Are you sure you want to delete this question? Total quiz marks will be automatically updated."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 italic">
            &ldquo;{deleteTarget?.questionText}&rdquo;
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion}>
              Delete Question
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Student View Preview Dialog */}
      <Dialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Student Exam Preview"
        description="This preview shows how questions and options appear to students during the exam (answers are not revealed)."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Question {idx + 1}. {q.questionText}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 shrink-0">
                  {q.marks} pts
                </span>
              </div>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <input type="radio" disabled name={`preview-${q.id}`} className="h-4 w-4 text-blue-600" />
                    <span>{opt.optionText}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

