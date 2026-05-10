import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Instagram, Phone, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — ToyKart" },
      { name: "description", content: "Reach ToyKart support via email, WhatsApp or Instagram. Response within 24 hours." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold">Contact & Support</h1>
      <p className="text-muted-foreground mt-1">We're here to help. Response within 24 hours.</p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {[
          { icon: Mail, title: "Email", value: "firstsmile19@gmail.com", href: "mailto:firstsmile19@gmail.com", note: "Best for order issues" },
          { icon: MessageCircle, title: "WhatsApp", value: "Messages only · 10 AM – 7 PM", note: "General queries" },
          { icon: Instagram, title: "Instagram", value: "@toykart", note: "DM us anytime" },
          { icon: Phone, title: "Call", value: "Falls back to WhatsApp", note: "Please message us instead" },
        ].map((c) => (
          <div key={c.title} className="bg-surface rounded-xl shadow-card p-5 flex gap-4">
            <div className="size-12 grid place-items-center rounded-full bg-accent text-primary shrink-0">
              <c.icon className="size-5" />
            </div>
            <div>
              <h3 className="font-bold">{c.title}</h3>
              {c.href ? (
                <a href={c.href} className="text-primary font-semibold text-sm">{c.value}</a>
              ) : (
                <div className="text-sm font-medium">{c.value}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">{c.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-surface rounded-xl shadow-card p-5">
        <h2 className="font-bold flex items-center gap-2"><Clock className="size-4 text-primary" /> Response Time</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We respond to all queries within 24 hours. <strong>Order-related issues are handled via email only</strong> for proper documentation.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll get back to you within 24 hours."); }}
        className="mt-6 bg-surface rounded-xl shadow-card p-5 grid md:grid-cols-2 gap-3"
      >
        <h2 className="md:col-span-2 font-bold text-lg">Send us a message</h2>
        <input required placeholder="Your name" className="px-3 py-2 text-sm border border-input rounded" />
        <input required type="email" placeholder="Email" className="px-3 py-2 text-sm border border-input rounded" />
        <input placeholder="Order ID (optional)" className="md:col-span-2 px-3 py-2 text-sm border border-input rounded" />
        <textarea required placeholder="How can we help?" className="md:col-span-2 px-3 py-2 text-sm border border-input rounded min-h-32" />
        <button className="md:col-span-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded">Send Message</button>
      </form>
    </div>
  );
}
