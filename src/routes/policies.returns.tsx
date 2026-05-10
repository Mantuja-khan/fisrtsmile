import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/returns")({
  head: () => ({ meta: [{ title: "Return & Exchange Policy — ToyKart" }] }),
  component: () => (
    <>
      <h1 className="text-2xl font-bold mb-4">Return, Exchange & Cancellation Policy</h1>
      <p className="text-muted-foreground mb-4">Please read our policy carefully before placing an order.</p>

      <h2 className="font-bold text-lg mt-5 mb-2">Order Cancellation</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>You can cancel your order from <strong>My Account → Orders</strong> as long as it has not been dispatched.</li>
        <li>Cancellation is allowed <strong>only before dispatch</strong> (status: Placed or Processing).</li>
        <li>Alternatively, email <strong>firstsmile19@gmail.com</strong> with your <strong>Order ID</strong>, <strong>full name</strong>, and <strong>registered phone number</strong>.</li>
        <li>Cancellation requests are <strong>not applicable after the order has been shipped</strong>.</li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Exchange</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Exchange is allowed for the <strong>same product only</strong>.</li>
        <li>Only <strong>one exchange per order</strong> is permitted.</li>
        <li>No exchange on customized items or items purchased on sale.</li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Eligibility Criteria</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Product must be <strong>unused</strong>.</li>
        <li><strong>Original packaging, tags, and labels</strong> must be intact.</li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Process Timeline</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Report any issue within <strong>48 hours of delivery</strong>.</li>
        <li>Share <strong>product video + repacking proof</strong> with our support email.</li>
        <li>Dispatch within <strong>5–7 days after approval</strong>.</li>
        <li>📦 Reverse pickup depends on service availability.</li>
        <li>🚚 Shipping costs for exchange are <strong>customer-borne</strong>.</li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Damaged / Defective Items</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Report within <strong>48 hours</strong> of delivery.</li>
        <li>An <strong>unboxing video</strong> is mandatory for damaged items.</li>
        <li>Email firstsmile19@gmail.com with order ID and proof.</li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Refunds</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Applicable <strong>only if the order cannot be fulfilled</strong>.</li>
        <li>Processed within <strong>4–10 working days</strong>.</li>
        <li>Refunded via the <strong>original payment method</strong>.</li>
      </ul>
    </>
  ),
});
