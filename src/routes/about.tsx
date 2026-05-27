import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Target,
  ShieldCheck,
  Heart,
  User,
  Mail,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Trivoxo Toys" },
      {
        name: "description",
        content:
          "Where Play Meets Purpose. Founded by Avinash Shah, Trivoxo Toys selects toys that spark creativity and support learning.",
      },
    ],
  }),
  component: AboutPage,
});

const aboutImages = [
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&q=80",
  "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=1200&q=80",
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=80",
];

function AboutPage() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % aboutImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10 pb-12 font-sans">
      {/* HERO SECTION */}
      <section className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {aboutImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              i === idx ? "opacity-100 scale-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="relative z-20 text-center px-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium uppercase tracking-wide border border-white/15 mb-4">
            <Sparkles className="size-3.5 text-amber-300" /> Since 2019
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold text-white mb-3 tracking-tight">
            Where Play Meets <span className="text-amber-300">Purpose</span>
          </h1>
          <p className="text-sm md:text-base text-white/90 max-w-lg mx-auto">
            Every smile matters, every step matters, every toy counts.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-20"></div>
      </section>

      {/* STORY SECTION */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-primary bg-primary/5 px-2.5 py-1 rounded-md font-medium text-xs tracking-wider uppercase">
              <Target className="size-3.5" /> Our Philosophy
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              About Trivoxo Toys
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Founded in 2019, Trivoxo Toys was created with one simple idea –{" "}
              <strong className="text-slate-800 font-medium">
                play should not just entertain… it should help a child grow.
              </strong>
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              That’s why every product you see here is carefully selected to:
            </p>
            <ul className="space-y-2">
              {["Spark creativity", "Build curiosity", "Support learning in a natural way"].map(
                (item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 text-sm">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ),
              )}
            </ul>
            <blockquote className="border-l-2 border-slate-300 pl-4 py-1.5 text-slate-800 italic text-base mt-5 bg-slate-50 rounded-r-md pr-3">
              “Will this make a child better while keeping them happy?”
            </blockquote>
            <p className="text-slate-500 text-xs">
              From toys and games to educational tools, everything is chosen keeping this one thing
              in mind.
            </p>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80"
                className="w-full h-full object-cover"
                alt="Happy childhood playing"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE BELIEVE & TRUST */}
      <section className="bg-slate-50/50 py-12 border-y border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {/* Belief card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/60 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2.5 text-slate-900">
                  <Heart className="size-4.5 text-rose-500" /> What We Believe
                </h3>
                <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                  Kids learn best when they enjoy what they’re doing. So we focus on toys that:
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    "Keep them engaged without screens",
                    "Help improve thinking and focus",
                    "Encourage imagination and exploration",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700 text-sm">
                      <span className="size-1 rounded-full bg-slate-400 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                {["Safe for kids", "Strong & durable", "Worth trust"].map((tag, i) => (
                  <div
                    key={i}
                    className="text-center p-1.5 bg-slate-50 border border-slate-100 rounded flex items-center justify-center"
                  >
                    <span className="text-[11px] font-medium text-slate-600">✔ {tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/60 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2.5 text-slate-900">
                  <ShieldCheck className="size-4.5 text-blue-500" /> Built on Trust & Care
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We work with reliable manufacturers and partners who follow proper safety and
                  quality standards.
                </p>
                <p className="text-slate-800 font-medium text-base leading-relaxed mt-3 border-l-2 border-blue-400 pl-3 bg-blue-50/30 py-1 pr-2 rounded-r">
                  No shortcuts. No random products.
                </p>
                <p className="text-slate-500 text-[13px] mt-3">
                  Only things we would feel comfortable giving to our own family.
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-auto">
                <p className="text-xs font-medium text-slate-700 italic leading-relaxed">
                  "Because for us, this is not just business – it’s about the small moments that
                  matter in a child’s life."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg text-white relative border border-slate-800">
          <div className="relative z-10 p-6 md:p-10 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full font-medium text-[11px] uppercase tracking-wide border border-white/10">
                <User className="size-3.5 text-amber-300" /> Meet the Founder
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                A Simple Idea That Started It All
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Trivoxo Toys was founded by{" "}
                <strong className="text-amber-300 font-medium">Avinash Shah</strong> with a clear
                goal – to bring better play options for children.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                He saw that many toys only keep kids busy, but don’t really help them learn or grow.
                So he built Trivoxo Toys to offer products that:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {["Have real value", "Thoughtfully designed", "Make both happy"].map((text, i) => (
                  <li
                    key={i}
                    className="p-2 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-center"
                  >
                    {text}
                  </li>
                ))}
              </ul>
              <p className="text-slate-400 text-xs italic pt-3 border-t border-white/10 w-fit">
                "Even today, that same focus continues – keeping things simple, useful, and
                meaningful."
              </p>
            </div>
            <div className="md:col-span-5 flex justify-center">
              <div className="size-48 md:size-56 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center relative">
                <div className="flex flex-col items-center justify-center text-center gap-2.5 p-6 select-none">
                  <div className="size-14 rounded-full bg-amber-300 text-slate-950 flex items-center justify-center font-bold text-xl">
                    AS
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium text-base text-white">Avinash Shah</p>
                    <p className="text-[11px] text-slate-300 font-normal uppercase tracking-wider mt-0.5">
                      Founder, Trivoxo Toys
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HELP & PROMISE */}
      <section className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-6 py-2">
        {/* Help Section */}
        <div className="bg-white rounded-xl border border-slate-200/70 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1.5">We’re Here to Help</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Have a question about your order or product? We’re always ready to assist you.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="size-9 grid place-items-center bg-white text-slate-600 rounded border border-slate-200 shrink-0">
                <Mail className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Email Support
                </p>
                <a
                  href="mailto:support@trivoxotoys.com"
                  className="text-slate-800 font-medium hover:underline text-sm block mt-0.5"
                >
                  support@trivoxotoys.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-50/40 rounded-lg border border-emerald-100/60">
              <div className="size-9 grid place-items-center bg-white text-emerald-600 rounded border border-emerald-200 shrink-0">
                <MessageCircle className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  WhatsApp Help
                </p>
                <a
                  href="https://wa.me/917827743263"
                  className="text-slate-800 font-medium hover:underline text-sm block mt-0.5"
                >
                  +91 7827743263
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Promise Section */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 flex flex-col justify-center items-center text-center space-y-4 relative">
          <div className="size-12 grid place-items-center bg-rose-50 text-rose-600 rounded-full border border-rose-100 shrink-0">
            <Heart className="size-6" fill="currentColor" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-slate-900">A Small Promise</h3>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
              We don’t just want to sell toys. We want to be part of your child’s happy moments,
              learning, and growth.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-200/50 w-full flex flex-col items-center space-y-3">
            <p className="text-xs font-medium text-slate-500">
              👉 Because every child deserves a happy start.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded transition-all shadow-xs"
            >
              Explore Our Toys
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
