import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const OwnerRentTracking = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/invoices/owner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load rent invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (invoiceId) => {
    setProcessingId(invoiceId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/invoices/${invoiceId}/remind`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Reminder sent to tenant successfully');
      } else {
        toast.error('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Error sending reminder');
    } finally {
      setProcessingId(null);
    }
  };

  const handleTestCron = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/invoices/run-cron', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Simulated cron job! New invoices generated if applicable.');
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
      toast.error('Error running test cron');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const tenantName = inv.tenantId?.fullName || '';
    const propertyName = inv.propertyId?.pgName || inv.propertyId?.propertyCategory || '';
    return tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           propertyName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-100px)] min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full relative pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#062F26] mb-1 tracking-tight">Rent Collection</h1>
          <p className="text-sm text-slate-500 font-medium">Track recurring monthly rent payments across all your active tenants.</p>
        </div>
        <button 
          onClick={handleTestCron}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm w-max"
        >
          <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
          Test Auto-Generate (Cron)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden min-h-0">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative w-full sm:w-80 group">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input 
              type="text" 
              placeholder="Search by tenant or property..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Responsive Content Container */}
        <div className="flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar bg-white min-h-0 relative">
          
          {/* Mobile View (Cards) */}
          <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50/30">
            {filteredInvoices.map((inv) => (
              <div key={inv._id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center min-w-0">
                       <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">
                         {inv.tenantId?.fullName ? inv.tenantId.fullName.charAt(0).toUpperCase() : 'U'}
                       </div>
                       <div className="min-w-0">
                          <h3 className="font-bold text-[#062F26] text-sm truncate max-w-[150px]">{inv.tenantId?.fullName || 'Unknown'}</h3>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate max-w-[150px]">{inv.propertyId?.pgName || inv.propertyId?.propertyCategory || 'Property'}</p>
                       </div>
                    </div>
                    <span className={`px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border shrink-0 ${getStatusStyle(inv.status)}`}>
                      {inv.status}
                    </span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Amount Due</p>
                      <p className="text-sm font-bold text-slate-700">₹ {inv.amount.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 min-w-0">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Due Date</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                   </div>
                 </div>

                 <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                   <div className="flex items-center gap-2">
                      <a href={`tel:${inv.tenantId?.phone || ''}`} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:phone" className="w-4 h-4" /></a>
                      <a href={`https://wa.me/${(inv.tenantId?.whatsappNumber || inv.tenantId?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:message-circle" className="w-4 h-4" /></a>
                      <a href={`mailto:${inv.tenantId?.email || ''}`} className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:mail" className="w-4 h-4" /></a>
                   </div>
                   <div className="flex items-center gap-2">
                      {inv.status !== 'Paid' ? (
                        <button 
                          onClick={() => handleSendReminder(inv._id)}
                          disabled={processingId === inv._id}
                          className="px-3 h-8 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {processingId === inv._id ? <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" /> : <><Icon icon="lucide:bell-ring" className="w-3.5 h-3.5" /> Remind</>}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}
                   </div>
                 </div>
              </div>
            ))}
            {filteredInvoices.length === 0 && !loading && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No rent invoices found.</p>
              </div>
            )}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block w-full">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Property / Bed</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent Cycle</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Due Date</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Amount</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-center">Contact</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="py-4 px-5 align-middle">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#062F26] mb-1 truncate max-w-[120px] lg:max-w-[180px]" title={inv.tenantId?.fullName || 'Unknown'}>{inv.tenantId?.fullName || 'Unknown'}</p>
                        <p className="text-[11px] font-semibold text-slate-400 truncate max-w-[120px] lg:max-w-[180px]">{inv.tenantId?.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 align-middle">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate max-w-[150px] lg:max-w-[220px]" title={inv.propertyId?.pgName || inv.propertyId?.propertyCategory || 'Property'}>{inv.propertyId?.pgName || inv.propertyId?.propertyCategory || 'Property'}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1 truncate max-w-[150px] lg:max-w-[220px]" title={inv.bookingId?.roomDetails?.roomName ? `${inv.bookingId.roomDetails.roomName} • ${inv.bookingId.roomDetails.bedName}` : 'Entire Property'}>{inv.bookingId?.roomDetails?.roomName ? `${inv.bookingId.roomDetails.roomName} • ${inv.bookingId.roomDetails.bedName}` : 'Entire Property'}</p>
                      </div>
                    </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-[12px] font-semibold text-slate-600 flex items-center whitespace-nowrap">
                      <span className="truncate max-w-[80px]" title={new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}>{new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span> 
                      <span className="mx-1 text-slate-400 shrink-0">-</span> 
                      <span className="truncate max-w-[80px]" title={new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}>{new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-700 truncate max-w-[100px]" title={new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}>{new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm truncate max-w-[100px]" title={`₹ ${inv.amount.toLocaleString()}`}>₹ {inv.amount.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <a href={`tel:${inv.tenantId?.phone || ''}`} className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Call">
                        <Icon icon="lucide:phone" className="w-3.5 h-3.5" />
                      </a>
                      <a href={`https://wa.me/${(inv.tenantId?.whatsappNumber || inv.tenantId?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="WhatsApp">
                        <Icon icon="lucide:message-circle" className="w-3.5 h-3.5" />
                      </a>
                      <a href={`mailto:${inv.tenantId?.email || ''}`} className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Email">
                        <Icon icon="lucide:mail" className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider border ${getStatusStyle(inv.status)} shadow-sm`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle text-right">
                    <div className="flex items-center justify-end">
                      {inv.status !== 'Paid' ? (
                        <button 
                          onClick={() => handleSendReminder(inv._id)}
                          disabled={processingId === inv._id}
                          className="px-3 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal disabled:text-brand-teal/50 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 min-w-[120px]"
                        >
                          {processingId === inv._id ? (
                            <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Icon icon="lucide:bell-ring" className="w-3.5 h-3.5" />
                              Send Reminder
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 justify-end">
                          <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                          Paid on {new Date(inv.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredInvoices.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No rent invoices generated yet.</p>
                      <p className="text-xs text-slate-400 mt-1">Invoices are automatically created before the due date.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerRentTracking;
