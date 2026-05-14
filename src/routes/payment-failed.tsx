import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/payment-failed")({
  component: PaymentFailed,
});

function PaymentFailed() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-border p-8 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="size-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
          <XCircle className="size-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled / Failed</h1>
        <p className="text-slate-500 mb-6">
          Oops! The payment session timed out or was declined. Please verify your card or bank funds and try again.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/account" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
            Retry from My Orders
          </Link>
          <Link to="/contact" className="text-sm text-slate-500 font-medium hover:underline">
            Need Support? Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
