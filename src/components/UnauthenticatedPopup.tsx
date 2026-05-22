import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { X, Sparkles, LogIn, Percent } from "lucide-react";
import { useAuth } from "@/store/auth";
import offersGetImg from "@/assets/offerget.png";
import logoImg from "@/assets/firstsmile_logo.png";

export function UnauthenticatedPopup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Show only if the user is not logged in
    if (!user) {
      const hasSeen = sessionStorage.getItem("unauth_popup_seen");
      if (!hasSeen) {
        // Render with a small delay so page elements finish mounting first
        const timer = setTimeout(() => {
          setOpen(true);
          sessionStorage.setItem("unauth_popup_seen", "true");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading]);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
  };

  const handleJoin = () => {
    setOpen(false);
    navigate({ to: "/account" });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      {/* Main card */}
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-pop overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300 z-10">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 bg-slate-900/10 hover:bg-slate-900/20 rounded-full text-slate-800 transition-colors z-20 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Promo Image */}
        <div className="relative w-full h-[220px] bg-slate-50 flex items-center justify-center overflow-hidden">
          <img
            src={offersGetImg}
            alt="Exclusive Welcome Offers"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="bg-amber-400 text-slate-900 px-3 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1 mb-1.5 shadow-sm">
              <Percent className="size-3" /> Welcome Bonus
            </span>
            <h3 className="text-xl font-display font-black tracking-wide uppercase text-white drop-shadow-md">
              Unlock First Smile Deals!
            </h3>
          </div>
        </div>

        {/* Info & Call to Action */}
        <div className="p-6 md:p-8 text-center flex flex-col items-center bg-white">
          <img src={logoImg} alt="First Smile Logo" className="h-10 mb-3 object-contain" />

          <p className="text-slate-800 text-sm font-semibold tracking-wide leading-relaxed mb-1">
            Hey there! Join the Toy Haat family today.
          </p>
          <p className="text-xs text-slate-400 font-medium max-w-sm mb-6 leading-relaxed">
            Register or sign in to save your shopping cart, secure exclusive discount coupons, track
            orders easily, and enjoy safe checkout!
          </p>

          <div className="w-full flex flex-col gap-3">

            <div className="w-full flex gap-2.5">
              <button
                onClick={handleJoin}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl shadow-md transition active:scale-[0.98] cursor-pointer"
              >
                <LogIn className="size-3.5" /> Email Sign In
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 font-bold text-[10px] uppercase tracking-widest rounded-xl transition cursor-pointer"
              >
                Guest Shop
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest">
            <Sparkles className="size-3.5 fill-current animate-pulse" />
            <span>Takes less than 30 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
