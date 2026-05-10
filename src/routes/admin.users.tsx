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

      <div className="bg-surface rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u: any) => (
                <tr key={u._id} className="hover:bg-accent/50 transition">
                  <td className="px-4 py-4">
                    <div className="font-bold text-base">{u.full_name}</div>
                    <div className="text-xs text-muted-foreground uppercase">{u.role}</div>
                  </td>
                  <td className="px-4 py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Mail className="size-3 text-muted-foreground" /> {u.email}
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="size-3 text-muted-foreground" /> {u.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="size-3 text-muted-foreground" />
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {u.isBlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase">Blocked</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-discount/10 text-discount text-[10px] font-bold uppercase">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {u.role !== "admin" && (
                      u.isBlocked ? (
                        <button
                          onClick={() => unblockMutation.mutate(u._id)}
                          disabled={unblockMutation.isPending}
                          className="text-discount hover:bg-discount/10 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <ShieldCheck className="size-4" /> Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to block ${u.full_name}? They will not be able to log in or register again.`)) {
                              blockMutation.mutate(u._id);
                            }
                          }}
                          disabled={blockMutation.isPending}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Ban className="size-4" /> Block
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
