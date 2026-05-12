import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { User, Package, MapPin, LogIn, LogOut, Shield, XCircle, Eye, Phone, Home, Building2, Map as MapIcon, Lock, Mail, ChevronRight } from "lucide-react";
import { redirectToPayU } from "@/utils/payu";
import { useAuth } from "@/store/auth";
import api from "@/services/api";
import { toast } from "sonner";
import { z } from "zod";
import loginBg from "@/assets/loginsignup.png";
import logoImg from "@/assets/firstsmile_logo.png";
import heroImg from "@/assets/hero-toys.jpg";
import loginHereImg from "@/assets/loginhere.png";
import signupHereImg from "@/assets/signuphere.png";
import offersGetImg from "@/assets/offerget.png";

const searchSchema = z.object({
  view: z.enum(["profile", "orders", "addresses"]).optional(),
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
  const { user, isAdmin, signIn, signUp, signOut, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { view: searchView } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [view, setView] = useState<"profile" | "orders" | "addresses">(searchView || "profile");

  useEffect(() => {
    if (searchView && searchView !== view) {
      setView(searchView);
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
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;
  }

  if (user) {
    const name = user.full_name || user.email?.split("@")[0] || "User";
    return (
      <div className="min-h-[calc(100vh-140px)] bg-slate-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Professional Responsive Sidebar Navigation */}
            <aside className="w-full lg:w-1/3 xl:w-1/4 space-y-6 shrink-0 lg:sticky lg:top-24 transition-all">
              
              {/* High-End User Header */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E43E3D] via-[#802a8f] to-[#E43E3D]"></div>
                <div className="size-16 rounded-2xl bg-gradient-to-br from-rose-500 to-[#E43E3D] text-white grid place-items-center font-bold text-2xl uppercase shadow-md group-hover:scale-105 transition-transform shrink-0">
                  {name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Hello,</p>
                  <h2 className="font-bold text-xl text-slate-800 truncate leading-tight">{name}</h2>
                  {isAdmin && (
                    <div className="mt-1.5 text-[10px] bg-violet-100 text-[#802a8f] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-violet-200">
                      <Shield className="size-3" /> ADMIN
                    </div>
                  )}
                </div>
              </div>

              {/* Glassy Smooth Navigation */}
              <nav className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-2 space-y-1">
                  
                  <button 
                    onClick={() => setView("orders")} 
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      view === "orders" 
                        ? "bg-[#E43E3D] text-white shadow-md" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Package className={`size-5 ${view === "orders" ? "text-white" : "text-slate-400 group-hover:text-[#E43E3D]"}`} />
                    <span className="font-bold text-sm flex-1 text-left">My Orders</span>
                    <ChevronRight className={`size-4 opacity-50 ${view === "orders" ? "rotate-0" : "-rotate-0"}`} />
                  </button>

                  <div className="pt-4 pb-2 px-4 flex items-center gap-2">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settings</span>
                    <div className="h-px bg-slate-100 flex-1"></div>
                  </div>

                  <button 
                    onClick={() => setView("profile")} 
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      view === "profile" 
                        ? "bg-[#E43E3D] text-white shadow-md" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <User className={`size-5 ${view === "profile" ? "text-white" : "text-slate-400 group-hover:text-[#E43E3D]"}`} />
                    <span className="font-bold text-sm flex-1 text-left">Profile Information</span>
                  </button>

                  <button 
                    onClick={() => setView("addresses")} 
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      view === "addresses" 
                        ? "bg-[#E43E3D] text-white shadow-md" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <MapPin className={`size-5 ${view === "addresses" ? "text-white" : "text-slate-400 group-hover:text-[#E43E3D]"}`} />
                    <span className="font-bold text-sm flex-1 text-left">Manage Addresses</span>
                  </button>

                  <div className="h-px bg-slate-100 my-2 mx-2"></div>

                  {isAdmin && (
                    <button
                      onClick={() => navigate({ to: "/admin" })}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-violet-700 font-bold hover:bg-violet-50 hover:text-violet-900 transition-colors duration-200"
                    >
                      <Shield className="size-5 text-violet-400" /> 
                      <span className="text-sm flex-1 text-left uppercase tracking-wide">Admin Panel</span>
                    </button>
                  )}

                  <button 
                    onClick={signOut} 
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors duration-200"
                  >
                    <LogOut className="size-5 text-rose-400" /> 
                    <span className="text-sm flex-1 text-left">Sign Out</span>
                  </button>
                </div>
              </nav>
            </aside>

            {/* Content Engine Pane */}
            <main className="w-full lg:flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm min-h-[500px] overflow-hidden relative animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-6 md:p-8">
                {view === "profile" && <ProfileDetails />}
                {view === "orders" && <MyOrders />}
                {view === "addresses" && <Addresses />}
              </div>
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
    <>
      <div
        className="min-h-[calc(100vh-140px)] w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4 md:p-8"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>

        <div className={`relative z-10 w-full max-w-[800px] rounded-3xl shadow-2xl flex flex-col ${(mode === "login" || mode === "forgot") ? "md:flex-row-reverse" : "md:flex-row"} overflow-hidden bg-white/80 md:bg-white backdrop-blur-md md:backdrop-blur-none transition-all duration-500 ease-in-out`} key={mode}>

          {/* Mobile Background */}
          <div
            className="md:hidden absolute inset-0 bg-cover bg-top opacity-60 blur-sm pointer-events-none"
            style={{ backgroundImage: `url(${mode === 'signup' ? signupHereImg : loginHereImg})` }}
          ></div>

          {/* Side - Image for Desktop */}
          <div
            className="hidden md:block md:w-1/2 relative bg-cover bg-top min-h-[500px] animate-in fade-in slide-in-from-bottom duration-500"
            style={{ backgroundImage: `url(${mode === 'signup' ? signupHereImg : loginHereImg})` }}
          >
          </div>

          {/* Side - Form */}
          <div className="md:w-1/2 p-8 md:p-10 relative z-10 flex flex-col justify-center bg-white/40 md:bg-white animate-in fade-in slide-in-from-top duration-500">
            <div className="text-center mb-8">
              <h3 className="text-[#802a8f] font-bold text-xl uppercase tracking-wider">
                {mode === "login" ? "USER LOGIN" : mode === "signup" ? "CREATE ACCOUNT" : "RESET PASSWORD"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Welcome to the website</p>
            </div>

            <form onSubmit={submit} className="space-y-4 max-w-sm mx-auto w-full">
              {mode === "signup" && (
                <div className="space-y-4">
                  <div className="relative flex items-center">
                    <User className="absolute left-4 size-4 text-[#802a8f]/60" />
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                      placeholder="Username"
                    />
                  </div>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 size-4 text-[#802a8f]/60" />
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
                  <Mail className="absolute left-4 size-4 text-[#802a8f]/60" />
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
                    <Lock className="absolute left-4 size-4 text-[#802a8f]/60" />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-sm bg-[#802a8f]/10 rounded-full outline-none focus:ring-2 focus:ring-[#802a8f]/30 transition placeholder:text-[#802a8f]/60 text-[#802a8f] font-medium"
                      placeholder={mode === "forgot" ? "New Password" : "Password"}
                    />
                  </div>
                  {(mode === "signup" || (mode === "forgot" && otpVerified)) && (
                    <div className="mt-2 text-[10px] text-muted-foreground px-4 grid grid-cols-2 gap-1 font-medium">
                      <div className="flex items-center gap-1.5">
                        {/[A-Z]/.test(password) ? <span className="text-green-500 font-bold text-xs">✓</span> : <span>○</span>} 1 Capital letter
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/[a-z]/.test(password) ? <span className="text-green-500 font-bold text-xs">✓</span> : <span>○</span>} 1 Small letter
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/\d/.test(password) ? <span className="text-green-500 font-bold text-xs">✓</span> : <span>○</span>} 1 Number
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/[@$!%*?&#]/.test(password) ? <span className="text-green-500 font-bold text-xs">✓</span> : <span>○</span>} 1 Special symbol
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === "forgot" && otpVerified && (
                <div className="relative flex items-center mt-4">
                  <Lock className="absolute left-4 size-4 text-[#802a8f]/60" />
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
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
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
    </>
  );
}

function ProfileDetails() {
  const { user, updateProfile } = useAuth();
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile) return;
    setBusy(true);
    const { error } = await updateProfile({ full_name: name, phone });
    setBusy(false);
    if (!error) toast.success("Profile updated!");
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 pb-4 border-b border-border">
        <h2 className="text-xl font-bold">Profile Information</h2>
      </div>
      <form onSubmit={save} className="max-w-md space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-input rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
          <input
            value={user?.email}
            disabled
            className="w-full px-4 py-2.5 text-sm border border-input rounded bg-muted/30 text-muted-foreground cursor-not-allowed outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-input rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
        <button disabled={busy} className="bg-primary text-primary-foreground font-semibold px-10 py-2.5 rounded shadow-sm hover:brightness-110 disabled:opacity-50 transition">
          {busy ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Addresses() {
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
    if (!error) toast.success("Address saved!");
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 pb-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Addresses</h2>
      </div>

      <form onSubmit={save} className="max-w-2xl border border-border p-6 rounded bg-muted/10 space-y-5">
        <h3 className="font-semibold text-sm text-primary uppercase tracking-wide mb-2">Edit Default Address</h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Street Address / Area</label>
          <textarea
            required
            value={addr}
            onChange={e => setAddr(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-input rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px]"
            placeholder="Flat No, Wing, Apartment name, Landmark..."
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">City / Town</label>
            <input
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-input rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</label>
            <input
              required
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-input rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pincode</label>
            <input
              required
              type="number"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-input rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="pt-2">
          <button disabled={busy} className="bg-primary text-primary-foreground font-semibold px-8 py-2.5 rounded shadow-sm hover:brightness-110 disabled:opacity-50 transition">
            {busy ? "Saving..." : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );
}

type MyOrder = {
  _id: string;
  order_number: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled" | "return requested" | "returned";
  total: number;
  createdAt: string;
  payment_method: string;
  isPaid?: boolean;
  refund_status?: string; // NEW FIELD
  items: { name: string; quantity: number; price: number; image?: string; product: string }[];
};

function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

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
      toast.success("Order cancelled. Refund (if prepaid) in 4–10 working days.");
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

  if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading orders...</div>;
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="size-16 rounded-full bg-muted mx-auto grid place-items-center mb-4"><Package className="size-8 text-muted-foreground/50" /></div>
        <h3 className="font-bold text-lg">No orders yet</h3>
        <p className="text-sm text-muted-foreground mb-6">Looks like you haven't started your joy journey yet.</p>
        <Link to="/products" className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-full shadow-card hover:brightness-110">Start Shopping</Link>
      </div>
    );
  }

  const statusBadge = (s: MyOrder["status"], refund_status?: string) => {
    const map: Record<string, string> = {
      placed: "bg-primary/20 text-primary border-primary/20",
      processing: "bg-warning/20 text-warning-foreground border-warning/20",
      shipped: "bg-secondary/20 text-secondary-foreground border-secondary/20",
      delivered: "bg-discount/20 text-discount border-discount/20",
      cancelled: "bg-destructive/20 text-destructive border-destructive/20",
      "return requested": "bg-purple-100 text-purple-700 border-purple-200",
      "returned": "bg-slate-200 text-slate-700 border-slate-300",
    };
    const key = s.toLowerCase() as keyof typeof map;
    return (
      <div className="flex flex-col items-end gap-1">
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border tracking-wider uppercase ${map[key] || "bg-muted text-muted-foreground"}`}>{s}</span>
        {refund_status && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">Refund: {refund_status}</span>
        )}
      </div>
    );
  };

  return (
    <div>
      {orders.map((o) => {
        const lstatus = o.status.toLowerCase();
        const isCancelled = lstatus === "cancelled";
        const isDelivered = lstatus === "delivered";
        
        // 4-day window condition
        const diffTime = Math.abs(new Date().getTime() - new Date(o.createdAt).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const withinFourDays = diffDays <= 4;
        const canRequestReturn = isDelivered && withinFourDays && lstatus !== "return requested" && lstatus !== "returned";

        return (
          <div key={o._id} className="border-b border-border last:border-0 hover:bg-muted/10 transition group">
            {o.items?.map((it, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 cursor-pointer border-t border-border first:border-0" onClick={() => navigate({ to: "/track", search: { orderId: o.order_number } as any })}>
                {/* Product Image */}
                <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-muted rounded overflow-hidden">
                  <img src={it.image || "https://placehold.co/100x100?text=No+Image"} alt={it.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition">{it.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1 space-x-3">
                      <span>Qty: {it.quantity}</span>
                      <span>₹{Number(it.price).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Status & Actions Mobile */}
                  <div className="mt-3 sm:hidden">
                    {statusBadge(o.status, o.refund_status)}
                  </div>
                </div>

                {/* Status & Actions Desktop */}
                <div className="hidden sm:flex flex-col items-end text-right w-64 shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">₹{(it.quantity * it.price).toLocaleString("en-IN")}</span>
                  </div>
                  {statusBadge(o.status, o.refund_status)}
                </div>
              </div>
            ))}

            {/* Order Action Bar */}
            <div className="px-4 sm:px-6 py-3 bg-muted/20 flex flex-wrap items-center justify-between gap-4 text-sm border-t border-border">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="font-medium">Order #{o.order_number}</span>
                <span className="hidden sm:inline">Ordered on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                {!o.isPaid && lstatus !== "cancelled" && lstatus !== "returned" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); payOnline(o); }}
                    disabled={payingId === o._id}
                    className="px-3 py-1 bg-primary text-white rounded font-semibold hover:brightness-110 disabled:opacity-50 text-xs"
                  >
                    {payingId === o._id ? "Connecting PayU..." : "Pay Online"}
                  </button>
                )}

                {canRequestReturn && (
                  <button
                    onClick={(e) => { e.stopPropagation(); requestReturn(o._id); }}
                    disabled={cancellingId === o._id}
                    className="px-3 py-1 border border-purple-500 text-purple-600 hover:bg-purple-50 rounded font-medium transition text-xs"
                  >
                     Request Return
                  </button>
                )}
                {isDelivered && !withinFourDays && lstatus !== "returned" && lstatus !== "return requested" && (
                  <span className="text-[10px] text-muted-foreground italic px-2 border border-dashed border-muted rounded">Return window closed</span>
                )}

                {!isDelivered && !isCancelled && lstatus !== "return requested" && lstatus !== "returned" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); cancel(o._id); }}
                    disabled={cancellingId === o._id}
                    className="px-3 py-1 border border-destructive text-destructive hover:bg-destructive/5 rounded font-medium transition text-xs"
                  >
                    {cancellingId === o._id ? "Processing..." : "Cancel"}
                  </button>
                )}
                
                <Link
                  to="/track"
                  search={{ orderId: o.order_number } as any}
                  className="font-semibold text-primary hover:underline"
                >
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
