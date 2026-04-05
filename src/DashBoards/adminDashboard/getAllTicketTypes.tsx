import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  useGetAllTicketTypesQuery,
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useCreateTicketTypeMutation,
} from '../../features/APIS/ticketsType.Api';
import { eventApi } from '../../features/APIS/EventsApi';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Ticket as TicketIcon, 
  Coins, 
  Layers,
  Loader2,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Info,
  Crown,
  Star
} from 'lucide-react';

import type { RootState } from '../../App/store';

export const TicketTypes = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  // API Hooks
  const { data: ticketTypes, isLoading, refetch } = useGetAllTicketTypesQuery({});
  const [deleteTicketType, { isLoading: isDeleting }] = useDeleteTicketTypeMutation();
  const [updateTicketType, { isLoading: isUpdating }] = useUpdateTicketTypeMutation();
  const [createTicketType, { isLoading: isCreating }] = useCreateTicketTypeMutation();
  const { data: allEvents, isLoading: isEventsLoading } = eventApi.useGetAllEventsQuery({});

  // State
  const [eventNames, setEventNames] = useState<Record<number, string>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form states 
  const [editFormData, setEditFormData] = useState({ name: '', price: '', quantity: '', eventId: '', groupSize: '1' });
  const [createFormData, setCreateFormData] = useState({ name: '', price: '', quantity: '', eventId: '', groupSize: '1' });
  
  const [filterText, setFilterText] = useState('');
  const [filterEventId, setFilterEventId] = useState('');

  /**
   * ROBUST HELPER: Detects group size even with typos (0f vs of) 
   * or special terms (couples/pairs/vvip table etc).
   */
  const getGroupSize = (ticket: any) => {
    if (!ticket?.name) return 1;
    
    // Normalize string: lower case and fix the common '0f' typo
    const name = ticket.name.toLowerCase().replace(/0f/g, 'of');
    
    // 1. Check for specific keywords
    if (name.includes('couple') || name.includes('pair')) return 2;
    
    // 2. Match patterns: "group of 5", "pack of 10", "size 4", "vvip table of 8"
    const patternMatch = name.match(/(?:group|pack|size|set|bundle|table|squad|besties)\s*(?:of|for)?\s*(\d+)/);
    if (patternMatch) return Number(patternMatch[1]);

    // 3. Match patterns: "5 people", "5 pax", "5 members"
    const paxMatch = name.match(/(\d+)\s*(?:people|pax|members|person|users)/);
    if (paxMatch) return Number(paxMatch[1]);

    // 4. Fallback to a single number if found (e.g. "Early Bird 5")
    // Note: We ignore numbers in strings like "VIP" or "VVIP" itself
    const fallbackMatch = name.match(/(\d+)/);
    if (fallbackMatch && !name.includes('vvip') && !name.includes('vip')) return Number(fallbackMatch[1]);

    return 1;
  };

  // Selected Event Hook for Capacity Check
  const activeEventId = isCreateModalOpen ? createFormData.eventId : (isEditModalOpen ? editFormData.eventId : null);
  const { data: selectedEventDetails, isFetching: isEventFetching } = eventApi.useGetEventByIdQuery(activeEventId, { skip: !activeEventId });

  // CALCULATE CAPACITY LOGIC
  const capacityStats = useMemo(() => {
    if (!selectedEventDetails) return { remaining: 0, maxGroups: 0, totalImpact: 0 };
    
    const eventMaxCapacity = Number(selectedEventDetails.ticketsTotal || selectedEventDetails.capacity) || 0;
    if (!ticketTypes) return { remaining: eventMaxCapacity, maxGroups: 0, totalImpact: 0 };

    const currentlyAllocated = ticketTypes
      .filter((t: any) => Number(t.eventId) === Number(activeEventId))
      .filter((t: any) => isEditModalOpen ? Number(t.ticketTypeId) !== Number(currentTicket?.ticketTypeId) : true)
      .reduce((sum: number, t: any) => sum + (Number(t.quantity) * getGroupSize(t)), 0);

    const remaining = Math.max(0, eventMaxCapacity - currentlyAllocated);
    
    const currentGroupSize = Number(isEditModalOpen ? editFormData.groupSize : createFormData.groupSize) || 1;
    const currentQty = Number(isEditModalOpen ? editFormData.quantity : createFormData.quantity) || 0;
    
    return {
      remaining,
      maxGroups: Math.floor(remaining / currentGroupSize),
      totalImpact: currentQty * currentGroupSize
    };
  }, [selectedEventDetails, ticketTypes, activeEventId, isEditModalOpen, currentTicket, editFormData, createFormData]);

  // Auth Protection
  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    if (allEvents) {
      const eventsMap: Record<number, string> = {};
      allEvents.forEach((event: any) => {
        eventsMap[event.eventId] = event.title;
      });
      setEventNames(eventsMap);
    }
  }, [allEvents]);

  // Handlers
  const handleDeleteTicketType = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This ticket type will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteTicketType(id).unwrap();
        toast.success("Ticket type deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleEditClick = (ticket: any) => {
    setCurrentTicket(ticket);
    setEditFormData({
      name: ticket.name,
      price: ticket.price.toString(),
      quantity: ticket.quantity.toString(),
      eventId: ticket.eventId.toString(),
      groupSize: getGroupSize(ticket).toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capacityStats.totalImpact > capacityStats.remaining) {
      toast.error(`Exceeds capacity! Only ${capacityStats.remaining} spots left.`);
      return;
    }

    try {
      await updateTicketType({
        id: currentTicket.ticketTypeId,
        name: editFormData.name,
        price: parseFloat(editFormData.price),
        quantity: Number(editFormData.quantity),
        eventId: parseInt(editFormData.eventId),
        groupSize: Number(editFormData.groupSize),
      }).unwrap();
      toast.success("Updated!");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleCreateTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capacityStats.totalImpact > capacityStats.remaining) {
      toast.error(`Capacity error: Only ${capacityStats.remaining} spots available.`);
      return;
    }

    try {
      await createTicketType({
        name: createFormData.name,
        price: parseFloat(createFormData.price),
        quantity: Number(createFormData.quantity),
        eventId: parseInt(createFormData.eventId),
        groupSize: Number(createFormData.groupSize),
      }).unwrap();
      toast.success("Created!");
      setIsCreateModalOpen(false);
      setCreateFormData({ name: '', price: '', quantity: '', eventId: '', groupSize: '1' });
      refetch();
    } catch (err) {
      toast.error("Creation failed");
    }
  };

  const filteredTickets = useMemo(() => {
    return ticketTypes?.filter((ticket: any) => {
      const matchesName = ticket.name.toLowerCase().includes(filterText.toLowerCase());
      const matchesEvent = filterEventId ? Number(ticket.eventId) === Number(filterEventId) : true;
      return matchesName && matchesEvent;
    }) || [];
  }, [ticketTypes, filterText, filterEventId]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-base-100 text-base-content py-10 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-base-200/50 p-6 rounded-[2rem] border border-base-content/5">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <TicketIcon className="text-primary" size={32} />
              TICKET <span className="text-primary">TYPES</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mt-1">Manage Pricing & Availability</p>
          </div>
          <button className="btn btn-primary rounded-2xl font-black uppercase tracking-widest" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} /> New Ticket Type
          </button>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-base-200/30 rounded-[2rem] border border-base-content/5">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 w-4 h-4" />
            <input type="text" placeholder="Search tickets..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="input input-bordered w-full pl-12 rounded-2xl bg-base-100 border-none font-bold text-sm h-12 shadow-sm" />
          </div>
          <select value={filterEventId} onChange={(e) => setFilterEventId(e.target.value)} className="select select-bordered w-full md:w-64 rounded-2xl bg-base-100 border-none font-bold text-sm h-12 shadow-sm">
            <option value="">All Events</option>
            {allEvents?.map((event: any) => <option key={event.eventId} value={event.eventId}>{event.title}</option>)}
          </select>
        </div>

        {isLoading || isEventsLoading ? (
          <div className="flex flex-col items-center py-20 opacity-40"><Loader2 className="animate-spin mb-2" /><p className="font-bold uppercase text-[10px]">Syncing Data...</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {paginatedTickets.map((ticket: any) => {
                  const multiplier = getGroupSize(ticket);
                  const totalSlots = multiplier * Number(ticket.quantity);
                  const isPremium = ticket.name.toLowerCase().includes('vip') || ticket.name.toLowerCase().includes('vvip') || ticket.name.toLowerCase().includes('premium');

                  return (
                    <motion.div key={ticket.ticketTypeId} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-base-200/40 border border-base-content/5 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm group hover:border-primary/30 transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl ${isPremium ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                            {ticket.name.toLowerCase().includes('vvip') ? <Crown size={24} /> : (isPremium ? <Star size={24} /> : <TicketIcon size={24} />)}
                          </div>
                          <span className="text-[10px] font-black opacity-30 italic">#{ticket.ticketTypeId}</span>
                        </div>
                        <h4 className="text-xl font-black uppercase italic leading-tight mb-2 text-primary">{ticket.name}</h4>
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center gap-3 text-sm font-bold opacity-70"><Coins size={16} className="text-success" /><span>Price: <span className="text-base-content font-black">KSh {ticket.price}</span></span></div>
                          <div className="flex items-center gap-3 text-sm font-bold opacity-70"><Layers size={16} className="text-info" /><span>Qty: <span className="text-base-content font-black">{ticket.quantity}</span></span></div>
                          
                          <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                            <Users size={16} className="text-primary" />
                            <span>Total Slots: <span className="text-primary font-black">{totalSlots}</span></span>
                          </div>

                          {multiplier > 1 && (
                             <div className="flex items-center gap-3 text-[10px] font-black bg-primary/5 p-2 rounded-xl border border-primary/10 text-primary uppercase">
                               <Info size={14} />
                               <span>Format: Group of {multiplier}</span>
                             </div>
                          )}
                          <div className="mt-4 pt-4 border-t border-base-content/5">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Linked Event</p>
                            <p className="font-bold capitalize text-sm truncate">{eventNames[ticket.eventId] || 'Unknown Event'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-8">
                        <button onClick={() => handleEditClick(ticket)} className="btn btn-primary btn-sm rounded-xl font-black uppercase text-[10px]"><Edit3 size={14} /> Edit</button>
                        <button onClick={() => handleDeleteTicketType(ticket.ticketTypeId)} disabled={isDeleting} className="btn btn-ghost btn-sm rounded-xl font-black uppercase text-[10px] text-error hover:bg-error hover:text-white">
                          {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <><Trash2 size={14} /> Delete</>}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="btn btn-circle btn-ghost btn-sm disabled:opacity-20"><ChevronLeft size={20} /></button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-xl font-black text-[10px] transition-all ${currentPage === i + 1 ? 'bg-primary text-primary-content scale-110 shadow-lg' : 'bg-base-200 opacity-50 hover:opacity-100'}`}>{i + 1}</button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="btn btn-circle btn-ghost btn-sm disabled:opacity-20"><ChevronRight size={20} /></button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(isEditModalOpen || isCreateModalOpen) && (
          <dialog className="modal modal-open">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal-box bg-base-100 rounded-[2.5rem] p-8 max-w-md border border-base-content/5 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${isEditModalOpen ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}><TicketIcon size={28}/></div>
                <div>
                  <h3 className="font-black text-2xl italic uppercase tracking-tighter">{isEditModalOpen ? 'Update Ticket' : 'Create New'}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {isEventFetching ? <span className="loading loading-spinner loading-xs opacity-40"></span> : (
                      <>
                        <div className={`w-2 h-2 rounded-full ${capacityStats.remaining >= capacityStats.totalImpact ? 'bg-success' : 'bg-error'}`}></div>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Remaining Slots: {capacityStats.remaining}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={isEditModalOpen ? handleUpdateTicketType : handleCreateTicketType} className="space-y-4">
                <div className="form-control">
                  <label className="label text-[10px] font-black uppercase opacity-50">Target Event</label>
                  <select className="select select-bordered w-full rounded-2xl bg-base-200 border-none font-bold" value={isEditModalOpen ? editFormData.eventId : createFormData.eventId} onChange={(e) => isEditModalOpen ? setEditFormData({ ...editFormData, eventId: e.target.value }) : setCreateFormData({ ...createFormData, eventId: e.target.value })} required>
                    <option value="" disabled>Choose an event</option>
                    {allEvents?.map((event: any) => <option key={event.eventId} value={event.eventId}>{event.title}</option>)}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-[10px] font-black uppercase opacity-50">Multiplier (Capacity Count)</label>
                  <select className="select select-bordered w-full rounded-2xl bg-base-200 border-none font-bold" value={isEditModalOpen ? editFormData.groupSize : createFormData.groupSize} onChange={(e) => isEditModalOpen ? setEditFormData({...editFormData, groupSize: e.target.value}) : setCreateFormData({...createFormData, groupSize: e.target.value})}>
                    <optgroup label="Standard">
                        <option value="1">Regular / Single</option>
                        <option value="2">Pair / Couple</option>
                    </optgroup>
                    <optgroup label="Premium/Groups">
                        <option value="3">Besties of 3</option>
                        <option value="4">Squad of 4</option>
                        <option value="5">Group of 5</option>
                        <option value="8">VIP Table of 8</option>
                        <option value="10">VVIP Table of 10</option>
                    </optgroup>
                    <optgroup label="Bulk/Corporate">
                        <option value="20">Pack of 20</option>
                        <option value="50">Pack of 50</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-control">
                   <label className="label text-[10px] font-black uppercase opacity-50">Ticket Quantity</label>
                   <div className="relative">
                      <input type="number" className="input input-bordered w-full rounded-2xl bg-base-200 border-none font-bold pr-24" value={isEditModalOpen ? editFormData.quantity : createFormData.quantity} onChange={(e) => isEditModalOpen ? setEditFormData({ ...editFormData, quantity: e.target.value }) : setCreateFormData({ ...createFormData, quantity: e.target.value })} required />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black opacity-40 uppercase">Max: {capacityStats.maxGroups}</div>
                   </div>
                </div>

                <div className="form-control">
                  <label className="label text-[10px] font-black uppercase opacity-50">Ticket Name</label>
                  <input type="text" className="input input-bordered w-full rounded-2xl bg-base-200 border-none font-bold" value={isEditModalOpen ? editFormData.name : createFormData.name} onChange={(e) => isEditModalOpen ? setEditFormData({ ...editFormData, name: e.target.value }) : setCreateFormData({ ...createFormData, name: e.target.value })} placeholder="e.g. VVIP Table for 10" required />
                </div>

                <div className="form-control">
                    <label className="label text-[10px] font-black uppercase opacity-50">Price (KSh)</label>
                    <input type="number" step="1" className="input input-bordered w-full rounded-2xl bg-base-200 border-none font-bold" value={isEditModalOpen ? editFormData.price : createFormData.price} onChange={(e) => isEditModalOpen ? setEditFormData({ ...editFormData, price: e.target.value }) : setCreateFormData({ ...createFormData, price: e.target.value })} required />
                </div>

                <div className="bg-primary/5 rounded-[1.5rem] p-4 border border-primary/10 space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase opacity-60">
                    <span>Total Slots to be Occupied:</span>
                    <span className={capacityStats.totalImpact > capacityStats.remaining ? 'text-error font-black underline' : 'text-primary font-black'}>
                      {capacityStats.totalImpact}
                    </span>
                  </div>
                </div>

                <div className="modal-action grid grid-cols-2 gap-3 pt-4">
                  <button type="button" className="btn rounded-2xl font-black uppercase bg-base-200 border-none" onClick={() => { setIsEditModalOpen(false); setIsCreateModalOpen(false); }}>Cancel</button>
                  <button type="submit" disabled={isUpdating || isCreating || isEventFetching || (capacityStats.totalImpact > capacityStats.remaining)} className={`btn rounded-2xl font-black uppercase ${isEditModalOpen ? 'btn-warning' : 'btn-success'}`}>
                    {isUpdating || isCreating ? <Loader2 className="animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => { setIsEditModalOpen(false); setIsCreateModalOpen(false); }}></div>
          </dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketTypes;