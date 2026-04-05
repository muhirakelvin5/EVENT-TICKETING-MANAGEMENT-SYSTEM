import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import PuffLoader from "react-spinners/PuffLoader";
import { 
  ShieldCheck, 
  Search, 
  CreditCard, 
  Smartphone, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Zap,
  XCircle,
  ArrowRight,
  Calendar,
  Fingerprint
} from "lucide-react";

/**
 * -----------------------------------------------------------------------------------------
 * DATA ARCHITECTURE & API HOOKS
 * -----------------------------------------------------------------------------------------
 */
import {
  useGetBookingsByUserNationalIdQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
} from "../../features/APIS/BookingsApi";

import { eventApi } from "../../features/APIS/EventsApi";
import { ticketApi } from "../../features/APIS/ticketsType.Api";
import { paymentApi } from "../../features/APIS/PaymentApi";
import { mpesaApi } from "../../features/APIS/MpesaApi";

// Interfaces
interface BookingData {
  bookingId: number;
  eventId: number;
  quantity: number;
  totalAmount: string;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  ticketTypeId: number;
  createdAt: string;
}

interface EventData {
  eventId: number;
  title: string;
}

interface TicketTypeData {
  ticketTypeId: number;
  eventId: number; 
  name: string;
  price: number;
}

/**
 * -----------------------------------------------------------------------------------------
 * PREMIUM THEME-AWARE MODAL ENGINE
 * -----------------------------------------------------------------------------------------
 */
const StyledModal = Swal.mixin({
  customClass: {
    popup: "rounded-[2.5rem] bg-base-100 border border-base-300 shadow-2xl backdrop-blur-xl",
    title: "text-2xl font-black text-base-content uppercase tracking-tighter italic pb-4 border-b border-base-300/50 w-full",
    htmlContainer: "text-base-content/70 font-medium py-4",
    confirmButton: "btn btn-primary px-10 mx-2 rounded-2xl font-black italic tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all",
    cancelButton: "btn btn-ghost px-10 mx-2 rounded-2xl font-bold opacity-60 hover:opacity-100 transition-all",
    input: "bg-base-200 border-base-300 rounded-xl text-base-content focus:ring-primary focus:border-primary",
  },
  buttonsStyling: false,
  background: "var(--b1)", 
  color: "var(--bc)",    
  showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
  hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' }
});

