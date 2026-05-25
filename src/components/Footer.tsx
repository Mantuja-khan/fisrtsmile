import { Link, useLocation } from "@tanstack/react-router";
import { Mail, MessageCircle, Instagram, Truck, Headphones, CornerDownLeft, Banknote } from "lucide-react";
import logo from "@/assets/firstsmile_logo.png";
import footerBg from "@/assets/footer_banner.jpg";

export function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* Features Block */}
      {isHomePage && (
        <div className="bg-white py-8 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1E3A8A] text-slate-100 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform">
              <Truck className="size-7 md:size-8 mb-3 text-[#BFDDF0]" />
              <h3 className="font-bold text-sm md:text-base mb-1">Free Shipping</h3>
              <p className="text-[10px] md:text-xs text-white/90">Enjoy <strong>free shipping</strong> across India!</p>
            </div>
            <div className="bg-[#1E3A8A] text-slate-100 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform">
              <Headphones className="size-7 md:size-8 mb-3 text-[#BFDDF0]" />
              <h3 className="font-bold text-sm md:text-base mb-1">Customer Support</h3>
              <p className="text-[10px] md:text-xs text-white/90">Contact us via <strong>Email & WhatsApp</strong> anytime!</p>
            </div>
            <div className="bg-[#1E3A8A] text-slate-100 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform">
              <CornerDownLeft className="size-7 md:size-8 mb-3 text-[#BFDDF0]" />
              <h3 className="font-bold text-sm md:text-base mb-1">5 Day Returns</h3>
              <p className="text-[10px] md:text-xs text-white/90">Enjoy free delivery on all orders</p>
            </div>
            <div className="bg-[#1E3A8A] text-slate-100 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform">
              <Banknote className="size-7 md:size-8 mb-3 text-[#BFDDF0]" />
              <h3 className="font-bold text-sm md:text-base mb-1">COD Available</h3>
              <p className="text-[10px] md:text-xs text-white/90">COD available for all orders</p>
            </div>
          </div>
        </div>
      </div>
      )}

      <footer className="relative bg-[#0d1527] text-white overflow-hidden border-t border-slate-800">
        {/* Background Image with Blur, Darkened for optimal contrast */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 pointer-events-none select-none scale-105"
          style={{
          backgroundImage: `url(${footerBg})`,
          filter: "blur(3px) brightness(0.65)",
          opacity: "0.5",
        }}
      />

      {/* Content container */}
      <div className="relative z-10 w-full bg-slate-950/40">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Toy Haat Logo" className="h-16 md:h-20 w-auto object-contain" />
            </div>
            <p className="text-sm text-slate-300/90 leading-relaxed">
              India's playful destination for premium toys. Bringing smiles, one toy at a time.
            </p>
          </div>

          <div>
            <h4 className=" text-[13px] uppercase tracking-widest mb-4 text-[#BFDDF0]">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300/80">
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: "soft-toys" } as never}
                  className="hover:text-white transition-colors"
                >
                  Soft Toys
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: "educational-toys" } as never}
                  className="hover:text-white transition-colors"
                >
                  Educational
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className=" text-[13px] uppercase tracking-widest mb-4 text-[#BFDDF0]">Help</h4>
            <ul className="space-y-2.5 text-sm text-slate-300/80">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-white transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/policies/legal" className="hover:text-white transition-colors">
                  Legal Notice
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className=" text-[13px] uppercase tracking-widest mb-4 text-[#BFDDF0]">Reach Us</h4>
            <ul className="space-y-3 text-sm text-slate-300/80">
              <li className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail className="size-4.5 shrink-0 text-slate-400" /> support@toyhaat.com
              </li>
              <li className="flex items-center gap-2.5 hover:text-white transition-colors">
                <MessageCircle className="size-4.5 shrink-0 text-slate-400" /> +91 7827743263
              </li>
              <li className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Instagram className="size-4.5 shrink-0 text-slate-400" /> @toyhaat
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright bar */}
        <div className="border-t border-white/10 bg-slate-950/40 backdrop-blur-xs">
          <div className="container mx-auto px-4 py-5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4">
              <span>
                © {new Date().getFullYear()} Toy Haat. Indian jurisdiction. Users must be 18+.
              </span>
            </div>
            <span className="font-medium text-slate-300 flex items-center gap-1">
              Made with <span className="text-rose-500 animate-pulse">❤️</span> for little explorers
            </span>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
