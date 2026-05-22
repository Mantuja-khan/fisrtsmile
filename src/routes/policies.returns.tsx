import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw, Video, CheckCircle2, AlertTriangle, Clock, Mail } from "lucide-react";

export const Route = createFileRoute("/policies/returns")({
  head: () => ({ meta: [{ title: "Refund & Cancellation Policy — Toy Haat" }] }),
  component: () => (
    <div className="space-y-6 selection:bg-rose-100">
      <div className="flex items-center gap-2.5 border-b pb-4 border-border/50">
        <div className="size-9 grid place-items-center bg-rose-50 text-rose-600 rounded-lg shrink-0">
          <RefreshCcw className="size-5" />
        </div>
        <h1 className="text-2xl    text-foreground m-0">Refund & Cancellation Policy</h1>
      </div>

      <p className="text-base leading-relaxed text-foreground/80 font-medium">
        We want you to have a smooth experience while shopping with <strong>Toy Haat</strong>.{" "}
        <br />
        Please read the policy carefully before placing your order.
      </p>

      {/* Return/Exchange Eligibility */}
      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-600" />
          Return / Exchange Eligibility
        </h2>
        <p className="text-sm text-muted-foreground font-semibold">
          We accept exchange requests only in the following cases:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
          <li>Product is damaged or defective</li>
          <li>Wrong product has been delivered</li>
        </ul>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs    text-amber-800 mt-2">
          ⚠️ The request must be raised within 48 hours of delivery.
        </div>
      </div>

      {/* Unboxing Video Requirement */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2 mt-4">
        <h2 className="text-sm font-black text-rose-700 uppercase tracking-wider flex items-center gap-2 m-0">
          <Video className="size-4 shrink-0" />
          Unboxing Video Requirement
        </h2>
        <p className="text-xs    text-rose-800 m-0">
          An unboxing video is <strong>mandatory</strong> for all return or exchange requests.
        </p>
        <ul className="space-y-1 text-xs text-rose-800 list-disc pl-5 font-medium">
          <li>The video must start from the sealed package</li>
          <li>The issue should be clearly visible</li>
        </ul>
        <p className="text-[11px] font-black text-rose-600 italic uppercase tracking-wide mt-1">
          Requests without a proper video will not be accepted.
        </p>
      </div>

      {/* Exchange Policy */}
      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">
          Exchange Policy
        </h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Exchange is allowed only for the same product.</li>
          <li>If the product is not available, store credit will be issued.</li>
          <li>Only one exchange is allowed per order.</li>
        </ul>
      </div>

      {/* Not Eligible for Return / Exchange */}
      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0 flex items-center gap-2">
          <AlertTriangle className="size-4 text-rose-500" />
          Not Eligible for Return / Exchange
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs    text-muted-foreground">
          <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border/30">
            • Used products
          </div>
          <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border/30">
            • Products without original tags/packaging
          </div>
          <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border/30">
            • Customized products
          </div>
          <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border/30">
            • Sale or discounted items
          </div>
          <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border/30 sm:col-span-2">
            • Requests based on personal preference (color, design, etc.)
          </div>
        </div>
      </div>

      {/* Return Process */}
      <div className="space-y-3 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">
          Return Process
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
          <li>
            <span className="   text-foreground/80">Email your request</span> along with your Order
            ID.
          </li>
          <li>
            <span className="   text-foreground/80">Share the unboxing video</span> and clear issue
            details.
          </li>
          <li>
            After approval, <span className="   text-foreground/80">return instructions</span> will
            be shared.
          </li>
        </ol>
        <div className="text-xs font-medium text-muted-foreground italic pl-5 mt-2 space-y-1">
          <p>• Reverse pickup depends on courier service availability.</p>
          <p>• Return shipping charges may be borne by the customer.</p>
        </div>
      </div>

      {/* Refund Policy & Details */}
      <div className="space-y-3 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Refund Policy</h2>
        <p className="text-sm text-muted-foreground m-0">Refunds are only applicable if:</p>
        <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5 font-medium">
          <li>The product is not available for exchange, or</li>
          <li>The order cannot be fulfilled.</li>
        </ul>

        <div className="bg-[#f0f9ff] border border-[#bae6fd] text-[#0369a1] p-4 rounded-xl flex flex-col gap-1 mt-3">
          <h3 className="text-xs    uppercase tracking-widest m-0 flex items-center gap-1.5">
            <Clock className="size-3.5" /> Refund Details
          </h3>
          <ul className="space-y-1 text-xs font-medium text-[#0c4a6e] list-disc pl-4 mt-1">
            <li>
              Processed within <strong>4–10 working days</strong>.
            </li>
            <li>
              Credited directly back to the <strong>original payment method</strong>.
            </li>
          </ul>
        </div>
      </div>

      {/* How to Request */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2 mt-6 border-l-4 border-rose-500">
        <h2 className="text-xs font-black tracking-widest uppercase text-rose-400 flex items-center gap-2 m-0">
          <Mail className="size-4" /> How to Request
        </h2>
        <div className="space-y-1 text-sm">
          <p>
            <span className="   opacity-70 text-xs">Email:</span>{" "}
            <a
              href="mailto:support@toyhaat.com"
              className="font-extrabold hover:underline text-rose-200"
            >
              support@toyhaat.com
            </a>
          </p>
          <p>
            <span className="   opacity-70 text-xs">Subject Line:</span>{" "}
            <code className="bg-white/10 px-2 py-0.5 rounded text-white font-mono text-xs">
              Return/Exchange Request – [Order ID]
            </code>
          </p>
        </div>
      </div>
    </div>
  ),
});