const BookingsByNationalId: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [searchNationalId, setSearchNationalId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pollingEventId, setPollingEventId] = useState<number | null>(null);
  const watchdogRef = useRef<any>(null);
  const bookingsPerPage = 8;

  // API Queries
  const { data: bookings, isLoading: isBookingsLoading, refetch: refetchBookings } = 
    useGetBookingsByUserNationalIdQuery(searchNationalId!, { skip: searchNationalId === null });

  const { data: events } = eventApi.useGetAllEventsQuery({});
  const { data: ticketTypes } = ticketApi.useGetAllTicketTypesQuery({});
  
  // Background Sync: Check all payments for this user
  const { data: allPayments } = paymentApi.useGetPaymentsByNationalIdQuery(searchNationalId!, {
    skip: searchNationalId === null,
  });

  const { refetch: refetchPayments } = paymentApi.useGetPaymentsByEventIdQuery(pollingEventId!, {
    skip: pollingEventId === null,
  });

  const [updateBooking] = useUpdateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const [createCheckoutSession] = paymentApi.useCreateCheckoutSessionMutation();
  const [stkPush] = mpesaApi.useInitiateStkPushMutation();

  useEffect(() => {
    if (user?.nationalId) setSearchNationalId(user.nationalId);
  }, [user]);

  /**
   * 🔄 AUTO-REFRESH ENGINE
   * UPDATED: Refreshes the data every 3 seconds to keep status in sync.
   */
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (searchNationalId) {
        refetchBookings();
      }
    }, 3000); // 3 Seconds

    return () => clearInterval(refreshInterval);
  }, [searchNationalId, refetchBookings]);

  /**
   * 🔄 AUTO-SYNC ENGINE
   * Prevents 500 errors by excluding 'createdAt' from the update payload.
   */
  useEffect(() => {
    if (bookings && allPayments) {
      bookings.forEach(async (booking: BookingData) => {
        if (booking.bookingStatus === "Pending") {
          const hasPaid = allPayments.find(
            (p: any) => 
              p.bookingId === booking.bookingId && 
              (p.paymentStatus === "Completed" || p.paymentStatus === "PAID")
          );

          if (hasPaid) {
            await updateBooking({
              bookingId: booking.bookingId,
              body: {
                bookingStatus: "Confirmed",
                quantity: booking.quantity,
                totalAmount: booking.totalAmount,
                ticketTypeId: booking.ticketTypeId,
                eventId: booking.eventId,
                nationalId: user.nationalId,
              }
            }).unwrap();
            refetchBookings();
          }
        }
      });
    }
  }, [bookings, allPayments, updateBooking, user?.nationalId, refetchBookings]);

  const stopWatchdog = () => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
    setPollingEventId(null);
  };

  /**
   * ANALYTICS ENGINE
   */
  const analytics = useMemo(() => {
    const now = new Date();
    const confirmed = (bookings || []).filter((b: BookingData) => b.bookingStatus === "Confirmed");
    const getSum = (list: BookingData[]) => list.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);

    return {
      today: getSum(confirmed.filter(b => new Date(b.createdAt).toDateString() === now.toDateString())),
      week: getSum(confirmed.filter(b => (now.getTime() - new Date(b.createdAt).getTime()) <= 7 * 24 * 60 * 60 * 1000)),
      month: getSum(confirmed.filter(b => new Date(b.createdAt).getMonth() === now.getMonth())),
      total: getSum(confirmed)
    };
  }, [bookings]);

  /**
   * ACTION: SECURE PAYMENT GATEWAY
   */
  const handleSecureCheckout = async (booking: BookingData) => {
    if (!user?.nationalId) return;

    const { value: method } = await StyledModal.fire({
      title: "Gateway Protocol",
      html: `
        <div class="grid grid-cols-1 gap-4 p-4">
          <div id="pay-mpesa" class="flex items-center justify-between p-5 rounded-3xl border-2 border-primary/20 bg-primary/5 hover:border-primary cursor-pointer transition-all group">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-primary rounded-2xl text-white shadow-lg"><Smartphone size={24}/></div>
              <div class="text-left">
                <p class="font-black text-base-content italic uppercase text-sm">M-Pesa Express</p>
                <p class="text-[10px] opacity-50 font-bold uppercase tracking-widest">Instant STK Push</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-all"/>
          </div>
          <div id="pay-stripe" class="flex items-center justify-between p-5 rounded-3xl border-2 border-base-300 bg-base-200/50 hover:border-blue-500 cursor-pointer transition-all group">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><CreditCard size={24}/></div>
              <div class="text-left">
                <p class="font-black text-base-content italic uppercase text-sm">Global Card</p>
                <p class="text-[10px] opacity-50 font-bold uppercase tracking-widest">Visa / Mastercard</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all"/>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      didOpen: () => {
        document.getElementById('pay-mpesa')?.addEventListener('click', () => Swal.clickConfirm());
        document.getElementById('pay-stripe')?.addEventListener('click', () => {
          (Swal as any).getPopup().setAttribute('data-method', 'stripe');
          Swal.clickConfirm();
        });
      },
      preConfirm: () => (Swal as any).getPopup().getAttribute('data-method') === 'stripe' ? 'stripe' : 'mpesa'
    });

    if (!method) return;

    if (method === "mpesa") {
      const { value: phone } = await StyledModal.fire({
        title: "Validation",
        input: "text",
        inputValue: user?.phone || "254",
        confirmButtonText: "Push Prompt",
        inputValidator: (v) => (!v || v.length < 10) && "Invalid Protocol"
      });

      if (!phone) return;

      StyledModal.fire({
        title: "Encrypted Handshake",
        html: `
          <div class="flex flex-col items-center gap-6 py-8">
            <div class="relative"><div class="absolute inset-0 animate-ping bg-primary/20 rounded-full"></div>
            <div class="relative z-10 bg-base-300 p-8 rounded-full border border-base-300 shadow-inner">
               <Fingerprint size={40} className="text-primary animate-pulse" />
            </div></div>
            <p class="text-base-content font-black text-xl italic uppercase">Awaiting PIN...</p>
            <button id="cancel-watchdog" class="btn btn-outline btn-error btn-xs rounded-xl px-6 font-black italic">Terminate Sync</button>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          stkPush({ phoneNumber: phone, amount: Math.round(Number(booking.totalAmount)), bookingId: booking.bookingId, nationalId: Number(user.nationalId) }).unwrap();
          setPollingEventId(booking.eventId);
          document.getElementById('cancel-watchdog')?.addEventListener('click', () => { stopWatchdog(); Swal.close(); });
        },
      });

      watchdogRef.current = setInterval(async () => {
        const { data: pool } = await refetchPayments();
        const verified = pool?.find((p: any) => p.bookingId === booking.bookingId && (p.paymentStatus === "Completed" || p.paymentStatus === "PAID"));
        
        if (verified) {
          stopWatchdog();
          await updateBooking({ 
            bookingId: booking.bookingId, 
            body: { 
                bookingStatus: "Confirmed",
                quantity: booking.quantity,
                totalAmount: booking.totalAmount,
                ticketTypeId: booking.ticketTypeId,
                eventId: booking.eventId,
                nationalId: user.nationalId
            } 
          }).unwrap();
          Swal.close();
          StyledModal.fire({ title: "Registry Verified", icon: "success", timer: 2000, showConfirmButton: false });
          refetchBookings();
        }
      }, 3000);

      setTimeout(() => { if (watchdogRef.current) { stopWatchdog(); if (Swal.isVisible()) Swal.close(); }}, 120000);
    } else {
      try {
        const session = await createCheckoutSession({ amount: Math.round(Number(booking.totalAmount) * 100), nationalId: Number(user.nationalId), bookingId: booking.bookingId, currency: "kes", successUrl: `${window.location.origin}/success`, cancelUrl: `${window.location.origin}/cancel` }).unwrap();
        if (session.url) window.location.href = session.url;
      } catch { StyledModal.fire("Error", "Stripe Protocol Fail", "error"); }
    }
  };

  /**
   * ACTION: MODIFY
   */
  const handleModify = async (booking: BookingData) => {
    const tiers = (ticketTypes as TicketTypeData[])?.filter(t => t.eventId === booking.eventId) || [];
    const tierOpts = tiers.map(t => `<option value="${t.ticketTypeId}" ${t.ticketTypeId === booking.ticketTypeId ? 'selected' : ''}>${t.name}</option>`).join("");

    const { value: result } = await StyledModal.fire({
      title: "Sync Updates",
      html: `<div class="flex flex-col gap-4 text-left p-4">
          <div><label class="text-[9px] font-black uppercase text-primary tracking-widest mb-2 block">Tier</label><select id="s-tier" class="select select-bordered w-full">${tierOpts}</select></div>
          <div><label class="text-[9px] font-black uppercase text-primary tracking-widest mb-2 block">Qty</label><input id="s-qty" type="number" min="1" value="${booking.quantity}" class="input input-bordered w-full"></div>
        </div>`,
      showCancelButton: true,
      preConfirm: () => ({ tier: Number((document.getElementById('s-tier') as any).value), qty: Number((document.getElementById('s-qty') as any).value) })
    });

    if (result) {
      const selected = tiers.find(t => t.ticketTypeId === result.tier);
      await updateBooking({ 
        bookingId: booking.bookingId, 
        body: { 
          bookingStatus: booking.bookingStatus, 
          quantity: result.qty, 
          ticketTypeId: result.tier, 
          totalAmount: ((selected?.price || 0) * result.qty).toFixed(2), 
          eventId: booking.eventId,
          nationalId: user.nationalId 
        } 
      }).unwrap();
      StyledModal.fire({ title: "Updated", icon: "success", timer: 1500 });
    }
  };

  /**
   * ACTION: CANCEL
   */
  const handleCancel = async (bookingId: number) => {
    const { isConfirmed } = await StyledModal.fire({
      title: "Purge Record?",
      text: "This will permanently terminate this booking index.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Terminate",
      confirmButtonColor: "#ef4444"
    });

    if (isConfirmed) {
      await cancelBooking(bookingId).unwrap();
      StyledModal.fire({ title: "Terminated", icon: "success", timer: 1500 });
      refetchBookings();
    }
  };

  const filtered = useMemo(() => {
    return (bookings || [])
      .filter((b: BookingData) => events?.find((e: EventData) => e.eventId === b.eventId)?.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, events, searchTerm]);

  const paged = filtered.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);
  const totalPages = Math.ceil(filtered.length / bookingsPerPage);

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-12 mt-16 relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-base-300 pb-10">
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
             </div>
             <h1 className="text-5xl font-black tracking-tighter italic uppercase">
                My <span className="text-primary opacity-80">Bookings</span>
             </h1>
          </div>
          <div className="relative w-full lg:max-w-md group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-all" size={20} />
             <input type="text" placeholder="FILTER_INDEX..." className="input input-bordered w-full h-16 pl-14 bg-base-200/50 border-base-300 font-mono text-[10px] tracking-widest focus:ring-1 focus:ring-primary transition-all" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: "Paid today", value: analytics.today, icon: <Zap size={18}/>, color: "text-yellow-500" },
             { label: "Paid this week", value: analytics.week, icon: <TrendingUp size={18}/>, color: "text-blue-500" },
             { label: "Paid This Month", value: analytics.month, icon: <Calendar size={18}/>, color: "text-purple-500" },
             { label: "Total Paid", value: analytics.total, icon: <ShieldCheck size={18}/>, color: "text-success" }
           ].map((stat, i) => (
             <div key={i} className="p-6 rounded-[2rem] bg-base-200/50 border border-base-300/50 flex flex-col gap-2 group hover:border-primary/50 transition-all">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black uppercase text-base-content/40 tracking-widest">{stat.label}</span>
                   <div className={`${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`}>{stat.icon}</div>
                </div>
                <div className="text-2xl font-black italic uppercase tracking-tighter"><span className="text-xs opacity-30 mr-1">KSH</span>{stat.value.toLocaleString()}</div>
             </div>
           ))}
        </div>

        {/* TABLE */}
        <div className="p-[2px] rounded-[3rem] bg-gradient-to-br from-primary via-purple-600 to-blue-500 shadow-2xl overflow-hidden">
           <div className="rounded-[2.9rem] bg-base-100 p-8">
             {isBookingsLoading ? (
               <div className="flex flex-col items-center justify-center py-40 gap-6">
                  <PuffLoader color="#3b82f6" size={80} />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Scanning Bio-Grid</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                  <table className="table w-full border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-[10px] font-black uppercase text-base-content/40 tracking-[0.4em] border-none">
                        <th className="bg-transparent pl-8">Booking Id</th>
                        <th className="bg-transparent">Event Name</th>
                        <th className="bg-transparent text-center">Ticket Type</th>
                        <th className="bg-transparent text-right">Quantity</th>
                        <th className="bg-transparent text-right">Amount Paid</th>
                        <th className="bg-transparent text-center">Status</th>
                        <th className="bg-transparent text-right pr-8">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((b) => {
                        const event = events?.find((x: EventData) => x.eventId === b.eventId);
                        const tier = (ticketTypes as TicketTypeData[])?.find(x => x.ticketTypeId === b.ticketTypeId);
                        return (
                          <tr key={b.bookingId} className="bg-base-200/40 hover:bg-base-200 transition-all rounded-[2rem] border-none group/row">
                            <td className="rounded-l-[2rem] pl-8"><span className="font-mono text-[10px] opacity-30 group-hover/row:text-primary transition-all">#{b.bookingId}</span></td>
                            <td className="py-6 font-black italic text-base-content text-[15px] uppercase tracking-tight">{event?.title || "PROTOCOL_ERR"}</td>
                            <td className="text-center"><span className="badge badge-primary border-none font-black text-[9px] px-4 py-3 rounded-lg uppercase italic">{tier?.name || "STD"}</span></td>
                            <td className="text-right font-black italic opacity-60">{b.quantity}</td>
                            <td className="text-right"><div className="text-success font-black text-[16px] italic">KSH {Number(b.totalAmount).toLocaleString()}</div></td>
                            <td className="text-center">
                              <div className={`badge badge-sm font-black text-[9px] border-none px-4 py-3 rounded-full uppercase italic ${
                                b.bookingStatus === 'Confirmed' ? 'bg-success/10 text-success' : b.bookingStatus === 'Cancelled' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                              }`}>
                                {b.bookingStatus}
                              </div>
                            </td>
                            <td className="rounded-r-[2rem] pr-8 text-right">
                              <div className="flex justify-end gap-3 transition-all duration-300">
                                {b.bookingStatus === 'Pending' ? (
                                  <>
                                    <button onClick={() => handleModify(b)} className="btn btn-ghost btn-circle btn-sm text-warning hover:bg-warning/10 transition-colors"><Edit3 size={16}/></button>
                                    <button onClick={() => handleCancel(b.bookingId)} className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10 transition-colors"><Trash2 size={16}/></button>
                                    <button onClick={() => handleSecureCheckout(b)} className="btn btn-primary btn-sm rounded-xl font-black text-[9px] px-6 uppercase italic tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Authorize</button>
                                  </>
                                ) : (
                                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${b.bookingStatus === 'Cancelled' ? 'text-error/60 bg-error/5' : 'text-success/60 bg-success/5'}`}>
                                    {b.bookingStatus === 'Cancelled' ? <XCircle size={14}/> : <CheckCircle size={14}/>} 
                                    <span className="text-[9px] font-black uppercase tracking-widest">Locked</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
             )}

             {/* PAGINATION */}
             {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between p-6 bg-base-200/50 rounded-[2rem] border border-base-300/30">
                   <div className="text-[9px] font-black text-base-content/40 uppercase tracking-[0.3em]">Page <span className="text-primary">{currentPage}</span> / {totalPages}</div>
                   <div className="flex gap-2">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="btn btn-ghost btn-sm rounded-xl"><ChevronLeft size={18}/></button>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="btn btn-ghost btn-sm rounded-xl"><ChevronRight size={18}/></button>
                   </div>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsByNationalId;