import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import CustomDropdown from '../list-property/CustomDropdown';

const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Appliance', 'Other'];

const MaintenanceFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    title: '',
    description: '',
    category: 'Plumbing',
    photos: []
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch active bookings for this tenant to get their properties
      const fetchProperties = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch('/api/bookings/tenant', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Filter active bookings
            const activeBookings = data.filter(b => b.status === 'Active' || b.status === 'Confirmed');
            const uniqueProperties = [];
            const propIds = new Set();
            activeBookings.forEach(b => {
              if (b.propertyId && !propIds.has(b.propertyId._id)) {
                propIds.add(b.propertyId._id);
                uniqueProperties.push(b.propertyId);
              }
            });
            setProperties(uniqueProperties);
            if (uniqueProperties.length > 0) {
              setFormData(prev => ({ ...prev, propertyId: uniqueProperties[0]._id }));
            }
          }
        } catch (err) {
          console.error('Failed to fetch properties', err);
        }
      };
      fetchProperties();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files].slice(0, 5) })); // max 5 photos
  };

  const removePhoto = (index) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.propertyId) {
      return toast.error('You need an active property to raise a ticket');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const payload = new FormData();
      payload.append('propertyId', formData.propertyId);
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      
      formData.photos.forEach(photo => {
        payload.append('photos', photo);
      });

      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });

      if (res.ok) {
        toast.success('Ticket raised successfully');
        onSuccess();
        onClose();
        // reset form
        setFormData({
          propertyId: properties[0]?._id || '',
          title: '',
          description: '',
          category: 'Plumbing',
          photos: []
        });
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to raise ticket');
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90dvh] flex flex-col animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-[#062F26] flex items-center gap-2">
            <Icon icon="lucide:wrench" className="text-brand-teal" />
            Raise Maintenance Ticket
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <Icon icon="lucide:x" className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 custom-scrollbar">
          <form id="maintenanceForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="shrink-0">
            <CustomDropdown
              label="Select Property"
              options={properties.length === 0 ? [{label: 'No active properties found', value: ''}] : properties.map(p => {
                const title = p.pgName || p.societyName || (p.bhkType ? `${p.bhkType} ${p.propertyCategory}` : p.propertyCategory) || 'Unknown Property';
                return { label: title, value: p._id };
              })}
              value={formData.propertyId}
              onChange={val => setFormData({...formData, propertyId: val})}
              placeholder="Select a property"
              containerClassName="w-full"
              buttonClassName="w-full"
              required
            />
            </div>

            <div className="shrink-0">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      formData.category === cat 
                        ? 'bg-brand-teal text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Issue Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm font-medium"
                placeholder="E.g., Leaking tap in bathroom"
                required
              />
            </div>

            <div className="shrink-0">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Detailed Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm font-medium resize-none custom-scrollbar"
                placeholder="Describe the issue in detail..."
                rows="4"
                required
              ></textarea>
            </div>

            <div className="shrink-0">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Photos (Optional, max 5)</label>
              <div className="flex flex-wrap gap-3">
                {formData.photos.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={URL.createObjectURL(photo)} alt="Upload preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon="lucide:x" className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {formData.photos.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 hover:text-brand-teal hover:border-brand-teal">
                    <Icon icon="lucide:image-plus" className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Add</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handlePhotoChange}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50 rounded-b-2xl shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="maintenanceForm"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-brand-teal hover:bg-[#062F26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:send" className="w-4 h-4" />}
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceFormModal;
