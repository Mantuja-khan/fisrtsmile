import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Truck, Heart, Sparkles, Users, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — First Smile" },
      { name: "description", content: "Discover the magic behind First Smile. Bringing joy, imagination, and safe play to children around the world." },
    ],
  }),
  component: AboutPage,
});

const aboutImages = [
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&q=80",
  "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=1200&q=80",
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=80",
  "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&q=80"
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
    <div className="min-h-screen bg-[#fafafa]">
      {/* HERO SECTION - Borderless, Full Width */}
      <section className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        {aboutImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              i === idx ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest uppercase border border-white/30 mb-6 animate-fade-in">
            <Sparkles className="size-4" /> Our Journey
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
            Crafting Every <br className="hidden md:block" />
            <span className="text-[#FFC107]">First Smile</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Transforming playtime into cherished childhood milestones since day one.
          </p>
        </div>

        {/* Bottom Fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent z-20"></div>
      </section>

      {/* STORY SECTION - Spacious containerless content flow */}
      <section className="container mx-auto px-6 py-16 md:py-24 max-w-6xl">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-6 order-2 md:order-1">
            <div className="space-y-2">
              <div className="h-1 w-16 bg-[#1D4ED8] rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">The Heart Behind Our Mission</h2>
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              At First Smile, we view play as the sacred, essential work of childhood. What began as a local dream fueled by a simple goal—delivering infinite joy—has blossomed into a nationally loved curator of childhood delight.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We are more than just a toy store; we are creators of moments. Whether it's constructing intricate towers, embarking on imaginary safaris, or coding the first robot—we exist to ensure these steps are safe, smart, and absolutely magical.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#1D4ED8]">
                  <Users className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">10K+</h4>
                  <p className="text-sm text-gray-500 font-medium">Happy Families</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#1D4ED8]">
                  <ShoppingBag className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">2000+</h4>
                  <p className="text-sm text-gray-500 font-medium">Selected Toys</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 order-1 md:order-2">
             <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#1D4ED8] to-[#FFC107] rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-30 transition duration-700"></div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Playing Kids"
                  />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* PILLARS - Subtle cards floating on bg, NOT boxed inside an inner white sheet */}
      <section className="bg-white py-20 border-y border-gray-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
             <h3 className="text-sm font-bold text-[#1D4ED8] tracking-widest uppercase">Our Guarantee</h3>
             <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900">The First Smile Promise</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Card 1 */}
            <div className="group flex flex-col items-center text-center p-4">
              <div className="size-20 bg-blue-50 text-[#1D4ED8] rounded-[2rem] flex items-center justify-center mb-6 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:bg-[#1D4ED8] group-hover:text-white">
                <Truck className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Express Delivery</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">
                Lightning-fast dispatch to make sure their newest adventure arrives without anticipation fatigue.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group flex flex-col items-center text-center p-4">
              <div className="size-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:bg-blue-600 group-hover:text-white">
                <ShieldCheck className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Certified Safe</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">
                Rigorous curation standards ensuring non-toxic, strictly verified products globally sourced.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group flex flex-col items-center text-center p-4">
              <div className="size-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:bg-amber-600 group-hover:text-white">
                <Heart className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Made with Heart</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">
                Selected hand-in-hand by developmental experts and passionate parents alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION / CLOSER */}
      <section className="py-24 text-center container mx-auto px-6">
        <div className="max-w-3xl mx-auto space-y-8 bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1D4ED8]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFC107]/10 rounded-full blur-3xl"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white relative z-10 font-display">Ready to unlock joy?</h2>
          <p className="text-gray-300 relative z-10 text-lg">Start browsing our catalog and discover exactly what your little one is dreaming of.</p>
          
          <div className="relative z-10 pt-4">
            <a 
              href="/products" 
              className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-full font-bold tracking-wide text-lg shadow-xl hover:bg-[#FFC107] hover:text-[#1D4ED8] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Browse Products
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
