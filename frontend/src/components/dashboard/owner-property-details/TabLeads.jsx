import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const TabLeads = ({ leads, loadingLeads, setLeads, property }) => {
  const [selectedLead, setSelectedLead] = useState(null);

  if (loadingLeads) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
        <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center animate-fadeIn">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:inbox" className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-[#062F26] mb-2">No Leads Yet</h3>
        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
          There are no leads for this property yet. New leads will appear here.
        </p>
      </div>
    );
  }

  const columns = [
    { id: 'New', title: 'New', color: 'bg-slate-50 border-slate-100', headerBg: 'bg-slate-100', badgeColor: 'bg-[#062F26] text-white', icon: 'lucide:sparkles' },
    { id: 'Contacted', title: 'Contacted', color: 'bg-blue-50/30 border-blue-100', headerBg: 'bg-blue-50', badgeColor: 'bg-[#062F26] text-white', icon: 'lucide:phone-call' },
    { id: 'In Discussion', title: 'Site Visit', color: 'bg-amber-50/30 border-amber-100', headerBg: 'bg-amber-50', badgeColor: 'bg-amber-500 text-white', icon: 'lucide:users' },
    { id: 'Closed', title: 'Booked', color: 'bg-emerald-50/30 border-emerald-100', headerBg: 'bg-emerald-50', badgeColor: 'bg-emerald-600 text-white', icon: 'lucide:check-circle-2' },
    { id: 'Cancelled', title: 'Cancelled', color: 'bg-rose-50/30 border-rose-100', headerBg: 'bg-rose-50', badgeColor: 'bg-rose-500 text-white', icon: 'lucide:x-circle' },
  ];

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

    const lead = leads.find(l => l._id === leadId);
    if (lead && lead.status !== newStatus) {
      const originalLeads = [...leads];
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));

      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/leads/${leadId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) {
          setLeads(originalLeads);
          toast.error('Failed to update status');
        } else {
          toast.success(`Lead moved to ${newStatus}`);
        }
      } catch (err) {
        setLeads(originalLeads);
        toast.error('Failed to update status');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#062F26]">Property Leads Kanban <span className="text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-md text-sm ml-2">{leads.length}</span></h3>
        <p className="text-sm font-medium text-slate-500">Drag and drop cards to update status</p>
      </div>

      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 min-h-[500px]">
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
              className={`flex flex-col min-w-[280px] w-full max-w-[320px] rounded-2xl border ${col.color} transition-colors`}
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

              <div className="p-3 flex-1 flex flex-col gap-3">
                {columnLeads.map(lead => (
                  <div
                    key={lead._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead._id)}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md cursor-grab active:cursor-grabbing hover:border-brand-teal/40 transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${lead.senderId?.profilePic ? 'bg-transparent' : 'bg-[#062F26] text-white'
                          }`}>
                          {lead.senderId?.profilePic ? (
                            <img src={lead.senderId.profilePic} alt={lead.senderId.fullName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            lead.senderId?.fullName ? lead.senderId.fullName.charAt(0).toUpperCase() : 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#062F26] text-sm group-hover:text-brand-teal transition-colors line-clamp-1">
                            {lead.senderId?.fullName || 'Unknown User'}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                            <Icon icon="lucide:phone" className="w-3 h-3" />
                            <span className="text-[11px] font-semibold tracking-wide">{lead.senderId?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                        <Icon icon="lucide:calendar-clock" className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                      <span className="text-sm font-bold text-[#062F26]">
                        {property.monthlyRent ? `₹${property.monthlyRent}` : 'N/A'}
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

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeInUp">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-[#062F26]">Lead Details</h2>
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
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 ${selectedLead.senderId?.profilePic ? 'bg-transparent' : 'bg-brand-teal text-white'}`}>
                  {selectedLead.senderId?.profilePic ? (
                    <img src={selectedLead.senderId.profilePic} alt={selectedLead.senderId.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedLead.senderId?.fullName ? selectedLead.senderId.fullName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#062F26]">{selectedLead.senderId?.fullName || 'Unknown User'}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Icon icon="lucide:phone" className="w-4 h-4 text-slate-400" />
                      {selectedLead.senderId?.phone || 'No phone provided'}
                    </p>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Icon icon="lucide:mail" className="w-4 h-4 text-slate-400" />
                      {selectedLead.senderId?.email || 'No email provided'}
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
                    {selectedLead.moveInDate ? new Date(selectedLead.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}
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
                    {selectedLead.message || 'No message provided.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabLeads;
