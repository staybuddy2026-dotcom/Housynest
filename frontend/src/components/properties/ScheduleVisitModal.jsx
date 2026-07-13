import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const ScheduleVisitModal = ({ isOpen, onClose, property }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('You must be logged in to schedule a visit');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: property.id || property._id,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule visit');
      }

      toast.success('Visit scheduled successfully! We will contact you soon.');
      setTimeout(() => {
        onClose();
        setFormData({ name: '', phone: '', date: '', time: '', message: '' });
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const maxDate = nextMonth.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[480px] shadow-2xl relative animate-[fadeIn_0.2s_ease-out]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <Icon icon="lucide:x" width="18" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#EAF5F2] text-brand-teal flex items-center justify-center">
              <Icon icon="lucide:calendar-clock" width="20" className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#062F26]">Schedule a Visit</h2>
              <p className="text-xs font-medium text-slate-500 line-clamp-1">{property?.title}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name *</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon icon="lucide:user" width="16" />
                </div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number *</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon icon="lucide:phone" width="16" />
                </div>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Preferred Date *</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-teal pointer-events-none z-10">
                <Icon icon="lucide:calendar-days" width="18" />
              </div>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Preferred Time *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'morning', label: 'Morning', time: '10 AM - 12 PM', icon: 'lucide:sunrise' },
                { id: 'afternoon', label: 'Afternoon', time: '12 PM - 4 PM', icon: 'lucide:sun' },
                { id: 'evening', label: 'Evening', time: '4 PM - 7 PM', icon: 'lucide:sunset' }
              ].map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, time: slot.id })}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    formData.time === slot.id
                      ? 'border-brand-teal bg-[#EAF5F2] shadow-sm ring-1 ring-brand-teal scale-[1.02]'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Icon icon={slot.icon} width="22" className={formData.time === slot.id ? 'text-brand-teal' : 'text-slate-400'} />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-xs font-bold ${formData.time === slot.id ? 'text-[#062F26]' : 'text-slate-600'}`}>{slot.label}</span>
                    <span className={`text-[9px] font-medium ${formData.time === slot.id ? 'text-brand-teal' : 'text-slate-400'}`}>{slot.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Message (Optional)</label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any specific requirements or questions?"
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all resize-none"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 w-full bg-[#062F26] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-lg shadow-[#062F26]/20 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[#062F26]/30 hover:-translate-y-0.5'}`}
          >
            {isSubmitting ? 'Scheduling...' : 'Confirm Visit'} {!isSubmitting && <Icon icon="lucide:arrow-right" width="18" />}
          </button>
        </form>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          opacity: 0;
        }
      `}} />
    </div>
  );
};

export default ScheduleVisitModal;
