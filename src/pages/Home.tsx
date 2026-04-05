import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../content-folders/Home/EventsCard";
import App from "../content-folders/Home/HeroHomeSection";
import { PopularEvents } from "../content-folders/Home/PopularEvents";
import { Newsletter } from "../content-folders/Home/Newsletter"; // Ensure you use the glass Newsletter we made
import { Fade, Slide } from "react-awesome-reveal";
import { Sparkles } from "lucide-react";

export const Home = () => {
  return (
    <div className="relative min-h-screen bg-transparent text-base-content selection:bg-primary/30 overflow-x-hidden font-sans">
      
      {/* --- UNIFIED FIXED BACKGROUND --- */}
      {/* This image stays fixed while the glass sections scroll over it */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80')` }}
      />
      
      {/* Adaptive Tints for Light/Dark mode readability */}
      <div className="fixed inset-0 z-[1] bg-white/20 dark:bg-black/50 mix-blend-overlay" />
      <div className="fixed inset-0 z-[2] bg-gradient-to-b from-base-100/10 via-base-100/60 to-base-100/90 backdrop-blur-[2px]" />

      {/* Ambient Glows for Depth */}
      <div className="fixed inset-0 z-[3] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/15 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[0%] right-[-5%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      {/* --- Navigation --- */}
      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="w-full">
          <Fade triggerOnce duration={1500}>
            <App />
          </Fade>
        </section>

        {/* Content Flow */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-32 pb-32">
          
          {/* Section: Category Discovery */}
          <section className="relative pt-12">
            <div className="flex flex-col items-center mb-16 text-center">
               <Fade direction="up" triggerOnce cascade damping={0.2}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-primary/20 backdrop-blur-md">
                    <Sparkles className="w-3 h-3" />
                    Campus Exclusive
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">
                    Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Events</span>
                  </h2>
                  <p className="mt-8 text-base-content/70 font-medium max-w-xl text-lg md:text-xl italic border-l-2 border-primary/30 pl-6">
                    Curated festivals, tech workshops, and underground meetups happening across campus.
                  </p>
               </Fade>
            </div>
            
            <Slide triggerOnce direction="up" duration={1000} fraction={0.1}>
              <div className="transform transition-all duration-700 hover:scale-[1.01]">
                <EventCard />
              </div>
            </Slide>
          </section>

          {/* Section: Trending / Popular Events (Glassified) */}
          <section className="relative">
             <Fade triggerOnce duration={1200}>
                <div className="rounded-[4rem] overflow-hidden">
                  <PopularEvents />
                </div>
             </Fade>
          </section>

          {/* Section: Newsletter (The "VIP Drop" Card) */}
          <section className="relative">
             <Fade direction="up" triggerOnce duration={1000}>
                <Newsletter />
             </Fade>
          </section>

        </div>
      </main>

      {/* Footer Wrapper */}
      <footer className="relative z-10 bg-base-100/10 dark:bg-black/20 backdrop-blur-3xl border-t border-white/10">
        <Fade triggerOnce delay={200}>
          <Footer />
        </Fade>
      </footer>

      {/* Global CSS for seamless glass scrolling */}
      <style>{`
        html { scroll-behavior: smooth; }
        body { background-color: transparent; }
        
        /* Premium Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: rgba(var(--p), 0.2); 
          border-radius: 10px; 
          border: 2px solid transparent;
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
};