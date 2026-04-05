import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../App/store";
import { clearCredentials } from "../features/Auth/AuthSlice";
import {
  Home,
  Info,
  CalendarDays,
  UserPlus,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Phone,
  Sparkles,
} from "lucide-react";
import Typed from "typed.js";

import "./animate.css"; 
import { ThemeToggle } from "./ThemeToggle";
import { useGetUserByNationalIdQuery } from "../features/APIS/UserApi";

export const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const role = useSelector((state: RootState) => state.auth.role);

  const { data: userData } = useGetUserByNationalIdQuery(nationalId!, { skip: !nationalId });
  const profileImageUrl = userData?.profileImageUrl;

  const getNavLinkClass = (path: string) => 
    location.pathname === path 
      ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--p),0.2)]" 
      : "text-base-content/60 hover:text-primary transition-all";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ["Madollar Tickets", "Book Now.", "Enjoy."],
      typeSpeed: 80,
      backSpeed: 50,
      loop: true,
      showCursor: false,
    });
    return () => typed.destroy();
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        scrolled 
          ? "py-1.5 sm:py-2 bg-base-100/60 backdrop-blur-2xl border-b border-white/10 shadow-2xl" 
          : "py-2 sm:py-4 bg-base-100/20 backdrop-blur-md border-b border-white/5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-1.5 group max-w-[60%] sm:max-w-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform shrink-0">
              <Sparkles className="text-white w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="w-24 sm:w-44 overflow-hidden flex items-center min-h-[32px] sm:min-h-[40px]">
              <span 
                ref={typedRef} 
                className="text-sm sm:text-2xl font-black italic uppercase tracking-tighter text-base-content whitespace-nowrap truncate" 
              />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {[
              { path: "/", label: "Home", icon: Home },
              { path: "/about", label: "About", icon: Info },
              { path: "/events", label: "Events", icon: CalendarDays },
              { path: "/contact", label: "Contact", icon: Phone },
            ].map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-black uppercase tracking-widest italic transition-all ${getNavLinkClass(link.path)}`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="dropdown dropdown-end group">
                <label tabIndex={0} className="relative cursor-pointer block">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-base-100/40 backdrop-blur-xl border border-white/10 p-1 pr-1.5 sm:pr-3 rounded-xl sm:rounded-2xl hover:border-primary/50 transition-all shadow-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden shadow-inner border border-white/5">
                      <img
                        src={profileImageUrl || '/default-avatar.png'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest opacity-70">
                      {firstName}
                    </span>
                    <ChevronDown size={12} className="opacity-40 group-hover:rotate-180 group-hover:text-primary transition-all duration-300" />
                  </div>
                </label>
                <ul tabIndex={0} className="menu dropdown-content mt-2 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-base-100/80 backdrop-blur-3xl rounded-2xl w-60 border border-white/10 z-[110] animate-in fade-in slide-in-from-top-2">
                  <li className="menu-title text-[9px] uppercase tracking-[0.4em] opacity-40 px-4 py-2">Account Management</li>
                  <li>
                    <Link to={role === "admin" ? "/AdminDashBoard/analytics" : "/dashboard"} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors">
                      <LayoutDashboard size={18} className="text-primary" /> 
                      <span className="font-bold uppercase italic text-[11px] tracking-widest">Dashboard</span>
                    </Link>
                  </li>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <li>
                    <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl hover:bg-error/10 text-error transition-colors">
                      <LogOut size={18} /> 
                      <span className="font-bold uppercase italic text-[11px] tracking-widest">Sign Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link to="/login" className="btn btn-primary h-8 min-h-8 sm:h-10 sm:min-h-10 rounded-lg sm:rounded-xl px-3 sm:px-6 font-black uppercase italic tracking-widest border-none shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- FLOATING MOBILE DOCK --- */}
      {/* Reduced bottom from 4 to 2, and padding from p-2 to p-1 for a thinner profile */}
      <div className="lg:hidden fixed bottom-2 left-1/2 -translate-x-1/2 w-[85%] max-w-[340px] z-[100]">
  <div className="relative group">
    {/* Subtle Glow - reduced blur for smaller profile */}
    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 rounded-[1.2rem] blur-lg opacity-30"></div>
    
    <div className="relative bg-base-100/60 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-xl p-0.5 flex justify-around items-center">
      {[
        { path: "/", icon: Home, label: "Home" },
        { path: "/about", icon: Info, label: "About" },
        { path: "/events", icon: CalendarDays, label: "Events" },
        { path: "/contact", icon: Phone, label: "Contact" },
        { path: "/register", icon: UserPlus, label: "Register", hide: isAuthenticated }
      ].map((item) => (
        !item.hide && (
          <Link 
            key={item.path}
            to={item.path} 
            className="relative flex-1 flex flex-col items-center justify-center py-0.5 group/item"
          >
            {/* Reduced icon padding from p-2 to p-1.5 */}
            <div className={`p-1.5 rounded-lg transition-all duration-500 ease-out flex items-center justify-center
              ${location.pathname === item.path 
                ? "bg-primary text-white shadow-md -translate-y-1 scale-105" 
                : "text-base-content/40 group-hover/item:text-primary"
              }`}
            >
              {/* Keeping icon size 18 as requested for readability but in a tighter box */}
              <item.icon size={18} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
            </div>
            
            {location.pathname === item.path && (
              <div className="absolute bottom-0 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
            )}
            
            <span className={`text-[6.5px] font-black uppercase tracking-widest mt-0.5 transition-all duration-300 
              ${location.pathname === item.path ? "opacity-100 text-primary" : "opacity-40"}`}>
              {item.label}
            </span>
          </Link>
        )
      ))}
    </div>
  </div>
</div>
    </>
  );
};