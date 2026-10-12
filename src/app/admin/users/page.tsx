import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardHeader } from "@/components/navigation/DashboardHeader";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireRole([Role.ADMIN]);

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          quizzesCreated: true,
          attempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={session}
        title="User Management"
        description="View registered accounts, toggle active/inactive access, and manage user roles"
      />

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Users</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Total of {users.length} registered accounts across all roles.
        </p>
      </div>

      <AdminUserManagement users={users} currentUserId={session.userId} />
    </div>
  );
}

