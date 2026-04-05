import React, { useRef } from "react";
import emailjs from "emailjs-com";
import { toast, Toaster } from "react-hot-toast";
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Github, 
  Mail, 
  MessageSquare, 
  User, 
  Send,
  Sparkles,
  MapPin,
  Phone
} from "lucide-react";
import { Navbar } from "../components/Navbar";

// EmailJS Credentials
const SERVICE_ID = "service_36rahuf";
const TEMPLATE_ID = "template_t7k2dxh";
const PUBLIC_KEY = "mSrGC2dXclojT6ci1";

const ContactSection: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    toast.promise(
      emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY),
      {
        loading: "Encrypting message...",
        success: () => {
          formRef.current?.reset();
          return "✅ Message delivered to the stream!";
        },
        error: "❌ Uplink failed. Try again.",
      }
    ).catch((err) => {
      console.error("EmailJS error:", err);
      toast.error("Unexpected system error.");
    });
  };

  return (
    <div className="min-h-screen bg-base-100 selection:bg-primary selection:text-primary-content">
      <Navbar />
      <Toaster position="top-right" />

      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Support Uplink
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-base-content mb-4">
              Get In <span className="text-primary">Touch</span>
            </h2>
            <p className="text-sm font-medium text-base-content/50 italic max-w-lg mx-auto">
              Have a question about the Madollar Tickets? Our engineers are standing by.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Info & Stats */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-8 rounded-[2.5rem] bg-base-200/50 backdrop-blur-3xl border border-base-content/5 shadow-2xl flex-grow">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic text-primary mb-6">
                  Stream Management
                </h3>
                <p className="text-sm leading-relaxed text-base-content/70 mb-8 font-medium">
                  Boost productivity. Improve response time. Our <span className="text-primary">Madollar Tickets System</span> tracks and resolves issues in real-time.
                </p>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Location</p>
                      <p className="text-sm font-bold">Tech Hub, Nairobi, Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Uplink Email</p>
                      <p className="text-sm font-bold">support@madollartickets.com</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <SocialLink href="https://instagram.com"><Instagram className="w-5 h-5" /></SocialLink>
                  <SocialLink href="https://twitter.com"><Twitter className="w-5 h-5" /></SocialLink>
                  <SocialLink href="https://linkedin.com"><Linkedin className="w-5 h-5" /></SocialLink>
                  <SocialLink href="https://github.com"><Github className="w-5 h-5" /></SocialLink>
                </div>
              </div>

              {/* Decorative Card */}
              <div className="hidden lg:block h-48 rounded-[2.5rem] overflow-hidden relative shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80"
                  alt="Support"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-8 md:p-12 rounded-[3rem] bg-base-200/50 backdrop-blur-3xl border border-base-content/5 shadow-2xl">
                <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">Identitity</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <input
                          name="from_name"
                          type="text"
                          placeholder="Full Name"
                          className="input input-bordered w-full h-14 pl-14 rounded-2xl bg-base-100/50 border-base-content/10 focus:border-primary transition-all font-bold placeholder:opacity-30"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">Digital Address</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <input
                          name="from_email"
                          type="email"
                          placeholder="Email Address"
                          className="input input-bordered w-full h-14 pl-14 rounded-2xl bg-base-100/50 border-base-content/10 focus:border-primary transition-all font-bold placeholder:opacity-30"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">Transmission</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-5 top-6 w-4 h-4 text-primary" />
                      <textarea
                        name="message"
                        placeholder="Write your message here..."
                        className="textarea textarea-bordered w-full h-44 pl-14 pt-5 rounded-[2rem] bg-base-100/50 border-base-content/10 focus:border-primary transition-all font-bold placeholder:opacity-30"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-full h-16 rounded-2xl border-none font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:shadow-primary/40 active:scale-95 group"
                  >
                    Transmit Message
                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>

                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

const SocialLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-base-100/50 border border-base-content/5 text-base-content/60 hover:text-primary hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
  >
    {children}
  </a>
);

export default ContactSection;