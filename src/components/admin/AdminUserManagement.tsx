"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { toggleUserStatusAction, deleteUserAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { UserX, UserCheck, Trash2 } from "lucide-react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  _count: {
    quizzesCreated: number;
    attempts: number;
  };
}

interface AdminUserManagementProps {
  users: UserRecord[];
  currentUserId: string;
}

export function AdminUserManagement({ users, currentUserId }: AdminUserManagementProps) {
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [toggleTarget, setToggleTarget] = React.useState<UserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<UserRecord | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    setIsProcessing(true);
    const res = await toggleUserStatusAction(toggleTarget.id);
    setIsProcessing(false);
    setToggleTarget(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(
        toggleTarget.isActive ? "User account deactivated." : "User account activated successfully."
      );
      router.refresh();
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    const res = await deleteUserAction(deleteTarget.id);
    setIsProcessing(false);
    setDeleteTarget(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("User account deleted successfully.");
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", Role.STUDENT, Role.TEACHER, Role.ADMIN].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                roleFilter === role
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {role === "ALL" ? "All Roles" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Registered Accounts</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No user accounts found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Quizzes / Attempts</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUserId;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              u.role === Role.ADMIN
                                ? "destructive"
                                : u.role === Role.TEACHER
                                ? "warning"
                                : "default"
                            }
                            className="text-xs"
                          >
                            {u.role}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={u.isActive ? "success" : "secondary"}>
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {u.role === Role.TEACHER
                            ? `${u._count.quizzesCreated} Quizzes Created`
                            : `${u._count.attempts} Quizzes Attempted`}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isSelf ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-2 text-xs ${
                                  u.isActive ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                                }`}
                                onClick={() => setToggleTarget(u)}
                              >
                                {u.isActive ? <UserX className="h-3.5 w-3.5 mr-1" /> : <UserCheck className="h-3.5 w-3.5 mr-1" />}
                                <span>{u.isActive ? "Deactivate" : "Activate"}</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => setDeleteTarget(u)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Current User</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toggle Status Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.isActive ? "Deactivate User Account" : "Activate User Account"}
        description={
          toggleTarget?.isActive
            ? "Deactivated users will be prevented from logging into the platform until re-activated."
            : "Activating this account will restore access to login and portal features."
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Confirm status change for <span className="font-bold">{toggleTarget?.name}</span> ({toggleTarget?.email})?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setToggleTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={toggleTarget?.isActive ? "destructive" : "default"}
              isLoading={isProcessing}
              onClick={handleToggleStatus}
            >
              Confirm {toggleTarget?.isActive ? "Deactivation" : "Activation"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete User Permanently"
        description="This action cannot be undone. All data owned by this user will be removed."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to delete <span className="font-bold">{deleteTarget?.name}</span> ({deleteTarget?.email})?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" isLoading={isProcessing} onClick={handleDeleteUser}>
              Delete User
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

