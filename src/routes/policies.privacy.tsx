import { createFileRoute } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

export const Route = createFileRoute("/policies/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — First Smile Toys" }] }),
  component: () => (
    <div className="space-y-6 selection:bg-primary/10">
      <div className="flex items-center gap-2.5 border-b pb-4 border-border/50">
        <div className="size-9 grid place-items-center bg-primary/10 text-primary rounded-lg shrink-0">
          <LockKeyhole className="size-5" />
        </div>
        <h1 className="text-2xl    text-foreground m-0">Privacy Policy</h1>
      </div>

      <p className="text-xs text-muted-foreground    m-0 tracking-wide uppercase bg-muted/40 px-2 py-1 rounded w-fit border border-border/30">
        Last updated: April 30, 2026
      </p>

      <p className="text-base leading-relaxed text-foreground/80 m-0 font-medium">
        At First Smile, we value your trust and are committed to protecting your personal information.
      </p>

      <div className="space-y-2">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Information We Collect</h2>
        <p className="text-sm text-muted-foreground m-0 font-medium">
          When you place an order or contact us, we may collect:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Name</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Shipping and billing address</li>
        </ul>
        <p className="text-xs text-muted-foreground/80 mt-1 italic font-medium">
          This information is used only to process your order and provide support.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">How We Use Your Information</h2>
        <p className="text-sm text-muted-foreground m-0 font-medium">
          We use your details to:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Process and deliver your orders</li>
          <li>Send order updates and tracking details</li>
          <li>Respond to your queries</li>
          <li>Improve our services</li>
        </ul>
        <p className="text-sm font-semibold text-rose-600/90 mt-2.5 bg-rose-50 border border-rose-100 p-3 rounded-xl">
          We do not sell or share your personal information with third parties for marketing purposes.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Cookies</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          Our website may use cookies to improve your browsing experience. You can choose to disable cookies through your browser settings.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Data Security</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          We take reasonable steps to keep your information safe. However, no online system is completely secure, so we cannot guarantee absolute security.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Third-Party Services</h2>
        <p className="text-sm text-muted-foreground m-0 font-medium">
          We may use trusted third-party services for:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Payments</li>
          <li>Shipping and delivery</li>
        </ul>
        <p className="text-xs text-muted-foreground/85 mt-1 leading-relaxed">
          These services only access the information required to perform their tasks and are expected to keep it confidential.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Children’s Privacy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          Our website is intended for users above 18 years of age. We do not knowingly collect personal data from children.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Policy Updates</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          We may update this policy from time to time. Changes will be posted on this page.
        </p>
      </div>

      <div className="bg-muted/50 p-5 rounded-2xl border border-border/50 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base  text-foreground m-0 mb-1.5">Contact Us</h2>
          <p className="text-xs text-muted-foreground m-0 leading-relaxed">If you have any questions about this Privacy Policy, please reach out to us:</p>
        </div>
        <div className="space-y-1 text-xs text-foreground/90    shrink-0 sm:text-right">
          <p className="flex sm:justify-end items-center gap-1.5">
            <span className="text-muted-foreground    ">Email:</span>
            <a href="mailto:support@firstsmiletoys.com" className="text-primary hover:underline">support@firstsmiletoys.com</a>
          </p>
          <p>
            <span className="text-muted-foreground    ">Address:</span> Genesis Mall, Bhiwadi – 301019, RJ
          </p>
        </div>
      </div>
    </div>
  ),
});
