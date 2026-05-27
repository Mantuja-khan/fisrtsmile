import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, MapPin, Clock, Info, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — Trivoxo Toys" },
      {
        name: "description",
        content:
          "Reach Trivoxo Toys support via email, WhatsApp, or visit our store at Genesis Mall, Bhiwadi. We're here to help!",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulating submission
    setTimeout(() => {
      alert("Thank you for contacting us! We will get back to you within 24 working hours.");
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Contact</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          If you have any questions about your order or need assistance, feel free to reach out to
          us. We are here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column - Contact Details */}
        <div className="space-y-6">
          {/* Email Support */}
          <div className="bg-surface rounded-xl shadow-card p-6 flex gap-4 border border-border/50">
            <div className="size-12 grid place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Mail className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">Email Support</h3>
              <a
                href="mailto:support@trivoxotoys.com"
                className="text-primary hover:underline font-semibold block text-base md:text-lg"
              >
                support@trivoxotoys.com
              </a>
              <p className="text-sm text-muted-foreground">
                Response time: Within 24 working hours
              </p>
            </div>
          </div>

          {/* WhatsApp Support */}
          <div className="bg-surface rounded-xl shadow-card p-6 flex gap-4 border border-border/50">
            <div className="size-12 grid place-items-center rounded-xl bg-[#25D366]/10 text-[#25D366] shrink-0">
              <MessageCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">WhatsApp Support</h3>
              <a
                href="https://wa.me/917827743263"
                target="_blank"
                rel="noreferrer"
                className="text-[#128C7E] dark:text-[#25D366] hover:underline font-semibold block text-base md:text-lg"
              >
                +91 7827743263
              </a>
              <p className="text-sm text-muted-foreground">
                Available from 10 AM to 7 PM (Monday to Saturday)
              </p>
              <div className="pt-1">
                <span className="text-xs font-medium text-[#128C7E] dark:text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded-full">
                  Messages only
                </span>
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className="bg-surface rounded-xl shadow-card p-6 flex gap-4 border border-border/50">
            <div className="size-12 grid place-items-center rounded-xl bg-secondary/10 text-secondary-foreground shrink-0">
              <MapPin className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-2">Business Address</h3>
              <div className="text-foreground/80 font-medium leading-relaxed text-sm md:text-base space-y-0.5">
                <p className="font-bold text-foreground">Trivoxo Toys</p>
                <p>Genesis Mall</p>
                <p>Bhiwadi – 301019</p>
                <p>Rajasthan, India</p>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-surface rounded-xl shadow-card p-6 flex gap-4 border border-border/50">
            <div className="size-12 grid place-items-center rounded-xl bg-muted text-muted-foreground shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">Support Hours</h3>
              <div className="space-y-0.5 text-sm md:text-base text-foreground/80">
                <p className="font-semibold text-foreground">Monday to Saturday</p>
                <p className="text-primary font-bold">10 AM to 7 PM</p>
                <p className="text-muted-foreground text-xs md:text-sm mt-1 border-t border-border/40 pt-1">
                  Sunday and public holidays closed
                </p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-xl p-5 flex gap-4">
            <div className="size-10 grid place-items-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Info className="size-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-base">
                Important Note
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400/90 mt-1 leading-relaxed">
                For faster support, please share your Order ID and a brief description of your query
                when contacting us.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 md:p-8 lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold text-foreground mb-2">Send us a Message</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Have a specific query? Fill out the form below and we'll get back to you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs md:text-sm font-medium text-foreground/80">
                  Your Name *
                </label>
                <input
                  id="name"
                  required
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs md:text-sm font-medium text-foreground/80"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="whatsapp"
                  className="text-xs md:text-sm font-medium text-foreground/80"
                >
                  WhatsApp No. (Optional)
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="orderId"
                  className="text-xs md:text-sm font-medium text-foreground/80"
                >
                  Order ID (Optional)
                </label>
                <input
                  id="orderId"
                  type="text"
                  placeholder="e.g., #FS-12345"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="text-xs md:text-sm font-medium text-foreground/80"
              >
                How can we help? *
              </label>
              <textarea
                id="message"
                required
                rows={5}
                placeholder="Provide a detailed description of your query..."
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg shadow-sm transition-all active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none mt-2 border border-transparent hover:shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></span>{" "}
                  Sending...
                </span>
              ) : (
                <>
                  <Send className="size-4" /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom - Google Map */}
      <div className="mt-12 md:mt-16 border-t border-border/40 pt-12">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-foreground">
            <MapPin className="size-6 text-primary" /> Find Us Here
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            Locate our business at Genesis Mall, Bhiwadi. Feel free to visit us during operating
            hours.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-card border border-border/50 bg-surface aspect-[16/9] md:aspect-[21/9] w-full min-h-[350px]">
          <iframe
            title="Trivoxo Toys Location - Genesis Mall"
            src="https://maps.google.com/maps?q=Genesis%20Mall,%20Bhiwadi,%20Rajasthan%20301019&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
