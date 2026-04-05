import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Mail, 
  RotateCcw, 
  Ticket, 
  Cpu, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert 
} from 'lucide-react';
import PuffLoader from 'react-spinners/PuffLoader';

import { bookingApi } from '../../features/APIS/BookingsApi';
import { userApi } from '../../features/APIS/UserApi';
import { emailApi } from '../../features/APIS/SendngEmails';
import { eventApi } from '../../features/APIS/EventsApi';
import { ticketApi } from '../../features/APIS/ticketsType.Api';

import TicketItem from './TicketsItem';
import type { RootState } from '../../App/store';

interface EnrichedBooking {
  bookingId: number;
  eventName: string;
  ticketType: {
    name: string;
    price: string;
  };
  quantity: number;
  paymentStatus: string;
  createdAt: string;
}

/**
 * -----------------------------------------------------------------------------------------
 * MODAL HANDSHAKE PROTOCOL
 * -----------------------------------------------------------------------------------------
 */
const SecurityModal = Swal.mixin({
  customClass: {
    popup: 'rounded-[2rem] bg-base-100 border border-base-content/10 shadow-2xl backdrop-blur-xl p-8',
    title: 'text-2xl font-black italic uppercase tracking-tighter text-base-content',
    htmlContainer: 'text-sm font-medium opacity-70 py-4',
    confirmButton: 'btn btn-primary px-10 h-14 rounded-2xl font-black italic uppercase tracking-widest shadow-lg shadow-primary/20 mx-2',
    cancelButton: 'btn btn-ghost px-10 h-14 rounded-2xl font-bold opacity-50 mx-2',
  },
  buttonsStyling: false,
  background: 'var(--b1)',
  color: 'var(--bc)',
});

