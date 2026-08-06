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
    <div className="flex flex-col h-[calc(100vh-100px)] min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full relative">
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

        {/* Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white min-h-0">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Property / Bed</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent Cycle</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Due Date</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Amount</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-[#F8F9FA] transition-colors group">
                  <td className="py-4 px-5 align-middle">
                    <p className="text-sm font-bold text-[#062F26] mb-1">{inv.tenantId?.fullName || 'Unknown'}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{inv.tenantId?.phone || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{inv.propertyId?.pgName || inv.propertyId?.propertyCategory || 'Property'}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{inv.bookingId?.roomDetails?.roomName ? `${inv.bookingId.roomDetails.roomName} • ${inv.bookingId.roomDetails.bedName}` : 'Entire Property'}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-[12px] font-semibold text-slate-600">
                      {new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 
                      <span className="mx-1 text-slate-400">-</span> 
                      {new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-700">{new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">₹ {inv.amount.toLocaleString()}</div>
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
                  <td colSpan="7" className="py-12 text-center">
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
  );
};

export default OwnerRentTracking;
