import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/policies/legal")({
  head: () => ({ meta: [{ title: "Legal Notice — First Smile Toys" }] }),
  component: () => (
    <div className="space-y-6 selection:bg-primary/10">
      <div className="flex items-center gap-2.5 border-b pb-4 border-border/50">
        <div className="size-9 grid place-items-center bg-primary/10 text-primary rounded-lg shrink-0">
          <FileText className="size-5" />
        </div>
        <h1 className="text-2xl    text-foreground m-0">Legal Notice</h1>
      </div>

      <p className="text-base leading-relaxed text-foreground/80 m-0 font-medium">
        This website is owned and operated by <strong>First Smile Toys</strong>. <br />
        By accessing this website, you agree to the terms, policies, and notices stated here.
      </p>

      <div className="space-y-3 bg-muted/30 border border-border/30 p-4 rounded-xl">
        <h2 className="text-sm    text-foreground uppercase tracking-wider m-0">Business Details</h2>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="   text-foreground/80">Business Name:</span>
            <span>First Smile Toys</span>
          </p>
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="   text-foreground/80">Address:</span>
            <span>Genesis Mall, Bhiwadi – 301019, Rajasthan, India</span>
          </p>
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="   text-foreground/80">Email:</span>
            <a href="mailto:support@firstsmiletoys.com" className="text-primary hover:underline font-semibold">support@firstsmiletoys.com</a>
          </p>
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="   text-foreground/80">WhatsApp:</span>
            <a href="https://wa.me/917827743263" className="text-primary hover:underline font-semibold">+91 7827743263</a>
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Use of Website</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>All users must provide accurate and complete information while using this website.</li>
          <li>Any misuse, fraudulent activity, or violation of terms may lead to account restriction or cancellation of orders.</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Product Information</h2>
        <p className="text-sm text-muted-foreground m-0 font-medium">
          We try to ensure all product details, images, and prices are accurate. However:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Minor differences in color or design may occur</li>
          <li>Errors may happen, and we reserve the right to correct them without prior notice</li>
        </ul>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Intellectual Property</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          All content on this website, including text, images, logos, and design, is the property of <strong>First Smile</strong>.
          It must not be copied, reproduced, or used without written permission.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Third-Party Services</h2>
        <p className="text-sm text-muted-foreground m-0 font-medium">
          We may use third-party services for:
        </p>
        <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
          <li>Payment processing</li>
          <li>Shipping and delivery</li>
        </ul>
        <p className="text-xs text-muted-foreground/80 italic">These services operate under their own terms and policies.</p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Limitation of Liability</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          First Smile is not responsible for any indirect or incidental damages arising from the use of this website or products.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Governing Law</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          All legal matters and disputes are subject to the laws of <strong>India</strong>.
        </p>
      </div>

      <div className="space-y-2 border-t border-border/30 pt-5">
        <h2 className="text-base    text-foreground uppercase tracking-wider m-0">Updates to This Notice</h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          We may update this Legal Notice from time to time. Changes will be posted on this page.
        </p>
      </div>

      <div className="bg-[#f0f9ff] border border-[#bae6fd] text-[#0369a1] p-5 rounded-2xl flex flex-col gap-2 mt-8">
        <h3 className="text-xs    uppercase tracking-widest m-0">Contact Us</h3>
        <p className="text-sm font-medium m-0 leading-relaxed text-[#0c4a6e]">
          For any legal or general queries, please reach out to us directly at:
        </p>
        <div className="space-y-1 text-xs mt-1">
          <p><span className="   opacity-80">Email:</span> <a href="mailto:support@firstsmiletoys.com" className="underline hover:text-black">support@firstsmiletoys.com</a></p>
          <p><span className="   opacity-80">Address:</span> Genesis Mall, Bhiwadi – 301019, Rajasthan, India</p>
        </div>
      </div>
    </div>
  ),
});
