import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import logoImg from "@/assets/firstsmile_logo.png";
import offersGetImg from "@/assets/offerget.png";

export function DiscountPopup() {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [discountPhone, setDiscountPhone] = useState("");
  const [discountClaimed, setDiscountClaimed] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState("");

  useEffect(() => {
    const shouldShow = localStorage.getItem("show_signup_discount_popup") === "true";
    if (shouldShow) {
      setShowPopup(true);
      localStorage.removeItem("show_signup_discount_popup");
    }
  }, []);

  const handleClaimDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountPhone) return;

    if (user && user.phone && discountPhone !== user.phone) {
      toast.error("Please enter the mobile number you registered with.");
      return;
    }

    const code = "FS5OFF-" + Math.floor(1000 + Math.random() * 9000);
    const existing = JSON.parse(localStorage.getItem("firstsmile_coupons") || "[]");
    existing.push({ code, discount: 5, active: true, phone: discountPhone });
    localStorage.setItem("firstsmile_coupons", JSON.stringify(existing));

    // Disallow future popups completely for guest
    localStorage.setItem("firstsmile_discount_guest", "true");

    setGeneratedCoupon(code);
    setDiscountClaimed(true);
    toast.success(`Coupon code ${code} generated!`);
    setTimeout(() => {
      setShowPopup(false);
    }, 6000);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 md:bg-surface w-full max-w-3xl rounded-3xl shadow-pop relative overflow-hidden flex flex-col md:flex-row border border-border h-auto md:h-[400px]">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 z-20 bg-primary/20 rounded-full p-1 text-primary hover:bg-primary/30 transition"
        >
          <XCircle className="size-6" />
        </button>

        {/* Mobile Background */}
        <div
          className="md:hidden absolute inset-0 bg-cover bg-top opacity-40 blur-sm pointer-events-none z-0"
          style={{ backgroundImage: `url(${offersGetImg})` }}
        ></div>

        {/* Left side image */}
        <div className="hidden md:block md:w-1/2 h-full bg-muted">
          <img src={offersGetImg} alt="Offers" className="w-full h-full object-cover object-top" />
        </div>

        {/* Right side content */}
        <div className="w-full md:w-1/2 p-6 md:p-8 text-center flex flex-col justify-center items-center relative z-10 bg-white/40 md:bg-white backdrop-blur-sm md:backdrop-blur-none">
          <img src={logoImg} alt="First Smile" className="h-12 mb-4 object-contain" />
          <h2 className="font-display text-4xl mb-2 text-gray-800 tracking-wide uppercase">Wait!</h2>
          <p className="text-xl text-gray-700 mb-2">Unlock your <span className="font-bold">5%</span> before you go.</p>
          <p className="text-sm italic text-gray-600 mb-6 font-serif">
            Your little one's next favourite toy is just a step away.
          </p>

          {!discountClaimed ? (
            <form onSubmit={handleClaimDiscount} className="space-y-4 w-full">
              <input
                type="tel"
                value={discountPhone}
                onChange={(e) => setDiscountPhone(e.target.value)}
                placeholder="Enter your mobile number"
                required
                className="w-full px-4 py-3.5 rounded-xl border-none bg-[#d4eedb] text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#009b4d] text-gray-700 placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="w-full bg-[#009b4d] text-white font-bold py-3.5 rounded-full shadow-sm hover:brightness-110 transition text-lg"
              >
                Unlock the Offer
              </button>
            </form>
          ) : (
            <div className="animate-fade-in py-4 w-full">
              <p className="text-lg font-bold text-primary mb-2">Offer Unlocked! 🎉</p>
              <div className="bg-[#d4eedb] border border-[#009b4d] rounded-xl p-4 my-4">
                <p className="text-xs text-[#009b4d] uppercase font-bold mb-1">Your Coupon Code</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-[#009b4d]">{generatedCoupon}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You can find this code in your{" "}
                <Link
                  to="/coupons"
                  className="text-primary hover:underline font-bold"
                  onClick={() => setShowPopup(false)}
                >
                  Coupons
                </Link>{" "}
                section.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
