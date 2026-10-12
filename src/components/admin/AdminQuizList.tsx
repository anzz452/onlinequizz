"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { QuizStatus } from "@prisma/client";
import { adminDeleteQuizAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface AdminQuizItem {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: QuizStatus;
  createdAt: Date;
  teacher: {
    name: string;
    email: string;
  };
  _count: {
    questions: number;
    attempts: number;
  };
}

export function AdminQuizList({ quizzes }: { quizzes: AdminQuizItem[] }) {
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<AdminQuizItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filtered = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase()) ||
      q.teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await adminDeleteQuizAction(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Quiz deleted successfully.");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="max-w-sm">
        <input
          type="text"
          placeholder="Search by title, subject, or instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>All Platform Quizzes</CardTitle>
          <CardDescription>
            Showing {filtered.length} of {quizzes.length} examinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No quizzes found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4">Duration & Marks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submissions</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {q.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {q.subject}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                        <div>{q.teacher.name}</div>
                        <div className="text-[10px] text-slate-400">{q.teacher.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <div>{formatDuration(q.durationMinutes)}</div>
                        <div className="text-slate-400">
                          {q.totalMarks} Marks (Pass: {q.passingMarks})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            q.status === QuizStatus.PUBLISHED
                              ? "success"
                              : q.status === QuizStatus.DRAFT
                              ? "warning"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {q.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {q._count.attempts} attempts ({q._count.questions} questions)
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleteTarget(q)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete Quiz</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Admin Delete Quiz"
        description="Permanently delete this quiz across the system. This cascades to all associated questions and student attempts."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Confirm permanent deletion of quiz &ldquo;{deleteTarget?.title}&rdquo;?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" isLoading={isDeleting} onClick={handleDelete}>
              Delete Quiz
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

