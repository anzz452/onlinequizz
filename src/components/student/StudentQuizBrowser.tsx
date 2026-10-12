"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Clock, Award, FileQuestion, ArrowRight, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

interface StudentQuizItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  teacher: {
    name: string;
  };
  _count: {
    questions: number;
  };
}

export function StudentQuizBrowser({ quizzes }: { quizzes: StudentQuizItem[] }) {
  const [search, setSearch] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("ALL");

  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => set.add(q.subject));
    return ["ALL", ...Array.from(set)];
  }, [quizzes]);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === "ALL" || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search quizzes by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {sub === "ALL" ? "All Subjects" : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <Card className="border-dashed py-12 text-center text-slate-500">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No quizzes match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search keyword or selecting a different subject filter.</p>
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
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{quiz.teacher.name}</span>
                  </span>
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
                    <span>{quiz.totalMarks} Marks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileQuestion className="h-3.5 w-3.5 text-slate-400" />
                    <span>{quiz._count.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-semibold">Pass: {quiz.passingMarks}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Link href={`/student/quizzes/${quiz.id}`} className="w-full">
                  <Button className="w-full gap-2 text-xs">
                    <span>View & Start Quiz</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

