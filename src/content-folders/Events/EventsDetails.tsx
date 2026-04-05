import { useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  LogIn, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  X,
  Sparkles,
  ChevronRight,
  Frown
} from "lucide-react";
import dayjs from "dayjs";
import { eventApi } from "../../features/APIS/EventsApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../App/store";
import { mediaApi } from "../../features/APIS/mediaApi";

type Venue = {
  name: string;
  address: string;
  capacity: number;
};

type EventDetails = {
  eventId: number;
  title: string;
  description?: string;
  venue?: Venue;
  category?: string;
  date: string;
  time: string;
  ticketPrice: number | string;
  ticketsTotal: number;
  ticketsSold: number;
};

const getEventStatus = (event: EventDetails) => {
  const eventDateTime = dayjs(`${event.date} ${event.time}`);
  const now = dayjs();
  if (eventDateTime.isBefore(now)) return "past";
  if (eventDateTime.isSame(now, "day")) return "ongoing";
  return "upcoming";
};

const EventCard = ({
  event,
  isAuthenticated,
  navigate,
}: {
  event: EventDetails;
  isAuthenticated: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const { data: media = [] } = mediaApi.useGetMediaByEventIdQuery(event.eventId);
  const firstImageUrl = media.length > 0 ? media[0].url : null;
  const price = parseFloat(event.ticketPrice as string);
  const status = getEventStatus(event);
  const isPast = status === "past";
  
  const statusText = status === "past" ? "Event Ended" : status === "ongoing" ? "Ongoing" : "Upcoming";
  const statusColor = status === "past" ? "bg-base-300 text-base-content" : status === "ongoing" ? "bg-warning text-black animate-pulse" : "bg-success text-black";

  return (
    <div className="group relative rounded-[2.5rem] p-[1px] bg-gradient-to-b from-base-content/10 to-transparent hover:from-primary/40 transition-all duration-500 h-full">
      <div className="flex flex-col h-full bg-base-200/40 dark:bg-black/40 backdrop-blur-3xl rounded-[2.4rem] overflow-hidden border border-base-content/5 shadow-2xl">
        <figure className="relative h-52 overflow-hidden m-3 rounded-[2rem]">
          {firstImageUrl ? (
            <img src={firstImageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-base-300/20 italic text-base-content/20 font-black uppercase tracking-widest text-[10px]">Visual Pending</div>
          )}
          <div className="absolute top-4 right-4 px-4 py-2 rounded-2xl bg-base-100/80 dark:bg-black/60 backdrop-blur-xl border border-base-content/10 text-primary font-black text-[10px] tracking-widest shadow-xl">
            KSH{isNaN(price) ? "0.00" : price.toFixed(2)}
          </div>
          <div className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-xl border backdrop-blur-md text-[9px] font-black uppercase tracking-widest shadow-lg ${statusColor}`}>
            {statusText}
          </div>
        </figure>

        <div className="p-8 pt-2 flex flex-col flex-grow">
          <h3 className="text-2xl font-black tracking-tighter uppercase italic text-primary leading-none mb-3">{event.title}</h3>
          <p className="text-xs font-medium text-base-content/60 line-clamp-2 italic mb-6 leading-relaxed">{event.description || "No description available."}</p>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-base-100/50 dark:bg-white/5 border border-base-content/5 mb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary/70"><Calendar className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">Date</span></div>
              <span className="text-[10px] font-bold text-base-content">{event.date}</span>
            </div>
            <div className="flex flex-col gap-1"><div className="flex items-center gap-2 text-primary/70"><Clock className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">Time</span></div>
              <span className="text-[10px] font-bold text-base-content">{event.time}</span>
            </div>
            <div className="flex flex-col gap-1 pt-2 border-t border-base-content/5 col-span-2">
              <div className="flex items-center gap-2 text-accent"><MapPin className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">Venue</span></div>
              <span className="text-[10px] font-bold truncate text-base-content italic">{event.venue?.name || "N/A"}</span>
            </div>
          </div>

          <div className="mt-auto">
            {isAuthenticated ? (
              <button onClick={() => !isPast && navigate(`/events/${event.eventId}`)} className={`btn w-full rounded-2xl border-none h-14 font-black uppercase text-[10px] tracking-[0.3em] transition-all duration-300 shadow-xl ${isPast ? "btn-disabled bg-base-300/50" : "btn-primary hover:shadow-primary/40"}`} disabled={isPast}>
                <ShoppingCart className="w-4 h-4 mr-2" /> {isPast ? "Event Ended" : "Book Ticket"}
              </button>
            ) : (
              <a href="/login" className="btn btn-primary w-full rounded-2xl border-none h-14 font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:shadow-primary/40 flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" /> Sign in to Book
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EventDetailsPage = () => {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { data: allEvents = [], isLoading, error } = eventApi.useGetAllEventsQuery(undefined);

  // Dynamic Categories from Data
  const categories = useMemo(() => {
    const cats = allEvents.map((e: EventDetails) => e.category).filter(Boolean);
    return ["All", ...Array.from(new Set(cats))];
  }, [allEvents]);

  // Filtering Logic
  const eventsToDisplay = useMemo(() => {
    return allEvents.filter((e: EventDetails) => {
      const matchesTitle = e.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
      return matchesTitle && matchesCategory;
    });
  }, [allEvents, searchTitle, selectedCategory]);

  const ongoingEvents = eventsToDisplay.filter((e: EventDetails) => getEventStatus(e) === "ongoing");
  const upcomingEvents = eventsToDisplay.filter((e: EventDetails) => getEventStatus(e) === "upcoming");
  const pastEvents = eventsToDisplay.filter((e: EventDetails) => getEventStatus(e) === "past");

  return (
    <section className="relative min-h-screen py-24 px-4 sm:px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6"><Sparkles className="w-3 h-3" /> Live Feed</div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-base-content mb-4">Browse <span className="text-primary">Events</span></h2>
        </div>

        {/* SEARCH & CATEGORY SELECTOR */}
        <div className="max-w-4xl mx-auto mb-20 space-y-6">
          <div className="relative group p-1 rounded-[2.5rem] bg-gradient-to-r from-primary/20 to-accent/20">
            <div className="flex items-center bg-base-100 dark:bg-primary rounded-[2.4rem] overflow-hidden px-6">
              <Search className="w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search events by title..."
                className="w-full bg-transparent p-6 text-sm font-bold focus:outline-none text-base-content"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
              {searchTitle && (
                <button onClick={() => setSearchTitle("")} className="p-2 hover:bg-base-200 rounded-full transition-colors"><X className="w-4 h-4 text-error" /></button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 
                  ${selectedCategory === cat 
                    ? "bg-primary border-primary text-primary-content shadow-lg shadow-primary/30 scale-105" 
                    : "bg-base-200 border-transparent text-base-content/40 hover:border-base-content/20"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEED CONTENT */}
        {error ? (
          <div className="text-error text-center font-black uppercase tracking-widest bg-error/10 p-12 rounded-[3rem] border border-error/20">System Error: Failed to sync feed.</div>
        ) : isLoading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <PuffLoader color="oklch(var(--p))" size={80} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Syncing Stream</span>
          </div>
        ) : eventsToDisplay.length === 0 ? (
          /* NOT AVAILABLE STATE */
          <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-base-content/10 rounded-[4rem] text-center space-y-4">
             <div className="p-6 rounded-full bg-base-200"><Frown className="w-12 h-12 text-base-content/20" /></div>
             <h3 className="text-2xl font-black uppercase italic text-base-content/40 tracking-tighter">Event Not Available</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/20 max-w-xs leading-relaxed">We couldn't find any events matching your current search or category filter.</p>
             <button onClick={() => { setSearchTitle(""); setSelectedCategory("All"); }} className="btn btn-sm btn-ghost text-primary font-black uppercase tracking-widest text-[9px]">Clear All Filters</button>
          </div>
        ) : (
          <div className="space-y-32">
            {ongoingEvents.length > 0 && (
              <section>
                <SectionLabel title="Ongoing Events" subtitle="Happening right now." color="text-warning" />
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {ongoingEvents.map((event: EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}
            
            {upcomingEvents.length > 0 && (
              <section>
                <SectionLabel title="Upcoming Events" subtitle="Secure your spot." color="text-success" />
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event: EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}

            {pastEvents.length > 0 && (
              <section className="opacity-60 grayscale-[0.5]">
                <SectionLabel title="Archive" subtitle="Past legends." color="text-base-content/50" />
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event: EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const SectionLabel = ({ title, subtitle, color }: { title: string; subtitle: string; color: string }) => (
  <div className="mb-12 border-l-4 border-current pl-6">
    <h3 className={`text-3xl font-black uppercase italic tracking-tighter ${color}`}>{title}</h3>
    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{subtitle}</p>
  </div>
);