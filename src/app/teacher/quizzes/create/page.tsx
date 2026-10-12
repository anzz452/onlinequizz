import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { QuizForm } from "@/components/teacher/QuizForm";

export default async function CreateQuizPage() {
  const session = await requireRole([Role.TEACHER, Role.ADMIN]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="Create New Quiz"
        description="Fill in examination parameters and settings"
      />
      <div className="flex justify-center">
        <QuizForm mode="create" />
      </div>
    </div>
  );
}

