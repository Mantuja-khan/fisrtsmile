import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { Lock, Mail, ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/password")({
  component: AdminPasswordPage,
});

function AdminPasswordPage() {
  const { user } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (!user?.email) return toast.error("Admin email identity missing");
    setBusy(true);
    try {
      await api.post("/auth/send-otp", { email: user.email, type: "forgot" });
      setOtpSent(true);
      toast.success("Security OTP sent to your admin email address! 📧");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to dispatch verification OTP");
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (!otp || otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setBusy(true);
    try {
      await api.post("/auth/reset-password", {
        email: user.email,
        otp,
        newPassword,
      });
      toast.success("Admin password successfully updated with verification!");
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password. Verify OTP.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="font-bold text-lg md:text-xl">Admin Password Security</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Change your administrative account password securely via email verification OTP.
        </p>
      </div>

      <div className="bg-surface rounded-xl shadow-card p-6 border border-border space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase block">
              Admin Account
            </span>
            <span className="text-sm font-bold text-foreground">{user?.email}</span>
          </div>
        </div>

        {!otpSent ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              To change your password, we will dispatch a one-time verification passcode (OTP) to
              your registered admin email inbox.
            </p>
            <button
              onClick={sendOtp}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-lg shadow-sm hover:brightness-110 transition disabled:opacity-50"
            >
              <Mail className="size-4" />
              <span>{busy ? "Sending Verification OTP..." : "Send OTP to Mail"}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={updatePassword} className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-primary font-medium flex justify-between items-center">
              <span>OTP sent to {user?.email}</span>
              <button
                type="button"
                onClick={sendOtp}
                className="underline font-bold hover:opacity-80"
              >
                Resend
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">
                Enter 6-Digit OTP
              </label>
              <input
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full px-3 py-2.5 text-center text-lg font-bold tracking-[0.5em] border border-input rounded-md outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter robust new password"
                  className="w-full pl-3 pr-10 py-2 text-sm border border-input rounded-md outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none transition"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-3 pr-10 py-2 text-sm border border-input rounded-md outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-md shadow-sm hover:brightness-110 transition disabled:opacity-50"
              >
                {busy ? "Verifying & Updating..." : "Verify OTP & Update Password"}
              </button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="bg-muted text-muted-foreground px-4 py-2.5 rounded-md font-semibold text-sm hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
