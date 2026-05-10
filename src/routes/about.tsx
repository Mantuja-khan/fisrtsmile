import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — First Smile" },
      { name: "description", content: "Learn more about First Smile and our mission to bring joy to children everywhere." },
    ],
  }),
  component: AboutPage,
});

const aboutImages = [
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
  "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&q=80",
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
  "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80"
];

function AboutPage() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % aboutImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="bg-surface rounded-3xl shadow-card overflow-hidden">
        <div className="bg-[#E43E3D] text-white p-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl mb-4">About First Smile</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Bringing joy, learning, and unforgettable moments to children everywhere.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row">
          <div className="p-8 md:p-12 space-y-8 text-foreground/80 leading-relaxed md:w-1/2">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
              <p>
                Founded with a simple mission—to put a smile on every child's face—First Smile has grown from a humble local store into a premier online destination for toys. We believe that play is the work of childhood, and the right toys can spark imagination, build essential skills, and create lifelong memories.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Promise</h2>
              <p>
                At First Smile, we rigorously curate our selection to ensure every product meets the highest standards of safety, durability, and educational value. We partner with the best brands worldwide to bring you toys that are not only fun but also enrich your child's development.
              </p>
            </section>
          </div>

          <div className="md:w-1/2 bg-muted/20 p-8 md:p-12 flex items-center justify-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-pop bg-white">
              <img 
                src={aboutImages[idx]} 
                alt="First Smile Kids" 
                className="w-full h-full object-cover transition-opacity duration-1000"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {aboutImages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full shadow-sm transition-all ${i === idx ? "w-8 bg-primary" : "w-2 bg-white/70"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 p-8 border-t border-border bg-white">
          <div className="bg-muted/30 p-6 rounded-2xl text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-bold mb-2">Fast Delivery</h3>
            <p className="text-sm">We ensure your little one's new favorite toy arrives as quickly as possible.</p>
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-bold mb-2">Safe & Secure</h3>
            <p className="text-sm">100% genuine products with secure payment gateways for peace of mind.</p>
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl text-center">
            <div className="text-4xl mb-4">💖</div>
            <h3 className="font-bold mb-2">Made with Love</h3>
            <p className="text-sm">Every toy is selected with care, just as we would for our own children.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
