"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Award,
  Edit,
  Trash2,
  FileQuestion,
  Globe,
  Users,
} from "lucide-react";
import { QuizStatus } from "@prisma/client";
import { togglePublishQuizAction, deleteQuizAction } from "@/actions/quizzes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatDuration } from "@/lib/utils";

interface QuizItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: QuizStatus;
  _count: {
    questions: number;
    attempts: number;
  };
  createdAt: Date;
}

export function TeacherQuizList({ quizzes }: { quizzes: QuizItem[] }) {
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = React.useState<QuizItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isPublishingId, setIsPublishingId] = React.useState<string | null>(null);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleTogglePublish = async (quiz: QuizItem) => {
    setIsPublishingId(quiz.id);
    const res = await togglePublishQuizAction(quiz.id);
    setIsPublishingId(null);

    if (res.error) {
      toast.error(res.error, "Publication Error");
    } else {
      toast.success(
        quiz.status === QuizStatus.PUBLISHED ? "Quiz unpublished to draft." : "Quiz published successfully!",
        "Status Updated"
      );
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteQuizAction(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (res.error) {
      toast.error(res.error, "Delete Failed");
    } else {
      toast.success("Quiz deleted successfully.");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", QuizStatus.PUBLISHED, QuizStatus.DRAFT].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {status === "ALL" ? "All Statuses" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <Card className="border-dashed py-12 text-center text-slate-500">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No quizzes found</p>
          <p className="text-xs text-slate-400 mt-1">
            {quizzes.length === 0
              ? "You haven't authored any quizzes yet. Click 'Create New Quiz' to begin."
              : "Try adjusting your search query or status filter."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {quiz.subject}
                  </Badge>
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
                <CardTitle className="text-base font-bold line-clamp-1">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{quiz.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatDuration(quiz.durationMinutes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-slate-400" />
                    <span>{quiz.totalMarks} Marks (Pass: {quiz.passingMarks})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileQuestion className="h-3.5 w-3.5 text-slate-400" />
                    <span>{quiz._count.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{quiz._count.attempts} Submissions</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex flex-col gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Link href={`/teacher/quizzes/${quiz.id}/questions`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <FileQuestion className="h-3.5 w-3.5 text-blue-600" />
                      <span>Questions ({quiz._count.questions})</span>
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant={quiz.status === QuizStatus.PUBLISHED ? "secondary" : "default"}
                    className="gap-1.5 text-xs"
                    isLoading={isPublishingId === quiz.id}
                    onClick={() => handleTogglePublish(quiz)}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>{quiz.status === QuizStatus.PUBLISHED ? "Unpublish" : "Publish"}</span>
                  </Button>
                </div>

                <div className="flex items-center justify-between w-full pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/teacher/quizzes/${quiz.id}/edit`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-slate-600">
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Settings</span>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteTarget(quiz)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Quiz Confirmation"
        description="This action cannot be undone and will delete all questions, options, and student attempt records associated with this quiz."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to permanently delete{" "}
            <span className="font-bold">&ldquo;{deleteTarget?.title}&rdquo;</span>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" isLoading={isDeleting} onClick={handleDelete}>
              Delete Quiz Permanently
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

