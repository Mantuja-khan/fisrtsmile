import { useState } from "react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import api from "@/services/api";

interface ShiprocketLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
  buttonText?: string;
}

export default function ShiprocketLoginButton({
  onSuccess,
  className = "",
  buttonText = "Instant OTP Login",
}: ShiprocketLoginButtonProps) {
  const { signInWithShiprocket } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // 1. Fetch secure access token from Express backend
      const { data } = await api.post("/shiprocket/login-token");
      const token =
        data.token ||
        data.access_token ||
        data.data?.token ||
        data.result?.token;
      if (!token) {
        throw new Error("Shiprocket access token not found in server response.");
      }

      // 2. Access the global ShiprocketLogin library loaded via index.html
      const headless = (window as any).ShiprocketLogin || (window as any).HeadlessCheckout;

      console.log("TOKEN:", token);
      console.log("HEADLESS:", headless);

      if (headless) {
        console.log("HEADLESS METHODS:", Object.keys(headless));
      }

      if (!headless || typeof headless.login !== 'function') {
        throw new Error("Shiprocket Fastrr login script failed to load or is missing the login method. Please refresh the page.");
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
            response?.result?.authorised_customer_token ||
            response?.result?.authorized_customer_token ||
            response?.authorised_customer_token ||
            response?.authorized_customer_token ||
            response?.token;

          const phone =
            response?.data?.phone ||
            response?.phone ||
            response?.customer?.phone;
          const addressData =
            response?.data?.addresses?.[0] ||
            response?.data ||
            response?.address ||
            {};

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
      console.log("Launching OTP popup...");

      // Ensure the fastrr-checkout container exists (login.js reads .style on it)
      let fastrrContainer = document.getElementById("fastrr-checkout");
      if (!fastrrContainer) {
        fastrrContainer = document.createElement("div");
        fastrrContainer.id = "fastrr-checkout";
        fastrrContainer.style.cssText =
          "display:none;position:fixed;z-index:99999;top:0;left:0;width:100%;height:100%;";
        document.body.appendChild(fastrrContainer);
      }

      try {
        headless.login(
          e.nativeEvent,
          token,
          {
            themecolor: "ff6600",
            image: "https://trivoxotoys.com/logo.png",
          },
          fastrrCallback,
        );
      } catch (widgetErr: any) {
        // Shiprocket's widget can throw "Cannot read properties of null (reading 'style')"
        // when the user closes the modal — this is a known bug in their login.js.
        // We swallow it here so the user doesn't see an error.
        if (
          widgetErr instanceof TypeError &&
          widgetErr.message?.includes("style")
        ) {
          console.warn("Shiprocket widget style error (safe to ignore):", widgetErr.message);
        } else {
          throw widgetErr; // re-throw unexpected errors
        }
      }
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
      className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6600] hover:bg-[#e65c00] disabled:bg-slate-400 text-white font-semibold text-sm rounded-full shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] cursor-pointer ${className}`}
    >
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
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Zap className="size-4 fill-current text-amber-200" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
