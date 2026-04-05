import { 
  User, 
  LogOut, 
  CreditCard, 
  Ticket, 
  TicketCheck, 
  Home, 
  ShoppingBag, 
  ChevronRight, 
  LayoutGrid,
  Zap
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../features/Auth/AuthSlice";

export const SideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
    onNavItemClick?.();
  };

  const menuItems = [
    { to: "/", label: "Explore Home", icon: <Home size={20} />, color: "text-slate-400" },
    { to: "me", label: "My Profile", icon: <User size={20} />, color: "text-blue-500" },
    { to: "MyBookings", label: "Bookings", icon: <ShoppingBag size={20} />, color: "text-purple-500" },
    { to: "MyTickets", label: "My Tickets", icon: <Ticket size={20} />, color: "text-orange-500" },
    { to: "Payments", label: "My Payments", icon: <CreditCard size={20} />, color: "text-emerald-500" },
    { to: "supportTickets", label: "Help Desk", icon: <TicketCheck size={20} />, color: "text-pink-500" },
  ];

  return (
    /* Changed to w-full to ensure it fills the Sidebar/Drawer container */
    <div className="h-full w-full flex flex-col bg-base-100/95 backdrop-blur-xl border-r border-base-content/5 shadow-2xl relative">
      
      {/* 1. BRANDING SECTION */}
      <div className="w-full p-8 mb-2">
        <div className="flex items-center gap-4 group cursor-pointer w-full">
          <div className="h-14 w-14 flex-shrink-0 bg-gradient-to-br from-primary to-primary-focus rounded-[1.4rem] flex items-center justify-center shadow-xl shadow-primary/30 group-hover:scale-105 transition-all duration-500">
            <LayoutGrid className="text-primary-content" size={28} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className=" font-black tracking-tighter text-base-content leading-none uppercase italic truncate">
              Madollar<span className="text-primary">Tickets</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
              <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em]">Member Portal</p>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-base-content/10 to-transparent mt-8"></div>
      </div>

      {/* 2. NAVIGATION LINKS - Fill available width */}
      <nav className="flex-1 w-full px-4 overflow-y-auto custom-scrollbar">
        <div className="py-4 w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-25 mb-6 ml-4">Account Navigation</p>
          <ul className="space-y-2 w-full">
            {menuItems.map((item) => {
              const isActive = location.pathname.includes(item.to) && item.to !== "/";
              const isHomeActive = location.pathname === "/" && item.to === "/";
              const active = isActive || isHomeActive;

              return (
                <li key={item.to} className="w-full">
                  <Link
                    to={item.to}
                    onClick={onNavItemClick}
                    className={`group flex items-center justify-between w-full p-4 rounded-[1.3rem] transition-all duration-300 ${
                      active 
                        ? "bg-primary text-primary-content shadow-lg shadow-primary/25 translate-x-1" 
                        : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-300 ${
                          active ? "bg-white/20" : "bg-base-200/50 shadow-inner"
                        } ${!active && item.color}`}>
                        {item.icon}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-widest italic truncate">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight 
                      size={14} 
                      className={`flex-shrink-0 transition-all duration-500 ${
                        active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0"
                      }`} 
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 3. FOOTER & LOGOUT - Fully stretched */}
      <div className="w-full p-6 mt-auto space-y-4 pb-2">
        
        {/* Status Card */}
        <div className="group relative overflow-hidden p-5 w-full bg-base-200/50 rounded-[2rem] border border-base-content/5 hover:border-primary/20 transition-colors">
          <div className="relative z-10 flex items-center justify-between w-full">
             <div className="min-w-0">
                <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-0.5">Membership</p>
                <p className="text-xs font-black italic uppercase tracking-tight truncate">VIP Ticket Access</p>
             </div>
             <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap size={14} fill="currentColor" />
             </div>
          </div>
          <Ticket className="absolute -bottom-6 -right-6 opacity-[0.03] text-base-content rotate-12 group-hover:rotate-0 transition-transform duration-1000" size={120} />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-error/10 text-error hover:bg-error hover:text-white transition-all duration-500 font-black uppercase text-[10px] tracking-[0.2em] border border-error/10"
        >
          <LogOut size={18} />
          <span className="truncate">End Session</span>
        </button>

      </div>
    </div>
  );
};