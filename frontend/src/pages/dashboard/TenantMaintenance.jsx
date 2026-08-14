import React, { useState, useEffect, Fragment } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import socket from '../../lib/socket';
import MaintenanceFormModal from '../../components/dashboard/MaintenanceFormModal';

const tableHeaders = [
  { label: 'Ticket ID', align: 'left' },
  { label: 'Property', align: 'left' },
  { label: 'Issue', align: 'left' },
  { label: 'Date', align: 'left' },
  { label: 'Status', align: 'center' },
  { label: 'Actions', align: 'right' }
];

const TenantMaintenance = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/maintenance/tenant', {
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

    const handleTicketUpdate = (updatedTicket) => {
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
    };

    socket.on('maintenanceTicketUpdated', handleTicketUpdate);

    return () => {
      socket.off('maintenanceTicketUpdated', handleTicketUpdate);
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
          <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-sm group cursor-pointer hover:bg-orange-100 transition-colors">
            <Icon icon="lucide:wrench" className="w-5 h-5 text-orange-600 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">Maintenance</h1>
            <p className="text-sm text-slate-500 font-medium">Track your repair and maintenance requests</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg shadow-sm text-sm font-bold hover:bg-[#062F26] transition-colors"
        >
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Raise Ticket
        </button>
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
                  <td colSpan="6" className="py-24 text-center">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Loading tickets...</p>
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const isExpanded = expandedId === ticket._id;
                  return (
                    <Fragment key={ticket._id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                        className={`transition-colors duration-300 cursor-pointer group ${isExpanded ? 'bg-brand-teal/5' : 'bg-white hover:bg-slate-50/80'}`}
                      >
                        <td className="px-6 py-4 align-middle">
                          <p className="font-bold text-slate-800 text-sm">{ticket.ticketId}</p>
                        </td>
                        <td className="px-6 py-3 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden shadow-sm shrink-0">
                              <img src={ticket.propertyId?.images?.[0]?.url || 'https://via.placeholder.com/150'} alt="Property" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-[#062F26] text-sm line-clamp-1">
                                {ticket.propertyId?.pgName || ticket.propertyId?.societyName || (ticket.propertyId?.bhkType ? `${ticket.propertyId.bhkType} ${ticket.propertyId.propertyCategory}` : ticket.propertyId?.propertyCategory) || 'Unknown Property'}
                              </p>
                              <p className="text-xs text-slate-500">{ticket.propertyId?.address?.city || ''}</p>
                            </div>
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
                          <button className={`px-4 py-2 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all duration-500 inline-flex items-center justify-center gap-2 ${isExpanded ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-600 hover:bg-brand-teal hover:text-white'}`}>
                            {isExpanded ? 'Hide' : 'View'}
                            <Icon icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Details Row */}
                      <tr>
                        <td colSpan="6" className="p-0 border-none bg-slate-50/60">
                          <div className={`grid transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                              <div className="p-5 shadow-inner border-b border-slate-200 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <h4 className="font-bold text-xs uppercase text-slate-500 mb-2 tracking-wider">Description</h4>
                                    <p className="text-sm text-slate-700">{ticket.description}</p>
                                    
                                    {ticket.photos && ticket.photos.length > 0 && (
                                      <div className="mt-4 flex gap-2 overflow-x-auto">
                                        {ticket.photos.map((photo, i) => (
                                          <a key={i} href={photo} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded bg-slate-100 border overflow-hidden shrink-0">
                                            <img src={photo} alt="Issue" className="w-full h-full object-cover" />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <h4 className="font-bold text-xs uppercase text-slate-500 mb-2 tracking-wider">Owner Resolution Notes</h4>
                                    {ticket.resolutionNotes ? (
                                      <p className="text-sm text-slate-700">{ticket.resolutionNotes}</p>
                                    ) : (
                                      <p className="text-sm text-slate-400 italic">No notes provided yet.</p>
                                    )}
                                    {ticket.cost > 0 && (
                                      <p className="mt-4 text-sm font-bold text-red-600">Assigned Cost: ₹{ticket.cost}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Icon icon="lucide:wrench" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No Maintenance Tickets</h3>
                    <p className="text-sm text-slate-500">You haven't raised any maintenance requests.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MaintenanceFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTickets}
      />
    </div>
  );
};

export default TenantMaintenance;
