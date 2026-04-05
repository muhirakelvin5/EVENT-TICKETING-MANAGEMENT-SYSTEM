import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  Users,
  ClipboardList,
  User,
  LogOut,
  DollarSign,
  Ticket,
  Camera,
  Calendar,
  FileText,
  House,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../features/Auth/AuthSlice";

// Organized by Operational Flow: Venue -> Event -> Media -> Ticket Types
const navSections = [
  {
    label: "Overview",
    items: [
      { name: "Analytics", path: "analytics", icon: <TrendingUp size={20} className="text-indigo-400" /> },
    ]
  },
  {
    label: "Event Pipeline",
    items: [
      { name: "Manage Venues", path: "Allvenues", icon: <House size={20} className="text-green-400" /> },
      { name: "Manage Events", path: "AllEvents", icon: <Calendar size={20} className="text-orange-400" /> },
      { name: "Manage Medias", path: "AllMedia", icon: <Camera size={20} className="text-yellow-400" /> },
      { name: "Ticket Types", path: "ticketTypes", icon: <FileText size={20} className="text-teal-400" /> },
    ]
  },
  {
    label: "Administration",
    items: [
      { name: "Manage Users", path: "AllUsers", icon: <Users size={20} className="text-blue-400" /> },
      { name: "Manage Bookings", path: "AllBookings", icon: <ClipboardList size={20} className="text-pink-500" /> },
      { name: "Manage Payments", path: "AllPayments", icon: <DollarSign size={20} className="text-emerald-500" /> },
      { name: "Support Tickets", path: "supportTickets", icon: <Ticket size={20} className="text-purple-400" /> },
    ]
  },
  {
    label: "Reports & Profile",
    items: [
      { name: "Sales Report", path: "SalesReports", icon: <LayoutDashboard size={20} className="text-red-400" /> },
      { name: "My Profile", path: "adminprofile", icon: <User size={20} className="text-indigo-500" /> },
    ]
  }
];

export const AdminSideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearCredentials());
    onNavItemClick?.();
  };

  return (
    <div className="flex flex-col h-full bg-base-200/50 backdrop-blur-md">
      {/* Header / Branding */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary rounded-xl text-primary-content shadow-lg shadow-primary/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none">
              Admin <span className="text-primary">Panel</span>
            </h4>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">System Flow</p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-base-content/10 to-transparent mt-6"></div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-2">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={onNavItemClick}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                      isActive 
                      ? "bg-primary text-primary-content shadow-lg shadow-primary/20" 
                      : "hover:bg-base-300 text-base-content/70 hover:text-base-content"
                    }`
                  }
                >
                  <div className="flex items-center gap-4">
                    <span className="p-2 rounded-lg bg-base-100 shadow-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="font-bold text-sm tracking-wide">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-6 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-error/10 text-error hover:bg-error hover:text-white transition-all duration-300 font-black uppercase text-xs tracking-widest border border-error/20"
        >
          <LogOut size={18} />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );
};