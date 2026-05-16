import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Instagram } from "lucide-react";
import logo from "@/assets/firstsmile_logo.png";
import footerBg from "@/assets/footer_banner.jpg";

export function Footer() {
  return (
    <footer className="mt-12 relative bg-[#0d1527] text-white overflow-hidden border-t border-slate-800">
      {/* Background Image with Blur, Darkened for optimal contrast */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 pointer-events-none select-none scale-105"
        style={{ 
          backgroundImage: `url(${footerBg})`,
          filter: "blur(3px) brightness(0.65)",
          opacity: "0.5"
        }}
      />

      {/* Content container */}
      <div className="relative z-10 w-full bg-slate-950/40">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src={logo} alt="First Smile Logo" className="h-10 md:h-12 w-auto object-contain" />
            </div>
            <p className="text-sm text-slate-300/90 leading-relaxed">
              India's playful destination for premium toys. Bringing smiles, one toy at a time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[13px] uppercase tracking-widest mb-4 text-[#BFDDF0]">Categories</h4>
            <ul className="space-y-2.5 text-sm text-slate-300/80">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products" search={{ category: "Soft Toys" } as never} className="hover:text-white transition-colors">Soft Toys</Link></li>
              <li><Link to="/products" search={{ category: "Educational Toys" } as never} className="hover:text-white transition-colors">Educational</Link></li>
              <li><Link to="/products" search={{ category: "Remote Control" } as never} className="hover:text-white transition-colors">Remote Control</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[13px] uppercase tracking-widest mb-4 text-[#BFDDF0]">Help</h4>
            <ul className="space-y-2.5 text-sm text-slate-300/80">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/policies/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/policies/exchange" className="hover:text-white transition-colors">Returns & Exchange</Link></li>
              <li><Link to="/policies/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policies/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/policies/legal" className="hover:text-white transition-colors">Legal Notice</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[13px] uppercase tracking-widest mb-4 text-[#BFDDF0]">Reach Us</h4>
            <ul className="space-y-3 text-sm text-slate-300/80">
              <li className="flex items-center gap-2.5 hover:text-white transition-colors"><Mail className="size-4.5 shrink-0 text-slate-400" /> support@firstsmiletoys.com</li>
              <li className="flex items-center gap-2.5 hover:text-white transition-colors"><MessageCircle className="size-4.5 shrink-0 text-slate-400" /> +91 7827743263</li>
              <li className="flex items-center gap-2.5 hover:text-white transition-colors"><Instagram className="size-4.5 shrink-0 text-slate-400" /> @Firstsmile19</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright bar */}
        <div className="border-t border-white/10 bg-slate-950/40 backdrop-blur-xs">
          <div className="container mx-auto px-4 py-5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4">
              <span>© {new Date().getFullYear()} First Smile. Indian jurisdiction. Users must be 18+.</span>
            </div>
            <span className="font-medium text-slate-300 flex items-center gap-1">Made with <span className="text-rose-500 animate-pulse">❤️</span> for little explorers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
