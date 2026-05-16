import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/policies/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — First Smile Toys" }] }),
  component: () => (
    <div className="space-y-6 selection:bg-primary/10">
      <div className="flex items-center gap-2.5 border-b pb-4 border-border/50">
        <div className="size-9 grid place-items-center bg-primary/10 text-primary rounded-lg shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <h1 className="text-2xl    text-foreground m-0">Terms of Service</h1>
      </div>

      <p className="text-base leading-relaxed text-foreground/80 m-0 font-medium">
        By accessing and using the First Smile website, you agree to the terms mentioned below. Please read them carefully before placing an order.
      </p>

      <div className="space-y-2">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">General Conditions</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>You must provide accurate and complete information while placing an order.</li>
          <li>We reserve the right to refuse or cancel any order if misuse or suspicious activity is detected.</li>
          <li>Prices and product availability may change without prior notice.</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Products & Information</h2>
        <p className="text-sm text-muted-foreground m-0 leading-relaxed font-medium">
          We try to display all products as accurately as possible. However:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Slight variations in color or design may occur due to lighting or screen differences.</li>
          <li>Product descriptions are for general guidance.</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Order Acceptance</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Your order is confirmed only after successful payment or verification (in case of Cash on Delivery).</li>
          <li>We reserve the right to cancel orders due to stock issues, pricing errors, or other reasons.</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Payments</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          We accept secure online payments. Cash on Delivery (COD) may be available on selected orders. Any misuse of COD may lead to restrictions on future orders.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Shipping & Delivery</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Orders are processed and shipped as per our Shipping Policy.</li>
          <li>Delivery timelines may vary based on location and external factors.</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Returns & Exchanges</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          All returns and exchanges are handled as per our Return & Refund Policy. Customers are advised to read the policy before placing an order.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Intellectual Property</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          All content on this website, including text, images, and design, belongs to First Smile. It must not be copied, reused, or distributed without permission.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Limitation of Liability</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          First Smile will not be responsible for any indirect or incidental damages arising from the use of our products or services.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Governing Law</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          All disputes are subject to the laws of India.
        </p>
      </div>

      <div className="bg-muted/50 p-5 rounded-2xl border border-border/50 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base    text-foreground m-0 mb-1.5">Contact Information</h2>
          <p className="text-xs text-muted-foreground m-0 leading-relaxed">For any questions regarding these terms, please reach out to us:</p>
        </div>
        <div className="space-y-1 text-xs text-foreground/90    shrink-0 sm:text-right">
          <p className="flex sm:justify-end items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Email:</span>
            <a href="mailto:support@firstsmiletoys.com" className="text-primary hover:underline">support@firstsmiletoys.com</a>
          </p>
          <p>
            <span className="text-muted-foreground font-medium">Address:</span> Genesis Mall, Bhiwadi – 301019, RJ
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-8 border-t border-border/30 pt-4 text-center italic">
        Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  ),
});
