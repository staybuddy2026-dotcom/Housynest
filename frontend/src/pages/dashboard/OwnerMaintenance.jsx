import React, { useState, useEffect, Fragment } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import socket from '../../lib/socket';
import MaintenanceDetailsModal from '../../components/dashboard/MaintenanceDetailsModal';

const tableHeaders = [
  { label: 'Ticket ID', align: 'left' },
  { label: 'Property', align: 'left' },
  { label: 'Tenant', align: 'left' },
  { label: 'Issue', align: 'left' },
  { label: 'Date', align: 'left' },
  { label: 'Status', align: 'center' },
  { label: 'Actions', align: 'right' }
];

const OwnerMaintenance = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/maintenance/owner', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      } else {
        toast.error('Failed to fetch maintenance tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    // Clear notification badge
    window.dispatchEvent(new Event('maintenanceTicketsRead'));

    const handleNewTicket = (newTicket) => {
      fetchTickets(); // Refresh the list to get populated fields
    };

    socket.on('newMaintenanceTicket', handleNewTicket);

    return () => {
      socket.off('newMaintenanceTicket', handleNewTicket);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
          </div>
        );
      case 'In-Progress':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-sm">
            <Icon icon="lucide:wrench" className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm">
            <Icon icon="lucide:check-circle-2" className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Resolved</span>
          </div>
        );
      case 'Closed':
      case 'Rejected':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-full shadow-sm">
            <Icon icon="lucide:x-circle" className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full font-sans animate-fadeIn pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-sm">
            <Icon icon="lucide:wrench" className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">Maintenance Tickets</h1>
            <p className="text-sm text-slate-500 font-medium">Manage and resolve property maintenance requests</p>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block flex-1 mb-10 bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className={`px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${header.align === 'center' ? 'text-center' : header.align === 'right' ? 'text-right' : ''}`}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Loading tickets...</p>
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="bg-white hover:bg-slate-50/80 transition-colors duration-300">
                    <td className="px-6 py-4 align-middle">
                      <p className="font-bold text-slate-800 text-sm">{ticket.ticketId}</p>
                    </td>
                    <td className="px-6 py-3 align-middle">
                      <p className="font-bold text-[#062F26] text-sm line-clamp-2">
                        {ticket.propertyId?.pgName || ticket.propertyId?.societyName || (ticket.propertyId?.bhkType ? `${ticket.propertyId.bhkType} ${ticket.propertyId.propertyCategory}` : ticket.propertyId?.propertyCategory) || 'Unknown Property'}
                      </p>
                    </td>
                    <td className="px-6 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          {ticket.tenantId?.fullName || 'Unknown Tenant'}
                        </p>
                        {ticket.tenantId?.email && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Icon icon="lucide:mail" className="w-3 h-3 text-slate-400" />
                            {ticket.tenantId.email}
                          </p>
                        )}
                        {ticket.tenantId?.phone && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Icon icon="lucide:phone" className="w-3 h-3 text-slate-400" />
                            {ticket.tenantId.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <p className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{ticket.title}</p>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{ticket.category}</span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <p className="text-sm font-bold text-slate-800">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="inline-block scale-95 origin-center">
                        {getStatusBadge(ticket.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-4 py-2 text-[11px] uppercase tracking-wider font-bold rounded-md bg-slate-100 text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-300"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <Icon icon="lucide:wrench" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No Maintenance Tickets</h3>
                    <p className="text-sm text-slate-500">Your tenants haven't raised any maintenance requests.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <MaintenanceDetailsModal 
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSuccess={fetchTickets}
        />
      )}
    </div>
  );
};

export default OwnerMaintenance;
