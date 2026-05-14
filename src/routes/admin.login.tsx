import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Lock, Mail } from "lucide-react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { z } from "zod";
import loginBg from "@/assets/loginsignup.png";
import loginHereImg from "@/assets/loginhere.png";

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
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <Shield className="size-12 mx-auto text-rose-500 mb-3" />
          <h1 className="text-xl font-bold text-slate-800">Not an admin account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            You are signed in as <span className="font-medium">{user.email}</span> which does not have admin
            privileges.
          </p>
          <button
            onClick={signOut}
            className="mt-4 bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition"
          >
            Sign out & try another account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4 md:p-8"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-[800px] rounded-3xl shadow-2xl flex flex-col md:flex-row-reverse overflow-hidden bg-white/90 md:bg-white backdrop-blur-md transition-all duration-500">
        {/* Side - Image for Desktop */}
        <div
          className="hidden md:block md:w-1/2 relative bg-cover bg-top min-h-[500px]"
          style={{ backgroundImage: `url(${loginHereImg})` }}
        />

        {/* Side - Form */}
        <div className="md:w-1/2 p-8 md:p-10 relative z-10 flex flex-col justify-center bg-white/60 md:bg-white">
          <div className="text-center mb-8">
            <h3 className="text-[#802a8f] font-bold text-xl uppercase tracking-wider">
              ADMIN LOGIN PANEL
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Welcome back to First Smile Admin Area</p>
          </div>

          <form onSubmit={submit} className="space-y-4 max-w-sm mx-auto w-full">
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-[#802a8f]/60" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                placeholder="Admin Email"
              />
            </div>

            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-[#802a8f]/60" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                placeholder="Password"
              />
            </div>

            <button
              disabled={busy}
              className="w-full bg-[#802a8f] text-white font-bold py-3 rounded-full shadow-sm hover:brightness-110 transition disabled:opacity-60 text-xs tracking-wider uppercase mt-6"
            >
              {busy ? "Signing in..." : "Login"}
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                Not an admin?{" "}
                <Link to="/account" className="text-[#802a8f] font-semibold hover:underline">
                  Customer login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
