import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { paymentApi } from '../../features/APIS/PaymentApi';
import { eventApi } from '../../features/APIS/EventsApi'; 
import type { RootState } from '../../App/store';

const GetPaymentsByNationalId: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);

  // 📥 Fetch Payments
  const {
    data: payments,
    isLoading,
    isError,
    error,
  } = paymentApi.useGetPaymentsByNationalIdQuery(nationalId, {
    skip: !nationalId,
  });

  // 📥 Fetch Events to map IDs to Names
  const { data: allEvents } = eventApi.useGetAllEventsQuery(undefined);

  // 🧠 Create an Event Name Lookup Map
  const eventMap = useMemo(() => {
    if (!allEvents) return {};
    return allEvents.reduce((acc: any, event: any) => {
      acc[event.eventId] = event.title;
      return acc;
    }, {});
  }, [allEvents]);

  // 📊 Analytics Calculations (Today, Week, Month, Year)
  const stats = useMemo(() => {
    if (!payments) return { today: 0, week: 0, month: 0, year: 0 };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const curr = new Date();
    const first = curr.getDate() - curr.getDay();
    const startOfWeek = new Date(curr.setDate(first)).setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    return payments.reduce((acc: any, p: any) => {
      const pDate = new Date(p.paymentDate).getTime();
      const pAmount = parseFloat(p.amount);

      // Include both 'Completed' and 'PAID' as successful states
      if (p.paymentStatus === 'Completed' || p.paymentStatus === 'PAID') {
        if (pDate >= startOfToday) acc.today += pAmount;
        if (pDate >= startOfWeek) acc.week += pAmount;
        if (pDate >= startOfMonth) acc.month += pAmount;
        if (pDate >= startOfYear) acc.year += pAmount;
      }
      return acc;
    }, { today: 0, week: 0, month: 0, year: 0 });
  }, [payments]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string>('All');

  const paymentsPerPage = 10;

  // ✅ Filter payments by status
  const filteredPayments = payments
    ? payments.filter((p: any) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Completed') return p.paymentStatus === 'Completed' || p.paymentStatus === 'PAID';
        if (statusFilter === 'Pending') return p.paymentStatus === 'Pending';
        return false;
      })
    : [];

  // ✅ Sort from latest to oldest
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // ✅ Paginate
  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = sortedPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen mt-20 px-4"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl mb-20">
        <div className="rounded-2xl bg-base-100 p-6">
          <div className="mb-8 text-center">
           
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-base-content mt-2">
              Payment History
            </h1>
          </div>

          {/* 📊 Analytics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Today', amount: stats.today, color: 'text-blue-600' },
              { label: 'This Week', amount: stats.week, color: 'text-purple-600' },
              { label: 'This Month', amount: stats.month, color: 'text-indigo-600' },
              { label: 'This Year', amount: stats.year, color: 'text-primary' },
            ].map((item, idx) => (
              <div key={idx} className="bg-base-200/50 p-4 rounded-xl border border-base-300 shadow-sm text-center backdrop-blur-md">
                <p className="text-[10px] uppercase font-black opacity-50 mb-1 tracking-widest">{item.label}</p>
                <p className={`text-xl font-black ${item.color}`}>
                  {item.amount.toLocaleString()} <span className="text-[10px]">KSH</span>
                </p>
              </div>
            ))}
          </div>

          {/* ✅ Filter Dropdown */}
          <div className="flex justify-between items-center mb-6 px-2">
            <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Showing {sortedPayments.length} Transactions</p>
            <select
              className="select select-bordered select-sm font-mono uppercase text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Filter: All</option>
              <option value="Completed">Status: Paid</option>
              <option value="Pending">Status: Pending</option>
            </select>
          </div>

          {isLoading && <div className="flex justify-center p-10"><span className="loading loading-dots loading-lg text-primary"></span></div>}
          
          {isError && (
            <div className="alert alert-error shadow-lg rounded-xl">
              <span className="font-mono text-xs uppercase italic">Error: {(error as any)?.data?.error || 'Sync Interrupted'}</span>
            </div>
          )}

          {payments && sortedPayments.length > 0 ? (
            <div className="overflow-x-auto animate-fadeIn">
              <table className="min-w-full text-sm text-left text-base-content border-separate border-spacing-y-2">
                <thead className="text-[10px] uppercase bg-base-200/50 text-primary font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-3 rounded-l-xl">TXN_ID</th>
                    <th className="px-6 py-3">EVENT_NAME</th> 
                    <th className="px-6 py-3">AMOUNT</th>
                    <th className="px-6 py-3">STATUS</th>
                    <th className="px-6 py-3">METHOD</th>
                    <th className="px-6 py-3 rounded-r-xl">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayments.map((payment: any) => (
                    <motion.tr
                      key={payment.paymentId}
                      whileHover={{ x: 5 }}
                      className="bg-base-100 hover:bg-base-200/80 transition duration-200 shadow-sm border border-base-content/5"
                    >
                      <td className="px-6 py-4 font-mono text-[10px] opacity-60">
                        #{payment.transactionId?.slice(-8) || '00000000'}
                      </td>
                      
                      <td className="px-6 py-4">
                         <span className="font-black italic uppercase tracking-tight text-secondary">
                           {eventMap[payment.booking?.eventId] || `Event_ID: ${payment.booking?.eventId}`}
                         </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono font-black text-primary">KSH {Number(payment.amount).toLocaleString()}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                            payment.paymentStatus === 'Completed' || payment.paymentStatus === 'PAID'
                              ? 'bg-success/10 text-success border border-success/20'
                              : payment.paymentStatus === 'FAILED'
                              ? 'bg-error/10 text-error border border-error/20'
                              : 'bg-warning/10 text-warning border border-warning/20'
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-xs font-mono opacity-70 uppercase">{payment.paymentMethod || 'SYSTEM'}</td>
                      
                      <td className="px-6 py-4 text-[10px] font-mono opacity-50">
                        {new Date(payment.paymentDate).toLocaleDateString('en-KE')}
                        <br />
                        {new Date(payment.paymentDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* ✅ Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-1">
                  <button
                    className="btn btn-sm btn-ghost font-mono text-[10px]"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    &lt; PREV
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn btn-sm btn-square font-mono text-xs ${currentPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-sm btn-ghost font-mono text-[10px]"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    NEXT &gt;
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-20 border-2 border-dashed border-base-300 rounded-3xl mt-4">
                <p className="font-mono text-xs uppercase opacity-30 tracking-[0.3em]">
                  No payment data found in current cluster.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GetPaymentsByNationalId;