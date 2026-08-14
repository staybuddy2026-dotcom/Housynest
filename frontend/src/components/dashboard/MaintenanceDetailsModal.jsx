import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import CustomDropdown from '../list-property/CustomDropdown';

const MaintenanceDetailsModal = ({ ticket, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: ticket.status,
    resolutionNotes: ticket.resolutionNotes || '',
    cost: ticket.cost || 0
  });

  const statuses = ['Pending', 'In-Progress', 'Resolved', 'Closed', 'Rejected'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/maintenance/${ticket._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Ticket updated successfully');
        onSuccess();
        onClose();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to update ticket');
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#062F26] flex items-center gap-2">
              Update Ticket: {ticket.ticketId}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Property: {ticket.propertyId?.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Icon icon="lucide:x" className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col md:flex-row gap-6">
          {/* Left Col - Ticket details */}
          <div className="md:w-1/2 flex flex-col gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-[10px] uppercase text-slate-500 tracking-wider mb-1">Issue</h4>
              <p className="font-bold text-slate-800 text-sm mb-2">{ticket.title}</p>
              <span className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded text-[10px] font-bold uppercase tracking-wider">{ticket.category}</span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-[10px] uppercase text-slate-500 tracking-wider mb-1">Description</h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                 {ticket.tenantId?.profilePic ? (
                   <img src={ticket.tenantId.profilePic} alt="Tenant" className="w-full h-full object-cover" />
                 ) : (
                   <Icon icon="lucide:user" className="w-full h-full p-2 text-slate-400" />
                 )}
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tenant</p>
                 <p className="font-bold text-slate-800 text-sm">{ticket.tenantId?.fullName}</p>
                 <a href={`tel:${ticket.tenantId?.phone}`} className="text-xs text-brand-teal font-medium hover:underline">{ticket.tenantId?.phone}</a>
               </div>
            </div>

            {ticket.photos && ticket.photos.length > 0 && (
              <div>
                <h4 className="font-bold text-[10px] uppercase text-slate-500 tracking-wider mb-2">Attached Photos</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {ticket.photos.map((photo, i) => (
                    <a key={i} href={photo} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group relative">
                      <img src={photo} alt="Issue" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Icon icon="lucide:external-link" className="text-white w-5 h-5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col - Update Form */}
          <div className="md:w-1/2">
            <form id="updateTicketForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
              <CustomDropdown
                label="Status"
                options={statuses}
                value={formData.status}
                onChange={val => setFormData({...formData, status: val})}
                placeholder="Select status"
              />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Resolution Notes (Visible to tenant)</label>
                <textarea 
                  value={formData.resolutionNotes}
                  onChange={e => setFormData({...formData, resolutionNotes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm font-medium resize-none"
                  placeholder="E.g., Plumber has been scheduled for tomorrow at 2 PM..."
                  rows="4"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Estimated / Actual Cost (₹)</label>
                <input 
                  type="number"
                  value={formData.cost}
                  onChange={e => setFormData({...formData, cost: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm font-medium"
                  placeholder="0"
                  min="0"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="updateTicketForm"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-brand-teal hover:bg-[#062F26] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:save" className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetailsModal;
