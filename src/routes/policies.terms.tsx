import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — First Smile" }] }),
  component: () => (
    <>
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>Users must be <strong>18 years or older</strong> to place orders.</li>
        <li>All disputes are subject to <strong>Indian jurisdiction</strong>.</li>
        <li>Product images are illustrative; actual product may vary slightly.</li>
        <li>Prices and offers may change without prior notice.</li>
        <li>Use of this site implies acceptance of our Privacy Policy and Cookies usage.</li>
        <li>Misuse of coupons or fraudulent activity will result in account termination.</li>
      </ul>
      <p className="text-xs text-muted-foreground mt-6">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
    </>
  ),
});
