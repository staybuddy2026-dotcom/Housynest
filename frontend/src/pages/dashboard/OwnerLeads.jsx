import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import socket from '../../lib/socket';

const columns = [
  { id: 'New', title: 'New', color: 'bg-slate-50 border-slate-100', headerBg: 'bg-slate-100', badgeColor: 'bg-[#062F26] text-white', icon: 'lucide:sparkles' },
  { id: 'Contacted', title: 'Contacted', color: 'bg-blue-50/30 border-blue-100', headerBg: 'bg-blue-50', badgeColor: 'bg-[#062F26] text-white', icon: 'lucide:phone-call' },
  { id: 'Closed', title: 'Booked', color: 'bg-emerald-50/30 border-emerald-100', headerBg: 'bg-emerald-50', badgeColor: 'bg-emerald-600 text-white', icon: 'lucide:check-circle-2' },
  { id: 'Cancelled', title: 'Cancelled', color: 'bg-rose-50/30 border-rose-100', headerBg: 'bg-rose-50', badgeColor: 'bg-rose-500 text-white', icon: 'lucide:x-circle' },
];

const OwnerLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/leads/owner', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const mappedLeads = data.map(inq => ({
            id: inq._id,
            inquirer: {
              name: inq.senderId?.fullName || 'Unknown',
              phone: inq.senderId?.phone || 'N/A',
              email: inq.senderId?.email || 'N/A',
              initial: (inq.senderId?.fullName || 'U').charAt(0).toUpperCase(),
              profilePic: inq.senderId?.profilePic,
              color: 'bg-teal-100 text-teal-700'
            },
            property: {
              title: !inq.propertyId ? 'Deleted Property' : (inq.propertyId.pgName || inq.propertyId.societyName || (inq.propertyId.bhkType ? `${inq.propertyId.bhkType} ${inq.propertyId.propertyCategory}` : inq.propertyId.propertyCategory) || 'Unknown Property'),
              location: `${inq.propertyId?.locality || ''}, ${inq.propertyId?.city || ''}`.replace(/^, | , $/g, ''),
              rent: inq.propertyId?.monthlyRent ? `₹${inq.propertyId.monthlyRent}` : inq.propertyId?.rooms?.[0]?.rentPerBed ? `₹${inq.propertyId.rooms[0].rentPerBed}` : 'N/A',
              image: inq.propertyId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&auto=format&fit=crop&q=60'
            },
            date: new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date(inq.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: inq.status,
            lastMessage: inq.message,
            subject: inq.subject || 'N/A',
            moveInDate: inq.moveInDate ? new Date(inq.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
            occupants: inq.occupants || 'N/A',
            gender: inq.gender || 'N/A',
            contactMethod: inq.contactMethod || 'N/A',
            isRead: inq.isRead || false
          }));
          setLeads(mappedLeads);
        } else {
          toast.error('Failed to fetch leads');
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        toast.error('Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    const handleNewLead = (newInq) => {
      fetchLeads();
    };

    socket.on('newLead', handleNewLead);

    return () => {
      socket.off('newLead', handleNewLead);
    };
  }, []);

  // Drag and Drop Handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      handleUpdateStatus(leadId, newStatus);
    }
  };

  const handleLeadClick = async (inq) => {
    setSelectedLead(inq);

    // If it is not read, mark it as read
    if (!inq.isRead) {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/leads/${inq.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          // Update local state to prevent re-fetching
          setLeads(prev => prev.map(i => i.id === inq.id ? { ...i, isRead: true } : i));
          // Notify the sidebar to decrement the leads count
          window.dispatchEvent(new Event('messagesRead'));
        }
      } catch (err) {
        console.error('Failed to mark lead as read', err);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/leads/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Lead marked as ${newStatus}`);
        setLeads(prev => prev.map(inq =>
          inq.id === id
            ? { ...inq, status: newStatus, ...(newStatus !== 'New' ? { isRead: true } : {}) }
            : inq
        ));
        // Notify the sidebar to decrement the leads count if it was marked as read
        if (newStatus !== 'New') {
          window.dispatchEvent(new Event('messagesRead'));
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)] min-h-[600px] w-full bg-slate-50/50 font-sans pb-20 md:pb-0">
      {/* Kanban Board */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal mb-4" />
            <p className="text-slate-500 font-medium">Loading your leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:inbox" className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-[#062F26] mb-2">No Leads Found</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto text-center">
              There are no leads available yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 gap-4 min-h-0 items-stretch overflow-x-auto custom-scrollbar px-4 md:px-0 pb-4 md:pb-0">
            {columns.map(col => {
              const columnLeads = leads.filter(l => {
                const status = l.status || 'New';
                const isValidStatus = columns.some(c => c.id === status);
                return isValidStatus ? status === col.id : col.id === 'New';
              });

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`flex flex-col min-w-[280px] w-full max-w-[320px] md:max-w-none md:w-auto md:min-w-[280px] rounded-2xl border ${col.color} bg-white/50 transition-colors shrink-0 md:flex-1`}
                >
                  <div className={`p-4 rounded-t-2xl border-b border-inherit flex items-center justify-between ${col.headerBg}`}>
                    <div className="flex items-center gap-2">
                      <Icon icon={col.icon} className="w-4 h-4 text-[#062F26]" />
                      <h4 className="font-bold text-[#062F26]">{col.title}</h4>
                    </div>
                    <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${col.badgeColor}`}>
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => handleLeadClick(lead)}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md cursor-grab active:cursor-grabbing hover:border-brand-teal/40 transition-all group relative"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${lead.inquirer?.profilePic ? 'bg-transparent' : 'bg-[#062F26] text-white'}`}>
                              {lead.inquirer?.profilePic ? (
                                <img src={lead.inquirer.profilePic} alt={lead.inquirer.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                lead.inquirer?.name ? lead.inquirer.name.charAt(0).toUpperCase() : 'U'
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#062F26] text-sm group-hover:text-brand-teal transition-colors line-clamp-1">
                                {lead.inquirer?.name || 'Unknown User'}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                                <Icon icon="lucide:phone" className="w-3 h-3" />
                                <span className="text-[11px] font-semibold tracking-wide">{lead.inquirer?.phone || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Property Info in Card */}
                        <div className="bg-slate-50 rounded-lg p-2 flex items-center gap-2 border border-slate-100 mb-3">
                          <img src={lead.property.image} alt={lead.property.title} className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#062F26] truncate">{lead.property.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{lead.property.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                            <Icon icon="lucide:calendar-clock" className="w-3 h-3" />
                            {lead.date}
                          </div>
                          <span className="text-sm font-bold text-[#062F26]">
                            {lead.property.rent}
                          </span>
                        </div>
                      </div>
                    ))}

                    {columnLeads.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200/50 rounded-xl text-slate-400 gap-2">
                        <p className="text-xs font-semibold">Drop leads here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeInUp">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-[#062F26]">Lead Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 ${selectedLead.inquirer?.profilePic ? 'bg-transparent' : 'bg-brand-teal text-white'}`}>
                  {selectedLead.inquirer?.profilePic ? (
                    <img src={selectedLead.inquirer.profilePic} alt={selectedLead.inquirer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedLead.inquirer?.name ? selectedLead.inquirer.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#062F26]">{selectedLead.inquirer?.name || 'Unknown User'}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Icon icon="lucide:phone" className="w-4 h-4 text-slate-400" />
                      {selectedLead.inquirer?.phone || 'No phone provided'}
                    </p>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Icon icon="lucide:mail" className="w-4 h-4 text-slate-400" />
                      {selectedLead.inquirer?.email || 'No email provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Subject</span>
                  <p className="text-sm font-semibold text-[#062F26]">{selectedLead.subject || 'General Inquiry'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Move-in Date</span>
                  <p className="text-sm font-semibold text-[#062F26]">
                    {selectedLead.moveInDate}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Occupants</span>
                  <p className="text-sm font-semibold text-[#062F26]">{selectedLead.occupants || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Status</span>
                  <p className="text-sm font-semibold text-brand-teal">{selectedLead.status || 'New'}</p>
                </div>
              </div>

              {/* PG Details */}
              {(selectedLead.floorName || selectedLead.roomName || selectedLead.bedName) && (
                <div>
                  <h4 className="text-sm font-bold text-[#062F26] mb-2 flex items-center gap-2">
                    <Icon icon="lucide:building" className="w-4 h-4 text-slate-400" /> Selected Unit
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedLead.floorName && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Floor</span>
                        <p className="text-sm font-semibold text-[#062F26]">{selectedLead.floorName}</p>
                      </div>
                    )}
                    {selectedLead.roomName && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Room</span>
                        <p className="text-sm font-semibold text-[#062F26]">{selectedLead.roomName}</p>
                      </div>
                    )}
                    {selectedLead.bedName && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Bed</span>
                        <p className="text-sm font-semibold text-[#062F26]">{selectedLead.bedName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <h4 className="text-sm font-bold text-[#062F26] mb-2 flex items-center gap-2">
                  <Icon icon="lucide:message-square" className="w-4 h-4 text-slate-400" /> Message
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {selectedLead.lastMessage || 'No message provided.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    navigate('/owner/messages', { state: { activeLeadId: selectedLead.id } });
                  }}
                  className="flex-1 py-3 bg-brand-teal text-white rounded-xl font-bold text-sm hover:bg-[#062F26] transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:message-circle" className="w-4 h-4" />
                  Reply to Lead
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerLeads;
