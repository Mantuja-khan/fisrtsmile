import { Link, useLocation } from "@tanstack/react-router";
import { Mail, MessageCircle, Instagram, Truck, Headphones, CornerDownLeft, Banknote, ShieldCheck, CreditCard } from "lucide-react";
import logo from "@/assets/firstsmile_logo.png";
import footerBg from "@/assets/firstsmile_logo.png";

export function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return (
    <>
      {/* Features Block */}
      {isHomePage && (
        <div className="bg-white py-8 border-t border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-slate-800 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform border border-slate-100">
                <Truck className="size-7 md:size-8 mb-3 text-slate-700" />
                <h3 className="font-bold text-sm md:text-base mb-1">Free Shipping</h3>
                <p className="text-[10px] md:text-xs text-slate-600">Free shipping on order above ₹888.00</p>
              </div>
              <div className="text-slate-800 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform border border-slate-100">
                <Headphones className="size-7 md:size-8 mb-3 text-slate-700" />
                <h3 className="font-bold text-sm md:text-base mb-1">Support Online</h3>
                <p className="text-[10px] md:text-xs text-slate-600">Support 24/7 , send your query, we connect you shortly </p>
              </div>
              <div className="text-slate-800 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform border border-slate-100">
                <ShieldCheck className="size-7 md:size-8 mb-3 text-slate-700" />
                <h3 className="font-bold text-sm md:text-base mb-1 uppercase">7 Days Return</h3>
                <p className="text-[10px] md:text-xs text-slate-600">Simply return it within 7 days for an exchange. Please make sure the items are in undamaged condition.</p>
              </div>
              <div className="text-slate-800 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform border border-slate-100">
                <CreditCard className="size-7 md:size-8 mb-3 text-slate-700" />
                <h3 className="font-bold text-sm md:text-base mb-1 uppercase">100% Payment Secure</h3>
                <p className="text-[10px] md:text-xs text-slate-600">We ensure secure payment with Gpay and Paytm</p>
              </div>
              <div className="text-slate-800 rounded-lg p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform border border-slate-100">
                <Banknote className="size-7 md:size-8 mb-3 text-slate-700" />
                <h3 className="font-bold text-sm md:text-base mb-1">COD Available</h3>
                <p className="text-[10px] md:text-xs text-slate-600">Rs. 60 extra on Cash on Delivery orders</p>
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
                <img src={logo} alt="Trivoxo Toys Logo" className="h-16 md:h-20 w-auto object-contain" />
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
                  <Mail className="size-4.5 shrink-0 text-slate-400" /> support@trivoxotoys.com
                </li>
                <li className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <MessageCircle className="size-4.5 shrink-0 text-slate-400" /> +91 7827743263
                </li>
                <li className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <Instagram className="size-4.5 shrink-0 text-slate-400" /> @trivoxotoys
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright bar */}
          <div className="border-t border-white/10 bg-slate-950/40 backdrop-blur-xs">
            <div className="container mx-auto px-4 py-5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-4">
                <span>
                  © {new Date().getFullYear()} Trivoxo Toys. Indian jurisdiction. Users must be 18+.
                </span>
              </div>
              <span className="font-medium text-slate-300 flex items-center gap-1">
                Created by VM solutiions
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}