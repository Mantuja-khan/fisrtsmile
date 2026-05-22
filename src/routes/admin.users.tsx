import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { User, Ban, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/auth/users");
      return data;
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/auth/users/${id}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User blocked successfully");
    },
    onError: () => toast.error("Failed to block user"),
  });

  const unblockMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/auth/users/${id}/unblock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User unblocked successfully");
    },
    onError: () => toast.error("Failed to unblock user"),
  });

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <div className="text-sm text-muted-foreground">{users.length} total users</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u: any) => (
          <div
            key={u._id}
            className="bg-surface rounded-xl shadow-card border border-border/40 p-4 flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-base leading-tight">{u.full_name}</h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 inline-block ${u.role === "admin" ? "text-purple-600" : "text-muted-foreground"}`}
                >
                  {u.role}
                </span>
              </div>
              {u.isBlocked ? (
                <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-[10px] font-bold uppercase">
                  Blocked
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="size-3.5 text-slate-400 shrink-0" />
                <span className="truncate" title={u.email}>
                  {u.email}
                </span>
              </div>
              {u.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="size-3.5 text-slate-400 shrink-0" />
                  <span>{u.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                <Calendar className="size-3.5 text-slate-300 shrink-0" />
                <span>
                  Joined{" "}
                  {new Date(u.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {u.role !== "admin" && (
              <div className="pt-3 border-t border-border flex justify-end mt-auto">
                {u.isBlocked ? (
                  <button
                    onClick={() => unblockMutation.mutate(u._id)}
                    disabled={unblockMutation.isPending}
                    className="w-full md:w-auto bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                  >
                    <ShieldCheck className="size-4" /> Unblock User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm(`Block ${u.full_name}? They will lose portal access.`)) {
                        blockMutation.mutate(u._id);
                      }
                    }}
                    disabled={blockMutation.isPending}
                    className="w-full md:w-auto bg-destructive/5 text-destructive hover:bg-destructive/10 border border-destructive/20 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                  >
                    <Ban className="size-4" /> Block Access
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="col-span-full py-12 bg-surface rounded-xl shadow-sm border border-dashed border-border flex flex-col items-center text-muted-foreground">
            <User className="size-8 opacity-30 mb-2" />
            <p className="italic text-sm">No registered users yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
