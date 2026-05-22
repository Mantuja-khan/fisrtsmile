import { useState } from "react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { Zap, ShieldCheck } from "lucide-react";
import api from "@/services/api";

interface ShiprocketLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
  buttonText?: string;
}

export default function ShiprocketLoginButton({
  onSuccess,
  className = "",
  buttonText = "Fast Login via OTP",
}: ShiprocketLoginButtonProps) {
  const { signInWithShiprocket } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // 1. Fetch secure access token from Express backend
      const { data } = await api.post("/auth/shiprocket-token");

      const token = data.token || data.access_token || data.data?.token;
      if (!token) {
        throw new Error("Shiprocket access token not found in server response.");
      }

      // 2. Access the global HeadlessCheckout library loaded via index.html
      const headless = (window as any).HeadlessCheckout;
      if (!headless) {
        throw new Error("Shiprocket Fastrr login script failed to load. Please refresh the page.");
      }

      // 3. Define callback to handle successful OTP verification
      const fastrrCallback = async (response: any) => {
        console.log("🚀 Shiprocket Fastrr Callback triggered with response:", response);

        try {
          if (!response) {
            toast.error("No response received from Shiprocket.");
            setLoading(false);
            return;
          }

          // Extract token, phone and address info supporting multiple response patterns
          const customerToken =
            response.authorized_customer_token ||
            response.authorised_customer_token ||
            response.token;
          const phone =
            response.phone || response.customer?.phone || response.mobile_number || response.mobile;
          const addressData =
            response.address_data || response.customer || response.address || response;

          if (!customerToken) {
            // Callback fired but without token (e.g. user closed it or aborted)
            toast.error("Authentication was not completed.");
            setLoading(false);
            return;
          }

          if (!phone) {
            toast.error("Verified mobile number was not returned from Shiprocket.");
            setLoading(false);
            return;
          }

          // 4. Synchronize with our Node.js app backend to log in / register
          const loginResult = await signInWithShiprocket(phone, customerToken, addressData);

          if (loginResult.error) {
            toast.error(loginResult.error);
          } else {
            toast.success("Welcome back! Successfully logged in via OTP.");
            if (onSuccess) {
              onSuccess();
            }
          }
        } catch (error: any) {
          console.error("Fastrr Callback handling failed:", error);
          toast.error("Fastrr Login synchronization failed: " + (error.message || "Unknown error"));
        } finally {
          setLoading(false);
        }
      };

      // 4. Trigger the checkout OTP popup
      headless.buyNow(
        e.nativeEvent,
        token,
        {
          themecolor: "ff6600",
          image: "https://toyhaat.com/logo.png",
        },
        fastrrCallback,
      );
    } catch (err: any) {
      console.error("Shiprocket token or popup error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to initialize OTP login.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={`relative group overflow-hidden flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#ff6600] to-[#ff8000] hover:from-[#e65c00] hover:to-[#ff6600] disabled:from-slate-400 disabled:to-slate-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] cursor-pointer ${className}`}
    >
      {/* Light sweep animation on hover */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></span>

      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Securing connection...</span>
        </>
      ) : (
        <>
          <Zap className="size-4 animate-pulse fill-current text-amber-200" />
          <span>{buttonText}</span>
          <ShieldCheck className="size-4 opacity-75 ml-auto" />
        </>
      )}
    </button>
  );
}
