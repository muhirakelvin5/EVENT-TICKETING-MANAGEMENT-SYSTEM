import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { FaUsers } from 'react-icons/fa';
import { GiPartyPopper } from 'react-icons/gi';
import { MdLocationCity, MdTrendingUp, MdEventAvailable, MdBarChart, MdPayments } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { PuffLoader } from 'react-spinners';
import { userApi } from '../../features/APIS/UserApi';
import { eventApi } from '../../features/APIS/EventsApi';
import { paymentApi } from '../../features/APIS/PaymentApi'; // ✅ Added Payment API
import type { RootState } from '../../App/store';

interface EventData {
  date: string;
  venue?: { name: string };
  category?: string;
  attendance?: number;
}

const cardVariants = {
  hover: { y: -5, transition: { duration: 0.3 } },
  tap: { scale: 0.98 },
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6699', '#33CCFF'];

const getDailyCounts = (items: { createdAt: string }[], days = 7) => {
  const counts: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    counts[dayKey] = 0;
  }
  items.forEach((item) => {
    const dayKey = item.createdAt.slice(0, 10);
    if (dayKey in counts) counts[dayKey]++;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getHourlyCounts = (items: { createdAt: string }[]) => {
  const now = new Date();
  const counts: Record<string, number> = {};
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(now.getHours() - i, 0, 0, 0);
    const hourKey = d.toISOString().slice(0, 13);
    counts[hourKey] = 0;
  }
  items.forEach((item) => {
    const hourKey = item.createdAt.slice(0, 13);
    if (hourKey in counts) counts[hourKey]++;
  });
  return Object.entries(counts).map(([key, value]) => ({
    name: key.split('T')[1] + ':00',
    value,
  }));
};

const isWithinRange = (dateStr: string, start: Date, end: Date): boolean => {
  const date = new Date(dateStr);
  return date >= start && date <= end;
};

export const Analytics = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data: users = [], isLoading: usersLoading } = userApi.useGetAllUsersProfilesQuery({ skip: !isAuthenticated });
  const { data: events = [], isLoading: eventsLoading } = eventApi.useGetAllEventsQuery({ skip: !isAuthenticated });
  const { data: payments = [], isLoading: paymentsLoading } = paymentApi.useGetAllPaymentsQuery({ skip: !isAuthenticated }); // ✅ Fetch Payments

  const usersCount = users.length;
  const eventsCount = events.length;
  const totalPaymentsCount = payments.length; // ✅ Total payments for global reach

  const venueBookingFrequency: Record<string, number> = {};
  events.forEach((event: EventData) => {
    const venueName = event.venue?.name || 'Unknown Venue';
    venueBookingFrequency[venueName] = (venueBookingFrequency[venueName] || 0) + 1;
  });

  const venuesCount = Object.keys(venueBookingFrequency).length;
  const averageBookingsPerVenue = venuesCount > 0 ? (eventsCount / venuesCount).toFixed(1) : '0';

  const topVenues = Object.entries(venueBookingFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const eventTypeFrequency: Record<string, number> = {};
  events.forEach((event: EventData) => {
    const type = event.category || 'Unknown';
    eventTypeFrequency[type] = (eventTypeFrequency[type] || 0) + 1;
  });

  const popularEventTypes = Object.entries(eventTypeFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const weeklyEvents = events.filter((event: EventData) =>
    isWithinRange(event.date, startOfWeek, endOfWeek)
  ).length;

  const monthlyEvents = events.filter((event: EventData) =>
    isWithinRange(event.date, startOfMonth, endOfMonth)
  ).length;

  const userDailyData = getDailyCounts(users, 7);
  const userHourlyData = getHourlyCounts(users);

  const pieData = [
    { name: 'Users', value: usersCount },
    { name: 'Events', value: eventsCount },
    { name: 'Venues', value: venuesCount },
  ];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning, Admin ${user?.firstName || 'Gakenye'}!`;
    if (hour < 18) return `Good Afternoon, Admin ${user?.firstName || 'Gakenye'}!`;
    return `Good Evening, Admin ${user?.firstName || 'Gakenye'}!`;
  })();

  return (
    <div className="min-h-screen bg-base-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-200/50 backdrop-blur-xl p-8 rounded-[2rem] border border-base-content/5 shadow-xl relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-2xl md:text-4xl font-black text-base-content italic uppercase tracking-tighter">
              {greeting}
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 mt-2">System Analytics & Insights</p>
          </div>
          <div className="flex items-center gap-4 z-10">
             <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <MdTrendingUp className="text-primary" size={24} />
             </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
        </div>

        {/* --- Summary Cards Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <FaUsers size={28} />, label: 'Total Users', count: usersCount, loading: usersLoading, color: "text-blue-500" },
            { icon: <MdLocationCity size={28} />, label: 'Total Venues', count: venuesCount, loading: eventsLoading, color: "text-emerald-500" },
            { icon: <GiPartyPopper size={28} />, label: 'Live Events', count: eventsCount, loading: eventsLoading, color: "text-purple-500" },
            { icon: <MdBarChart size={28} />, label: 'Avg Bookings', count: averageBookingsPerVenue, loading: false, color: "text-orange-500" },
            { icon: <MdEventAvailable size={28} />, label: 'Events (Weekly)', count: weeklyEvents, loading: eventsLoading, color: "text-pink-500" },
            { icon: <MdPayments size={28} />, label: 'Total Payments', count: totalPaymentsCount, loading: paymentsLoading, color: "text-primary" },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-base-200/40 backdrop-blur-md p-6 rounded-[2rem] border border-base-content/5 shadow-lg flex items-center gap-6 group hover:bg-base-100 transition-colors"
            >
              {card.loading ? (
                <div className="w-full flex justify-center py-4"><PuffLoader color="hsl(var(--p))" size={30} /></div>
              ) : (
                <>
                  <div className={`h-14 w-14 rounded-2xl bg-base-100 flex items-center justify-center shadow-inner border border-base-content/5 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{card.label}</h2>
                    <p className="text-3xl font-black italic tracking-tighter text-base-content">{card.count}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* --- Main Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-base-200/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-base-content/5 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-8">Asset Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60} paddingAngle={5} stroke="none">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-base-200/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-base-content/5 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-8">User Growth (7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userDailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#FF8042" strokeWidth={4} dot={{ r: 6, fill: '#FF8042' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-base-200/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-base-content/5 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-8">Popular Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularEventTypes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-base-200/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-base-content/5 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-8">High Performance Venues</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVenues}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Global Reach Section (Updated to use Payments) --- */}
        <div className="bg-primary/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-primary/10 shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-primary">Global Users Reached (Payments)</h2>
            {paymentsLoading ? (
              <div className="flex justify-center mt-4"><PuffLoader color="hsl(var(--p))" size={40} /></div>
            ) : (
              <p className="text-6xl font-black italic tracking-tighter text-base-content mt-2">
                {totalPaymentsCount.toLocaleString()}
              </p>
            )}
          </div>
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 blur-[100px] rounded-full" />
        </div>
      </div>
    </div>
  );
};