import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { 
  User, Package, MapPin, LogIn, LogOut, Shield, XCircle, Eye, Phone, Home, 
  Building2, Map as MapIcon, Lock, Mail, ChevronRight, Bell, Save, LayoutDashboard, ShieldCheck 
} from "lucide-react";
import { redirectToPayU } from "@/utils/payu";
import { useAuth } from "@/store/auth";
import api from "@/services/api";
import { toast } from "sonner";
import { z } from "zod";
import loginBg from "@/assets/loginsignup.png";
import signupHereImg from "@/assets/signuphere.png";
import loginHereImg from "@/assets/loginhere.png";

const searchSchema = z.object({
  view: z.enum(["profile", "orders", "addresses", "password", "notifications"]).optional(),
});

export const Route = createFileRoute("/account")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({ meta: [{ title: "My Account — First Smile" }] }),
  component: AccountPage,
});

const strongPassword = z.string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password must contain at least one capital letter")
  .regex(/[a-z]/, "Password must contain at least one small letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[@$!%*?&#]/, "Password must contain at least one special symbol")
  .max(72);

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Invalid email address").max(255),
  password: strongPassword,
  phone: z.string().trim().min(10, "Invalid phone number").max(15),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: strongPassword,
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password required").max(72),
});

function AccountPage() {
  const { user, isAdmin, signIn, signUp, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { view: searchView } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [view, setView] = useState<"profile" | "orders" | "addresses" | "password" | "notifications">(searchView || "profile");

  useEffect(() => {
    if (searchView && searchView !== view) {
      setView(searchView as any);
    }
  }, [searchView]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground font-medium">Loading your profile interface...</div>;
  }

  if (user) {
    const name = user.full_name || user.email?.split("@")[0] || "User";
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#F4F6F9] py-6 md:py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
            
            {/* Premium Left Sidebar Area */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-6">
              
              {/* Profile Info Header Card */}
              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#BFDDF0] text-slate-900 border border-slate-200/60 flex items-center justify-center font-extrabold text-lg uppercase shadow-sm shrink-0">
                  {name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-extrabold text-[15px] text-slate-800 leading-tight truncate">{name}</h2>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Side Nav Navigation Block */}
              <div className="bg-white rounded-2xl py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col">
                
                {/* Isolated Top Nav: My Orders */}
                <div className="px-3">
                  <button 
                    onClick={() => setView("orders")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition ${
                      view === "orders" 
                        ? "bg-[#BFDDF0]/40 text-slate-900 border border-[#BFDDF0]/60 shadow-xs" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-[#BFDDF0]/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className={`w-[18px] h-[18px] ${view === "orders" ? "text-slate-900" : "text-slate-400"}`} />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${view === "orders" ? "text-slate-900" : "text-slate-300"}`} />
                  </button>
                </div>

                <div className="border-b border-slate-100/70 my-3"></div>

                {/* Group 1: Account Settings */}
                <div className="px-6 pb-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">Account Settings</span>
                </div>

                <div className="px-3 space-y-1">
                  <button 
                    onClick={() => setView("profile")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition ${
                      view === "profile" 
                        ? "bg-[#BFDDF0]/40 text-slate-900 border border-[#BFDDF0]/60 shadow-xs" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-[#BFDDF0]/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className={`w-[18px] h-[18px] ${view === "profile" ? "text-slate-900" : "text-slate-400"}`} />
                      <span>Profile Information</span>
                    </div>
                    {view !== "profile" && <ChevronRight className="w-4 h-4 text-slate-300" />}
                  </button>

                  <button 
                    onClick={() => setView("addresses")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition ${
                      view === "addresses" 
                        ? "bg-[#BFDDF0]/40 text-slate-900 border border-[#BFDDF0]/60 shadow-xs" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-[#BFDDF0]/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-[18px] h-[18px] ${view === "addresses" ? "text-slate-900" : "text-slate-400"}`} />
                      <span>Manage Addresses</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                </div>



                {isAdmin && (
                  <>
                    <div className="border-b border-slate-100/70 my-3"></div>
                    <div className="px-6 pb-1.5">
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">Admin Panel</span>
                    </div>
                    <div className="px-3">
                      <button 
                        onClick={() => navigate({ to: "/admin" })}
                        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-extrabold text-sm text-slate-800 bg-[#BFDDF0]/30 border border-[#BFDDF0]/50 hover:bg-[#BFDDF0]/50 transition"
                      >
                        <Shield className="w-[18px] h-[18px] text-slate-900" />
                        <span>Admin Dashboard</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="border-t border-slate-100 mt-4 pt-2 px-3">
                  <button 
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50/80 transition"
                  >
                    <LogOut className="w-[18px] h-[18px] text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>

              </div>

              {/* Safety / Security Guarantee Banner */}
              <div className="bg-[#BFDDF0]/30 border border-[#BFDDF0]/50 rounded-2xl p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">Your security is our priority</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    We use industry-standard measures to keep your information safe and secure.
                  </p>
                </div>
                <button 
                  onClick={() => navigate({ to: "/policies/privacy" })} 
                  className="text-xs font-extrabold text-slate-800 text-left hover:underline"
                >
                  Learn more &gt;
                </button>
              </div>

            </aside>

            {/* Main Right View Container */}
            <main className="flex-1 w-full bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden min-h-[600px]">
              {view === "profile" && <ProfileDetailsEngine />}
              {view === "orders" && <MyOrdersEngine />}
              {view === "addresses" && <AddressesEngine />}
              {view === "password" && <PasswordEngine />}
              {view === "notifications" && <NotificationsEngine />}
            </main>

          </div>
        </div>
      </div>
    );
  }

  const sendOtpRequest = async () => {
    if (!email) { toast.error("Please enter your email first"); return; }
    if (mode === "signup" && (!fullName || !phone || !password)) {
      toast.error("Please fill all details first");
      return;
    }
    setOtpBusy(true);
    try {
      await api.post("/auth/send-otp", { email, type: mode === "forgot" ? "forgot" : "signup" });
      setOtpSent(true);
      toast.success("OTP sent to your email! 📧");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((mode === "signup" || mode === "forgot") && !otpSent) {
      await sendOtpRequest();
      return;
    }

    if (mode === "forgot" && otpSent && !otpVerified) {
      setOtpBusy(true);
      try {
        await api.post("/auth/verify-otp", { email, otp });
        setOtpVerified(true);
        toast.success("OTP verified. Please set your new password.");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Invalid OTP");
      } finally {
        setOtpBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const v = signupSchema.safeParse({ fullName, email, password, phone, otp });
        if (!v.success) { toast.error(v.error.issues[0].message); return; }
        const { error } = await signUp(v.data.email, v.data.password, v.data.fullName, v.data.phone, v.data.otp);
        if (error) { toast.error(error); return; }
        toast.success("Account created! 🎉 Welcome to First Smile.");
        localStorage.setItem("signup_phone", v.data.phone);
        localStorage.setItem("show_signup_discount_popup", "true");
        window.dispatchEvent(new Event("trigger-discount-popup"));
        setMode("login");
      } else if (mode === "forgot") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setBusy(false);
          return;
        }
        const v = resetPasswordSchema.safeParse({ email, otp, newPassword: password });
        if (!v.success) { toast.error(v.error.issues[0].message); return; }
        await api.post("/auth/reset-password", v.data);
        toast.success("Password reset successful! You can now log in.");
        setMode("login");
        setOtpSent(false);
        setOtpVerified(false);
        setOtp("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const v = loginSchema.safeParse({ email, password });
        if (!v.success) { toast.error(v.error.issues[0].message); return; }
        const { error } = await signIn(v.data.email, v.data.password);
        if (error) { toast.error(error); return; }
        toast.success("Logged in successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-140px)] w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4 md:p-8"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>

      <div className={`relative z-10 w-full max-w-[800px] rounded-3xl shadow-2xl flex flex-col ${(mode === "login" || mode === "forgot") ? "md:flex-row-reverse" : "md:flex-row"} overflow-hidden bg-white/90 md:bg-white backdrop-blur-md transition-all duration-500`} key={mode}>
        {/* Side - Image for Desktop */}
        <div
          className="hidden md:block md:w-1/2 relative bg-cover bg-top min-h-[500px]"
          style={{ backgroundImage: `url(${mode === 'signup' ? signupHereImg : loginHereImg})` }}
        />

        {/* Side - Form */}
        <div className="md:w-1/2 p-8 md:p-10 relative z-10 flex flex-col justify-center bg-white/60 md:bg-white">
          <div className="text-center mb-8">
            <h3 className="text-[#802a8f] font-bold text-xl uppercase tracking-wider">
              {mode === "login" ? "USER LOGIN" : mode === "signup" ? "CREATE ACCOUNT" : "RESET PASSWORD"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Welcome to First Smile</p>
          </div>

          <form onSubmit={submit} className="space-y-4 max-w-sm mx-auto w-full">
            {mode === "signup" && (
              <div className="space-y-4">
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-[#802a8f]/60" />
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                    placeholder="Full Name"
                  />
                </div>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 w-4 h-4 text-[#802a8f]/60" />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
            )}

            {(!otpSent || mode !== "forgot") && (
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-[#802a8f]/60" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                  placeholder="Email Address"
                />
              </div>
            )}

            {(mode !== "forgot" || otpVerified) && (
              <div className="mt-4 flex flex-col">
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-[#802a8f]/60" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                    placeholder={mode === "forgot" ? "New Password" : "Password"}
                  />
                </div>
              </div>
            )}

            {mode === "forgot" && otpVerified && (
              <div className="relative flex items-center mt-4">
                <Lock className="absolute left-4 w-4 h-4 text-[#802a8f]/60" />
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                  placeholder="Confirm New Password"
                />
              </div>
            )}

            {otpSent && (!otpVerified || mode === "signup") && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between px-2">
                  <label className="text-[11px] font-bold text-[#802a8f] uppercase">Enter 6-Digit OTP</label>
                  <button type="button" onClick={sendOtpRequest} className="text-[10px] text-[#802a8f] hover:underline">Resend?</button>
                </div>
                <input
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 text-center text-lg font-bold tracking-[0.5em] bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition text-[#802a8f]"
                  placeholder="000000"
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-between items-center px-2 text-[11px] font-medium text-muted-foreground mt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="accent-[#802a8f]" /> Remember
                </label>
                <button type="button" onClick={() => { setMode("forgot"); setOtpSent(false); setOtpVerified(false); }} className="hover:text-[#802a8f] transition">Forgot password?</button>
              </div>
            )}

            <button disabled={busy || otpBusy} className="w-full bg-[#802a8f] text-white font-bold py-3 rounded-full shadow-sm hover:brightness-110 transition disabled:opacity-60 text-xs tracking-wider uppercase mt-6">
              {busy || otpBusy ? "Please wait..." : (
                mode === "login" ? "Login" :
                  mode === "forgot" ? (
                    otpVerified ? "Set Password" :
                      otpSent ? "Verify OTP" : "Send OTP"
                  ) :
                    otpSent ? "Confirm & Register" : "Send OTP"
              )}
            </button>

            <div className="text-center mt-6">
              <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setOtpSent(false); }} className="text-xs text-muted-foreground hover:text-[#802a8f] transition">
                {mode === "login" ? "Create Account" : "Back to Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =======================================================================
   1. Profile Information Component Engine (Matching Premium Screen Mockup)
   ======================================================================= */
function ProfileDetailsEngine() {
  const { user, updateProfile } = useAuth();
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const reset = () => {
    setName(user?.full_name || "");
    setPhone(user?.phone || "");
    toast("Form reset to original details.");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile) return;
    setBusy(true);
    const { error } = await updateProfile({ full_name: name, phone });
    setBusy(false);
    if (!error) toast.success("Profile updated successfully!");
  };

  return (
    <div className="p-6 md:p-10 relative overflow-hidden">
      
      {/* Background Subtle Illustration Pattern */}
      <div className="absolute top-8 right-8 hidden md:block opacity-[0.15] pointer-events-none">
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#BFDDF0]">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      </div>

      {/* Main Profile Header */}
      <div className="flex items-center gap-4 pb-8 mb-8 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-[#BFDDF0]/30 border border-[#BFDDF0]/50 text-slate-800 flex items-center justify-center shrink-0 shadow-xs">
          <User className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Profile Information</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Update your personal details and contact information.</p>
        </div>
      </div>

      <form onSubmit={save} className="max-w-2xl space-y-7">
        
        {/* Field: Full Name */}
        <div className="space-y-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-bold text-slate-800">Full Name</label>
            <span className="text-[11px] text-slate-400 font-medium">This is the name displayed on your account.</span>
          </div>
          <div className="relative flex items-center">
            <User className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-700 font-medium placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Field: Email Address */}
        <div className="space-y-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-bold text-slate-800">Email Address</label>
            <span className="text-[11px] text-slate-400 font-medium">We'll never share your email with anyone else.</span>
          </div>
          <div className="relative flex items-center">
            <Mail className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={user?.email || ""}
              disabled
              placeholder="Email Address"
              className="w-full pl-11 pr-28 py-3 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl text-slate-500 outline-none cursor-not-allowed font-medium"
            />
            <div className="absolute right-3 flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs pointer-events-none uppercase tracking-wide">
              <span>Verified</span>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
          </div>
        </div>

        {/* Field: Phone Number */}
        <div className="space-y-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-bold text-slate-800">Phone Number</label>
            <span className="text-[11px] text-slate-400 font-medium">Add your phone number for quick support and important alerts.</span>
          </div>
          <div className="relative flex items-center">
            <Phone className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              required
              disabled={Boolean(user?.phone)}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className={`w-full pl-11 pr-28 py-3 text-sm border rounded-xl outline-none transition font-medium ${
                user?.phone
                  ? "bg-slate-50/80 border-slate-200/80 text-slate-500 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-700 focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 placeholder:text-slate-300"
              }`}
            />
            {Boolean(user?.phone) && (
              <div className="absolute right-3 flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs pointer-events-none uppercase tracking-wide">
                <span>Verified</span>
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
            )}
          </div>
        </div>

        {/* Elegant Alert banner at form base */}
        <div className="bg-[#BFDDF0]/20 rounded-xl p-4 flex gap-3.5 mt-8 border border-[#BFDDF0]/40 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Keep your information up to date</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
              Ensure your contact information is accurate so we can reach you when needed.
            </p>
          </div>
        </div>

        {/* Responsive Action Row Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button 
            disabled={busy} 
            type="submit"
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm border border-[#BFDDF0]/20 hover:bg-slate-800 active:scale-95 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{busy ? "Saving Changes..." : "Save Changes"}</span>
          </button>

          <button 
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm px-6 py-3 rounded-xl shadow-xs active:scale-95 transition"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.89M21 12h-6" /></svg>
            <span>Reset</span>
          </button>
        </div>

      </form>
    </div>
  );
}

/* =======================================================================
   2. Orders View Engine
   ======================================================================= */
type MyOrder = {
  _id: string;
  order_number: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled" | "return requested" | "returned";
  total: number;
  createdAt: string;
  payment_method: string;
  isPaid?: boolean;
  refund_status?: string;
  items: { name: string; quantity: number; price: number; image?: string; product: string }[];
};

function MyOrdersEngine() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const payOnline = async (o: MyOrder) => {
    setPayingId(o._id);
    try {
      const { data } = await api.post(`/orders/${o._id}/payu`);
      redirectToPayU(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPayingId(null);
    }
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get("/orders/myorders");
      setOrders(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    setCancellingId(id);
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success("Order cancelled successfully.");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const requestReturn = async (id: string) => {
    if (!confirm("Request a return for this order? Our support will contact you to arrange pickup.")) return;
    setCancellingId(id);
    try {
      await api.put(`/orders/${id}/return`);
      toast.success("Return request submitted successfully!");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit return");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="p-16 text-center text-slate-400 font-medium">Loading your orders...</div>;
  
  if (orders.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-4 border border-slate-100">
          <Package className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="font-bold text-lg text-slate-800">No orders placed yet</h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">Explore our curated collections to start your journey.</p>
        <Link to="/products" className="inline-block bg-slate-900 border border-[#BFDDF0]/30 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm hover:bg-slate-800 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  const statusBadge = (s: MyOrder["status"], refund_status?: string) => {
    const map: Record<string, string> = {
      placed: "bg-blue-50 text-blue-700 border-blue-100",
      processing: "bg-amber-50 text-amber-700 border-amber-100",
      shipped: "bg-purple-50 text-purple-700 border-purple-100",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
      cancelled: "bg-rose-50 text-rose-700 border-rose-100",
      "return requested": "bg-indigo-50 text-indigo-700 border-indigo-100",
      "returned": "bg-slate-100 text-slate-700 border-slate-200",
    };
    const key = s.toLowerCase() as keyof typeof map;
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide uppercase ${map[key] || "bg-slate-50 text-slate-600"}`}>
          {s}
        </span>
        {refund_status && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100 uppercase">
            Refund: {refund_status}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="divide-y divide-slate-100">
      <div className="p-6 md:px-8 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">My Orders</h2>
        <p className="text-xs text-slate-500 mt-0.5">Track, manage, or return your purchased items.</p>
      </div>

      {orders.map((o) => {
        const lstatus = o.status.toLowerCase();
        const isCancelled = lstatus === "cancelled";
        const isDelivered = lstatus === "delivered";
        const diffTime = Math.abs(new Date().getTime() - new Date(o.createdAt).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const withinFourDays = diffDays <= 4;
        const canRequestReturn = isDelivered && withinFourDays && lstatus !== "return requested" && lstatus !== "returned";

        return (
          <div key={o._id} className="p-6 md:px-8 hover:bg-slate-50/50 transition">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-50 text-xs text-slate-500">
              <div>
                <span className="font-bold text-slate-800 block md:inline">Order #{o.order_number}</span>
                <span className="hidden md:inline mx-2">•</span>
                <span>Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                {!o.isPaid && lstatus !== "cancelled" && lstatus !== "returned" && (
                  <button
                    onClick={() => payOnline(o)}
                    disabled={payingId === o._id}
                    className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
                  >
                    {payingId === o._id ? "Connecting..." : "Pay Online"}
                  </button>
                )}
                {canRequestReturn && (
                  <button
                    onClick={() => requestReturn(o._id)}
                    disabled={cancellingId === o._id}
                    className="border border-purple-200 text-purple-700 font-bold px-3 py-1.5 rounded-lg hover:bg-purple-50 transition"
                  >
                    Request Return
                  </button>
                )}
                {!isDelivered && !isCancelled && lstatus !== "return requested" && lstatus !== "returned" && (
                  <button
                    onClick={() => cancel(o._id)}
                    disabled={cancellingId === o._id}
                    className="border border-rose-200 text-rose-600 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition"
                  >
                    {cancellingId === o._id ? "Wait..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>

            {o.items?.map((it, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 cursor-pointer" onClick={() => navigate({ to: "/track", search: { orderId: o.order_number } as any })}>
                <img src={it.image || "https://placehold.co/100x100?text=Toy"} alt={it.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 truncate">{it.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Qty: {it.quantity} × ₹{Number(it.price).toLocaleString("en-IN")}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-bold text-sm text-slate-900 block mb-1">₹{(it.quantity * it.price).toLocaleString("en-IN")}</span>
                  {statusBadge(o.status, o.refund_status)}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* =======================================================================
   3. Manage Addresses Engine
   ======================================================================= */
function AddressesEngine() {
  const { user, updateProfile } = useAuth();
  const [busy, setBusy] = useState(false);

  const [addr, setAddr] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [pin, setPin] = useState(user?.pincode || "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile) return;
    setBusy(true);
    const { error } = await updateProfile({ address: addr, city, state, pincode: pin });
    setBusy(false);
    if (!error) toast.success("Address information saved successfully!");
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-4 pb-8 mb-8 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-[#BFDDF0]/30 border border-[#BFDDF0]/50 text-slate-800 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Manage Addresses</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Configure your primary delivery endpoint details.</p>
        </div>
      </div>

      <form onSubmit={save} className="max-w-xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Street Address / Area</label>
          <textarea
            required
            value={addr}
            onChange={e => setAddr(e.target.value)}
            rows={3}
            placeholder="Flat No, Wing, Apartment name, Landmark..."
            className="w-full p-4 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-800 font-medium resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">City</label>
            <input
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="City"
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-800 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">State</label>
            <input
              required
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="State"
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-800 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Pincode</label>
            <input
              required
              type="number"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Pincode"
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            disabled={busy} 
            className="inline-flex items-center gap-2 bg-slate-900 border border-[#BFDDF0]/20 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:bg-slate-800 active:scale-95 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{busy ? "Saving Address..." : "Save Address"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/* =======================================================================
   4. Change Password Engine
   ======================================================================= */
function PasswordEngine() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass) {
      toast.error("Please enter both current and new passwords");
      return;
    }
    setBusy(true);
    try {
      await api.put("/auth/update-password", { currentPassword: oldPass, newPassword: newPass });
      toast.success("Password successfully updated!");
      setOldPass("");
      setNewPass("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-4 pb-8 mb-8 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-[#BFDDF0]/30 border border-[#BFDDF0]/50 text-slate-800 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Change Password</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Secure your identity with a robust passphrase credential.</p>
        </div>
      </div>

      <form onSubmit={save} className="max-w-xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Current Password</label>
          <input
            type="password"
            required
            value={oldPass}
            onChange={e => setOldPass(e.target.value)}
            placeholder="Current Password"
            className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-800 font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">New Password</label>
          <input
            type="password"
            required
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="New robust password"
            className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-800 font-medium"
          />
        </div>

        <div className="pt-2">
          <button 
            disabled={busy} 
            className="inline-flex items-center gap-2 bg-slate-900 border border-[#BFDDF0]/20 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:bg-slate-800 active:scale-95 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{busy ? "Updating Passphrase..." : "Update Passphrase"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/* =======================================================================
   5. Notification Settings Engine
   ======================================================================= */
function NotificationsEngine() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification dispatch priorities synchronized.");
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-4 pb-8 mb-8 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-[#BFDDF0]/30 border border-[#BFDDF0]/50 text-slate-800 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Notification Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Control how automated event handoffs alert your channels.</p>
        </div>
      </div>

      <form onSubmit={save} className="max-w-xl space-y-6">
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition">
            <input 
              type="checkbox" 
              checked={emailNotif} 
              onChange={e => setEmailNotif(e.target.checked)} 
              className="w-4 h-4 accent-[#802a8f] rounded"
            />
            <div>
              <span className="font-bold text-sm text-slate-800 block">Email Broadcasts</span>
              <span className="text-xs text-slate-400">Receive order progression details and periodic tailored offers.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition">
            <input 
              type="checkbox" 
              checked={smsNotif} 
              onChange={e => setSmsNotif(e.target.checked)} 
              className="w-4 h-4 accent-[#802a8f] rounded"
            />
            <div>
              <span className="font-bold text-sm text-slate-800 block">SMS / WhatsApp Notifications</span>
              <span className="text-xs text-slate-400">Instant tracking dispatches and delivery fulfillment timestamps.</span>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="inline-flex items-center gap-2 bg-slate-900 border border-[#BFDDF0]/20 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:bg-slate-800 active:scale-95 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
