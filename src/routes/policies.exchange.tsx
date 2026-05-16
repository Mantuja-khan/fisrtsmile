import { createFileRoute } from "@tanstack/react-router";
import { Package, RefreshCw, CheckCircle, Clock, Search, Truck, Zap, MessageCircle, MapPin, Mail, Phone, CalendarHeart } from "lucide-react";

export const Route = createFileRoute("/policies/exchange")({
  head: () => ({ meta: [{ title: "Order Exchange Policy — First Smile Toys" }] }),
  component: ExchangePolicy,
});

function ExchangePolicy() {
  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20 selection:bg-rose-100">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-rose-100/50 py-16 md:py-24">
        {/* Playful Background Elements */}
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-12"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div className="absolute bottom-10 left-10 opacity-20 pointer-events-none">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-12"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
            <RefreshCw className="size-3.5" /> Returns & Exchanges
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Easy Order Exchange
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Simple & Hassle-Free Exchange Process to keep the smiles going!
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-20">
        
        {/* 2. Exchange Policy Content Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 group">
            <div className="size-12 bg-blue-50 text-blue-500 rounded-2xl grid place-items-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarHeart className="size-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">7 Days Exchange</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Exchange is available within 7 days of delivery. Make sure to raise the request in time.</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 group">
            <div className="size-12 bg-rose-50 text-rose-500 rounded-2xl grid place-items-center mb-4 group-hover:scale-110 transition-transform">
              <Package className="size-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Original Condition</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">The product must be unused, unwashed, and in its original packaging with all tags attached.</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 group">
            <div className="size-12 bg-emerald-50 text-emerald-500 rounded-2xl grid place-items-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle className="size-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Free Exchange</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Damaged or wrong products are eligible for completely free exchange with no extra shipping costs.</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 group">
            <div className="size-12 bg-purple-50 text-purple-500 rounded-2xl grid place-items-center mb-4 group-hover:scale-110 transition-transform">
              <RefreshCw className="size-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">My Orders</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">You can easily raise an exchange request directly from the "My Orders" section in your account.</p>
          </div>
        </div>

        {/* 3. Exchange Process Timeline */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-3">How It Works</h2>
            <p className="text-slate-500 font-medium text-sm">Follow these 4 simple steps to exchange your product</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
            
            {[
              { step: 1, title: "Request Exchange", icon: <MessageCircle className="size-5" />, color: "text-blue-600", bg: "bg-blue-50" },
              { step: 2, title: "Approval & Pickup", icon: <MapPin className="size-5" />, color: "text-amber-600", bg: "bg-amber-50" },
              { step: 3, title: "Product Inspection", icon: <Search className="size-5" />, color: "text-purple-600", bg: "bg-purple-50" },
              { step: 4, title: "Replacement Shipped", icon: <Truck className="size-5" />, color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((s) => (
              <div key={s.step} className="relative z-10 bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className={`size-12 ${s.bg} ${s.color} rounded-full grid place-items-center mx-auto mb-3 shadow-sm border border-white ring-4 ring-slate-50`}>
                  {s.icon}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Step {s.step}</div>
                <h4 className="font-bold text-slate-800 text-sm">{s.title}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Features Section */}
        <section className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-8 md:p-10 mb-12 shadow-inner border border-rose-100/50">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="space-y-3">
              <div className="size-10 bg-white text-rose-500 rounded-full grid place-items-center mx-auto shadow-sm">
                <Truck className="size-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Easy Pickup</h4>
            </div>
            <div className="space-y-3">
              <div className="size-10 bg-white text-orange-500 rounded-full grid place-items-center mx-auto shadow-sm">
                <Zap className="size-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Fast Replacement</h4>
            </div>
            <div className="space-y-3">
              <div className="size-10 bg-white text-emerald-500 rounded-full grid place-items-center mx-auto shadow-sm">
                <MessageCircle className="size-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">WhatsApp Support</h4>
            </div>
            <div className="space-y-3">
              <div className="size-10 bg-white text-blue-500 rounded-full grid place-items-center mx-auto shadow-sm">
                <Search className="size-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Real-time Tracking</h4>
            </div>
          </div>
        </section>

        {/* 5. Contact Support Box */}
        <section>
          <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            
            <div className="relative z-10 md:flex items-center justify-between gap-8">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-extrabold mb-2">Need Help?</h3>
                <p className="text-slate-300 text-sm font-medium">Our customer support team is always ready to assist you with your exchanges.</p>
              </div>
              
              <div className="space-y-4 shrink-0">
                <a href="mailto:support@firstsmiletoys.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-xl backdrop-blur-md">
                  <div className="size-8 bg-white text-slate-900 rounded-lg grid place-items-center shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Us</div>
                    <div className="text-sm font-bold">support@firstsmiletoys.com</div>
                  </div>
                </a>
                
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <div className="size-8 bg-emerald-500 text-white rounded-lg grid place-items-center shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp / Call</div>
                    <div className="text-sm font-bold">+91 7827743263</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pl-1">
                  <Clock className="size-3.5" /> Timing: 10 AM – 7 PM
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
