import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Target, 
  Zap, 
  Users, 
  Trophy, 
  ArrowRight,
  ShieldCheck,
  BellRing,
  BarChart3,
  Globe,
  Ticket
} from "lucide-react";

export const AboutEvent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-transparent overflow-hidden mt-20">
      
      {/* --- HERO SPLIT SECTION --- */}
      <div className="flex flex-col lg:flex-row min-h-[90vh] w-full">
        
        {/* LEFT SIDE: THE IMAGE (Half Screen) */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto p-6 lg:p-12">
          <div className="relative h-full w-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80" 
              alt="Event Crowd" 
              className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-110"
            />
            {/* Glass Overlay on Image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 backdrop-blur-xl bg-white/5 p-6 rounded-3xl border border-white/10">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Live Energy</p>
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Capturing the Unseen.</h2>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: THE STORY (Half Screen) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-8 w-fit">
            <Sparkles className="w-3 h-3" />
            The Future of Access
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter text-base-content mb-8 leading-[0.9]">
            The Core of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-pulse">
              Madollar Tickets
            </span>
          </h1>
          
          <div className="space-y-8 max-w-xl">
            <p className="text-lg text-base-content/60 font-medium italic leading-relaxed border-l-4 border-primary/30 pl-6">
              We connect people with unforgettable experiences—empowering organizers and guiding attendees to the best events and venues across <span className="text-primary">Kenya and beyond.</span>
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-xl">
                  <Target className="w-6 h-6 text-primary mb-3" />
                  <h4 className="font-black uppercase italic text-xs tracking-widest mb-2">Mission</h4>
                  <p className="text-[11px] text-base-content/40 font-bold uppercase italic">Revolutionizing event discovery through digital harmony.</p>
               </div>
               <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-xl">
                  <Trophy className="w-6 h-6 text-secondary mb-3" />
                  <h4 className="font-black uppercase italic text-xs tracking-widest mb-2">Vision</h4>
                  <p className="text-[11px] text-base-content/40 font-bold uppercase italic">Being the definitive cultural hub for the digital age.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM CONTENT (SCROLLABLE) --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-32">
        
        {/* Core Pillars Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GlassCard 
            icon={<Zap className="w-6 h-6" />} 
            title="What We Offer" 
            color="secondary"
            desc="Curated discovery, real-time updates, and an encrypted digital ticket ecosystem."
          />
          <GlassCard 
            icon={<Users className="w-6 h-6" />} 
            title="Partners" 
            color="primary"
            desc="Powering local promoters, campus festivals, and corporate giants."
          />
          <GlassCard 
            icon={<Globe className="w-6 h-6" />} 
            title="Expansion" 
            color="secondary"
            desc="Bridging communities across borders through the power of live sound."
          />
        </div>

        {/* Why Choose Us - Feature Grid */}
        <div className="relative bg-black/20 backdrop-blur-3xl rounded-[4rem] p-10 lg:p-20 border border-white/10 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-16">
            <FeatureItem 
              icon={<ShieldCheck className="w-8 h-8" />} 
              title="Effortless Entry" 
              text="Purchase and scan tickets instantly with QR technology—no stress, no paper."
            />
            <FeatureItem 
              icon={<BellRing className="w-8 h-8" />} 
              title="Live Updates" 
              text="Stay informed with real-time alerts for drops, changes, and VIP exclusives."
            />
            <FeatureItem 
              icon={<BarChart3 className="w-8 h-8" />} 
              title="Scale Fast" 
              text="Organizers get deep analytics and management tools to grow their audience."
            />
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="text-center py-20">
          <h3 className="text-4xl font-black uppercase italic tracking-tighter text-base-content mb-8">
            The Scene is Waiting.
          </h3>
          <button
            onClick={() => navigate("/events")}
            className="group btn btn-primary px-12 rounded-2xl h-16 font-black uppercase tracking-[0.3em] text-[10px] hover:scale-105 transition-all shadow-xl shadow-primary/40 border-none"
          >
            Explore Full Scene
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

/* --- HELPER COMPONENTS --- */

const GlassCard = ({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: 'primary' | 'secondary' }) => (
  <div className="group relative rounded-[2.5rem] p-[1px] bg-gradient-to-b from-white/20 to-transparent hover:from-primary/40 transition-all duration-700">
    <div className="h-full bg-white/5 backdrop-blur-2xl rounded-[2.4rem] p-8 border border-white/5 flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-2xl ${color === 'primary' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'} flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter text-base-content mb-3">{title}</h2>
      <p className="text-base-content/40 text-[11px] font-bold leading-relaxed italic uppercase tracking-wider">{desc}</p>
    </div>
  </div>
);

const FeatureItem = ({ icon, title, text }: { icon: any, title: string, text: string }) => (
  <div className="text-center md:text-left">
    <div className="text-primary mb-6 flex justify-center md:justify-start">{icon}</div>
    <h4 className="font-black uppercase italic text-xs tracking-widest mb-4 text-base-content">
      {title}
    </h4>
    <p className="text-sm text-base-content/50 font-medium italic leading-relaxed">
      {text}
    </p>
  </div>
);