import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-24 px-6 overflow-hidden bg-transparent">
      {/* --- BASE GLASS LAYER: Section-wide deep frost --- */}
      <div className="absolute inset-0 bg-base-100/10 backdrop-blur-[100px] z-0" />
      
      {/* --- GLOW ACCENTS: Soft color pulses behind the content --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none opacity-30" />

      {/* --- TOP LIGHT EDGE: A subtle 1px border line --- */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-12 lg:gap-20">
          
          {/* BRAND COLUMN (4 Cols) */}
          <div className="md:col-span-4 space-y-8">
            <div className="group cursor-default">
               <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary transition-all duration-500">
                 Nairobi • Kenya
               </span>
               <h3 className="text-2xl lg:text-3xl font-black tracking-tighter italic uppercase text-base-content leading-none mt-2">
  Madollar<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-2xl">Tickets</span>
</h3>
            </div>
            <p className="text-sm font-medium text-base-content/60 leading-relaxed italic max-w-xs border-l-2 border-primary/30 pl-5">
              The ultimate gateway to campus life. Secure your spot at the most exclusive events with total confidence.
            </p>
            
            {/* Social Tiles: High-Blur rounded squares */}
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-base-content/40 hover:text-white transition-all duration-500 hover:-translate-y-2 shadow-2xl backdrop-blur-xl"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS (2 Cols) */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-base-content/40 mb-10">
              Explore
            </h4>
            <ul className="space-y-5">
              {["Home", "Venues", "Events", "About"].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="group flex items-center text-base-content/50 hover:text-primary transition-all duration-300 font-bold uppercase italic tracking-[0.2em] text-[11px]"
                  >
                    {item}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all ml-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT DETAILS (3 Cols) */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-base-content/40 mb-10">
              Connect
            </h4>
            <ul className="space-y-8">
              <li className="flex items-center gap-4 text-sm font-bold group cursor-pointer">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-primary/20 transition-all backdrop-blur-xl">
                  <Mail size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-base-content/30">Email</span>
                  <span className="text-[11px] uppercase tracking-wider text-base-content/70 group-hover:text-primary transition-colors">madollartickets@gmail.com</span>
                </div>
              </li>
              <li className="flex items-center gap-4 text-sm font-bold group cursor-pointer">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-primary/20 transition-all backdrop-blur-xl">
                  <Phone size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-base-content/30">Phone</span>
                  <span className="text-[11px] uppercase tracking-wider text-base-content/70 group-hover:text-primary transition-colors">+254 712 345 678</span>
                </div>
              </li>
            </ul>
          </div>

          {/* LOCATION (3 Cols) */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-base-content/40 mb-10">
              Foundry
            </h4>
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl p-6 group hover:border-primary/40 transition-all duration-700">
              <MapPin className="text-primary mb-3 group-hover:scale-110 transition-transform" size={24} />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/70 leading-relaxed italic">
                Central District,<br /> Nairobi, Kenya
              </p>
              {/* Decorative accent for the card */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary/40 animate-ping" />
            </div>
          </div>

        </div>

        {/* --- BOTTOM BAR: Minimal & Sharp --- */}
        <div className="mt-28 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-base-content/30 group">
            <Sparkles size={14} className="text-primary group-hover:rotate-12 transition-transform" />
            <span>&copy; {currentYear} Madollar Tickets</span>
          </div>
          
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-base-content/20">
            <a href="#" className="hover:text-primary transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">Terms</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};