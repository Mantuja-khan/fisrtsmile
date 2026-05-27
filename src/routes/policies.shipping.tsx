import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/policies/shipping")({
  head: () => ({ meta: [{ title: "Shipping Policy — Trivoxo Toys" }] }),
  component: () => (
    <div className="space-y-6 selection:bg-primary/10">
      <div className="flex items-center gap-2.5 border-b pb-4 border-border/50">
        <div className="size-9 grid place-items-center bg-primary/10 text-primary rounded-lg shrink-0">
          <Truck className="size-5" />
        </div>
        <h1 className="text-2xl    text-foreground m-0">Shipping Policy</h1>
      </div>

      <p className="text-base leading-relaxed text-foreground/80 m-0 font-medium">
        We aim to deliver your order quickly and safely.
      </p>

      <div className="space-y-2">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">
          Order Processing
        </h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Orders are usually processed within 24 working hours.</li>
          <li>Orders placed on weekends or holidays will be processed on the next working day.</li>
          <li>In rare cases, there may be slight delays due to high demand or other factors.</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Delivery Time</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>
            Metro cities: <strong>2–4 business days</strong>
          </li>
          <li>
            Other locations: <strong>3–7 business days</strong>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground/80 mt-1 italic font-medium">
          Delivery timelines may vary depending on your location and courier service.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">
          Shipping Charges
        </h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Free shipping on prepaid orders</li>
          <li>Cash on Delivery (COD) available with an additional charge of ₹60</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">
          Order Tracking
        </h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Tracking details will be shared via SMS or email after dispatch.</li>
          <li>You can use the tracking link to check your order status anytime.</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">
          Shipping Coverage
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          We deliver across India.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Delays</h2>
        <p className="text-sm text-muted-foreground m-0 font-medium">
          While we try to deliver on time, delays can happen due to:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Courier issues</li>
          <li>Weather conditions</li>
          <li>High order volume</li>
          <li>Remote location delivery</li>
        </ul>
        <p className="text-xs text-muted-foreground    bg-muted/40 p-2.5 rounded-md border border-border/30 inline-block mt-1.5">
          We request your patience in such situations.
        </p>
      </div>

      <div className="bg-amber-50/60 border border-amber-100 text-amber-900 p-4 rounded-xl flex flex-col gap-1">
        <h3 className="text-xs    uppercase tracking-wider text-amber-800 m-0">Important Note</h3>
        <p className="text-sm text-amber-900/80 font-medium m-0 leading-relaxed">
          Please make sure your address and contact details are correct while placing the order to
          avoid delivery issues.
        </p>
      </div>

      <div className="bg-muted/50 p-5 rounded-2xl border border-border/50 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base    text-foreground m-0 mb-1.5">Contact Us</h2>
          <p className="text-xs text-muted-foreground m-0 leading-relaxed">
            For any shipping-related queries, please reach out to us:
          </p>
        </div>
        <div className="space-y-1 text-xs text-foreground/90    shrink-0 sm:text-right">
          <p className="flex sm:justify-end items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Email:</span>
            <a href="mailto:support@trivoxotoys.com" className="text-primary hover:underline">
              support@trivoxotoys.com
            </a>
          </p>
          <p className="flex sm:justify-end items-center gap-1.5">
            <span className="text-muted-foreground font-medium">WhatsApp:</span>
            <a href="https://wa.me/917827743263" className="text-primary hover:underline">
              +91 7827743263
            </a>
          </p>
        </div>
      </div>
    </div>
  ),
});
