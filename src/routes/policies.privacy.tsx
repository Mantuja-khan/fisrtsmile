import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — ToyKart" }] }),
  component: () => (
    <>
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm">Your privacy matters to us. Here's how we handle your data.</p>

      <h2 className="font-bold text-lg mt-5 mb-2">Data we collect</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Name, email, phone, and shipping address (for order fulfillment).</li>
        <li>Payment is processed by trusted gateways — we do not store card details.</li>
      </ul>

      <h2 className="font-bold text-lg mt-5 mb-2">Data sharing</h2>
      <p className="text-sm"><strong>We do not share your data</strong> with third parties for marketing. Data is shared only with logistics partners to deliver your orders.</p>

      <h2 className="font-bold text-lg mt-5 mb-2">Cookies</h2>
      <p className="text-sm">We use cookies to keep your cart, wishlist, and login session. You can disable cookies in your browser at any time.</p>

      <h2 className="font-bold text-lg mt-5 mb-2">Your rights</h2>
      <p className="text-sm">Email firstsmile19@gmail.com to access, update, or delete your data.</p>
    </>
  ),
});
