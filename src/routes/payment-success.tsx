import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/payment-success")({
  component: PaymentSuccess,
});

function PaymentSuccess() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-border p-8 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <CheckCircle className="size-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-slate-500 mb-6">
          Hurray! Your order payment has been verified. We've already connected with Shiprocket to schedule your dispatch.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/account" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
            View My Orders
          </Link>
          <Link to="/" className="text-sm text-slate-500 font-medium hover:underline">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
