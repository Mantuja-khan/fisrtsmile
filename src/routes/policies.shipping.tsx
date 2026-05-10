import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/shipping")({
  head: () => ({ meta: [{ title: "Shipping & Delivery — ToyKart" }] }),
  component: () => (
    <>
      <h1 className="text-2xl font-bold mb-4">Shipping & Delivery</h1>
      <h2 className="font-bold text-lg mt-5 mb-2">Order Processing</h2>
      <p className="text-sm">All orders are processed within <strong>24 hours</strong> of payment confirmation.</p>

      <h2 className="font-bold text-lg mt-5 mb-2">Delivery Timelines</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Metro cities: <strong>2–4 working days</strong></li>
        <li>Other cities: <strong>3–7 working days</strong></li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Shipping Charges</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Free shipping</strong> on prepaid orders (UPI / Card).</li>
        <li>COD orders: ₹60 additional charge applies.</li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Tracking</h2>
      <p className="text-sm">Once shipped, you will receive tracking details via SMS and email. You can also use our <a href="/track" className="text-primary font-semibold">Track Order</a> page.</p>
    </>
  ),
});