const TicketDisplay: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);

  /**
   * UPDATED: Added pollingInterval: 3000 to refresh booking status every 3 seconds.
   */
  const { data: bookings, isLoading: isBookingsLoading } =
    bookingApi.useGetBookingsByUserNationalIdQuery(nationalId!, { 
      skip: !nationalId,
      pollingInterval: 3000 
    });

  const { data: user, isLoading: isUserLoading } =
    userApi.useGetUserByNationalIdQuery(nationalId!, { skip: !nationalId });

  const { data: events, isLoading: isEventsLoading } = eventApi.useGetAllEventsQuery({});
  const { data: ticketTypes, isLoading: isTicketTypesLoading } = ticketApi.useGetAllTicketTypesQuery({});

  const [sendTicketEmail, { isLoading: isEmailSending }] = emailApi.useSendTicketEmailMutation();

  const [searchEvent, setSearchEvent] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const TICKETS_PER_PAGE = 6;

  const isLoading =
    isBookingsLoading || isUserLoading || isEventsLoading || isTicketTypesLoading;

  const enrichedBookings: EnrichedBooking[] | undefined = bookings?.map((booking) => {
    const event = events?.find((e: any) => e.eventId === booking.eventId);
    const ticketType = ticketTypes?.find((t: any) => t.ticketTypeId === booking.ticketTypeId);

    return {
      bookingId: booking.bookingId,
      eventName: event?.title || 'Unknown Event',
      ticketType: {
        name: ticketType?.name || 'Unknown',
        price: ticketType?.price || '0',
      },
      quantity: booking.quantity,
      paymentStatus: booking.bookingStatus || 'Unknown',
      createdAt: booking.createdAt,
    };
  });

  const filteredBookings = enrichedBookings
    ?.filter((booking) => {
      const matchesEvent = booking.eventName
        .toLowerCase()
        .includes(searchEvent.toLowerCase());
      const matchesDate = searchDate
        ? new Date(booking.createdAt).toISOString().slice(0, 10) === searchDate
        : true;
      return matchesEvent && matchesDate;
    })
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const totalPages = Math.ceil((filteredBookings?.length || 0) / TICKETS_PER_PAGE);

  const paginatedBookings = filteredBookings?.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  const handleSendEmail = async () => {
    if (!filteredBookings || !user) return;

    const result = await SecurityModal.fire({
      title: 'Do you want?',
      text: `Email ticket details sent to ${user.email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'YES',
      cancelButtonText: 'NO'
    });

    if (result.isConfirmed) {
      try {
        await sendTicketEmail({ bookings: filteredBookings, user }).unwrap();
        toast.success('TRANSMISSION SUCCESS: Check your inbox');
      } catch (error) {
        console.error('Error sending email:', error);
        toast.error('SYNC FAILURE: Transmission failed');
      }
    }
  };

  const clearFilters = () => {
    setSearchDate('');
    setSearchEvent('');
    setCurrentPage(1);
    toast.info('FILTER_BUFFER_CLEARED');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 gap-6">
        <PuffLoader size={80} color="oklch(var(--p))" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Loading Tickets...</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center py-20 bg-base-100 px-6">
        <ShieldAlert size={64} className="opacity-10 mb-4" />
        <p className="font-mono text-sm opacity-40 uppercase tracking-[0.4em]">Zero_Entries_Detected_In_Vault</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-7xl mx-auto mt-20 bg-base-100 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-base-content/5 pb-12">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="p-5 bg-primary/10 rounded-[2rem] text-primary shadow-xl shadow-primary/5">
            <Cpu size={36} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Madollar Tickets<span className="text-primary">HUB</span></h1>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-[0.4em]">Digital Id: {nationalId} </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <button
            onClick={handleSendEmail}
            disabled={isEmailSending}
            className={`btn btn-primary h-16 px-10 rounded-[1.5rem] font-black uppercase italic tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto ${isEmailSending ? 'loading' : ''}`}
          >
            <Mail size={18} className="mr-2" />
            {isEmailSending ? 'Syncing...' : 'Email_Tickets'}
          </button>
          
          <button onClick={clearFilters} className="btn btn-ghost h-16 px-8 rounded-[1.5rem] border border-base-content/10 font-bold uppercase text-xs tracking-widest opacity-60 hover:opacity-100 transition-all">
            <RotateCcw size={16} className="mr-2" /> Reset
          </button>
        </div>
      </div>

      {/* --- CONTROL PANEL --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-200/40 p-6 rounded-[2.5rem] border border-base-content/5 backdrop-blur-sm">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-all" size={20} />
          <input
            type="text"
            placeholder="Search Ticket..."
            value={searchEvent}
            onChange={(e) => {
              setSearchEvent(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-bordered h-16 w-full pl-14 rounded-2xl bg-base-100/50 border-base-content/10 focus:ring-1 focus:ring-primary font-bold italic"
          />
        </div>
        <div className="relative group">
          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-all" size={20} />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => {
              setSearchDate(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-bordered h-16 w-full pl-14 rounded-2xl bg-base-100/50 border-base-content/10 focus:ring-1 focus:ring-primary font-black uppercase italic text-xs"
          />
        </div>
      </div>

      {/* --- TICKETS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {paginatedBookings?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-20 text-center bg-base-200/20 rounded-[3rem] border border-dashed border-base-content/5"
            >
              <Ticket size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-mono text-xs opacity-40 uppercase tracking-[0.4em]">Search_Returned_Zero_Results</p>
            </motion.div>
          ) : (
            paginatedBookings?.map((booking) => (
              <motion.div
                key={booking.bookingId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <TicketItem booking={booking} user={user!} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-12 gap-4 p-3 bg-base-200/30 rounded-[2rem] w-fit mx-auto border border-base-content/5">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentPage((p) => Math.max(p - 1, 1));
            }}
            disabled={currentPage === 1}
            className="btn btn-circle btn-ghost disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center px-4 font-mono text-[10px] uppercase tracking-[0.5em] font-black italic opacity-60">
            Page {currentPage} // {totalPages}
          </div>

          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentPage((p) => Math.min(p + 1, totalPages));
            }}
            disabled={currentPage === totalPages}
            className="btn btn-circle btn-ghost disabled:opacity-20 transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketDisplay;