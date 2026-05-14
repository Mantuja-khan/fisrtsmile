import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Instagram, Phone } from "lucide-react";
import logo from "@/assets/firstsmile_logo.png";

export function Footer() {
  return (
    <footer className="mt-12 bg-foreground text-background">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="First Smile Logo" className="h-10 md:h-12 w-auto object-contain" />
          </div>
          <p className="text-sm opacity-70">
            India's playful destination for premium toys. Bringing smiles, one toy at a time.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-secondary">Categories</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products" search={{ category: "Soft Toys" } as never}>Soft Toys</Link></li>
            <li><Link to="/products" search={{ category: "Educational Toys" } as never}>Educational</Link></li>
            <li><Link to="/products" search={{ category: "Remote Control" } as never}>Remote Control</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-secondary">Help</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/track">Track Order</Link></li>
            <li><Link to="/policies/shipping">Shipping</Link></li>
            <li><Link to="/policies/returns">Returns & Exchange</Link></li>
            <li><Link to="/policies/privacy">Privacy Policy</Link></li>
            <li><Link to="/policies/terms">Terms of Use</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-secondary">Reach Us</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li className="flex items-center gap-2"><Mail className="size-4" /> firstsmile19@gmail.com</li>
            <li className="flex items-center gap-2"><MessageCircle className="size-4" /> WhatsApp (10 AM – 7 PM)</li>
            <li className="flex items-center gap-2"><Instagram className="size-4" /> @Firstsmile19</li>
            <li className="flex items-center gap-2"><Phone className="size-4" /> Calls fall back to WhatsApp</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs opacity-60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-4">
            <span>© {new Date().getFullYear()} First Smile. Indian jurisdiction. Users must be 18+.</span>
          </div>
          <span>Made with ❤️ for little explorers</span>
        </div>
      </div>
    </footer>
  );
}
