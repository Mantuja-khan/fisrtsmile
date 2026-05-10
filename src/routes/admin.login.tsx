import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Lock, Mail } from "lucide-react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — First Smile" }] }),
  component: AdminLoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(72),
});

function AdminLoginPage() {
  const { user, isAdmin, signIn, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, user, isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = schema.safeParse({ email, password });
    if (!v.success) {
      toast.error(v.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const { error } = await signIn(v.data.email, v.data.password);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Welcome, Admin!");
      // navigate handled by effect once isAdmin resolves
      setTimeout(() => navigate({ to: "/admin" }), 400);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;
  }

  // Logged in as a non-admin — show clear message
  if (user && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <div className="bg-surface rounded-2xl shadow-card p-8">
          <Shield className="size-12 mx-auto text-destructive mb-3" />
          <h1 className="text-xl font-bold">Not an admin account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            You are signed in as <span className="font-medium">{user.email}</span> which does not have admin
            privileges.
          </p>
          <button
            onClick={signOut}
            className="mt-4 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-md"
          >
            Sign out & try another account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
        <div className="bg-gradient-banner text-primary-foreground p-6">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-white/20 grid place-items-center">
              <Shield className="size-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl">Admin Login</h1>
              <p className="text-xs opacity-90">Restricted area · Authorised personnel only</p>
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Admin Email</span>
            <div className="mt-1 flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring">
              <Mail className="size-4 text-muted-foreground ml-3" />
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-transparent outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Password</span>
            <div className="mt-1 flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring">
              <Lock className="size-4 text-muted-foreground ml-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-transparent outline-none"
              />
            </div>
          </label>
          <button
            disabled={busy}
            className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-md hover:brightness-110 transition disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Login as Admin"}
          </button>
          <p className="text-center text-xs text-muted-foreground pt-2">
            Not an admin?{" "}
            <Link to="/account" className="text-primary font-semibold">
              Customer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
