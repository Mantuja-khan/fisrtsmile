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
      <div className="relative bg-transparent w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 z-10 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-20 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Promo Image Only */}
        <div className="relative w-full cursor-pointer" onClick={handleJoin}>
          <img
            src={offersGetImg}
            alt="Exclusive Welcome Offers"
            className="w-full h-auto object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}
