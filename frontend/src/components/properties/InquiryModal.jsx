import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import Lenis from 'lenis';

const SUBJECTS = [
  'Room Availability',
  'Rent Details',
  'Food Facility',
  'Security Deposit',
  'Parking',
  'Rules & Policies',
  'Schedule Visit',
  'Negotiation',
  'Other'
];

const InquiryModal = ({ isOpen, onClose, property }) => {
  const [formData, setFormData] = useState({
    moveInDate: '',
    occupants: '1',
    gender: 'Any',
    contactMethod: 'WhatsApp',
    subject: '',
    message: '',
    agreedToShareDetails: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your inquiry message');
      return;
    }

    // Since checkbox is required in HTML, it will block submit if not checked.
    if (!formData.agreedToShareDetails) {
      toast.error('You must agree to share contact details');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('You must be logged in to send an inquiry');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: property._id || property.id,
          ownerId: property.owner._id || property.owner.id || property.owner,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send inquiry');
      }

      toast.success('Inquiry sent successfully to the owner!');
      setFormData({
        moveInDate: '',
        occupants: '1',
        gender: 'Any',
        contactMethod: 'WhatsApp',
        subject: '',
        message: '',
        agreedToShareDetails: false
      });
      onClose();
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl animate-scaleIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-[#062F26]">
            <Icon icon="lucide:message-circle-question" className="w-5 h-5" />
            <h3 className="font-bold text-base">Send Inquiry</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        </div>

        {/* Content Wrapper */}
        <div ref={wrapperRef} className="overflow-hidden relative flex-1 min-h-0">
          <div ref={contentRef} className="p-6">
            <form onSubmit={handleSubmit} id="inquiry-form" className="space-y-4">
              <p className="text-sm text-slate-500 mb-2">
                Have a question about <span className="font-bold text-[#062F26]">{property?.title || 'Property'}</span>? Send a direct message to the owner.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Move-in Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    PREFERRED MOVE-IN DATE
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    SUBJECT <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                    >
                      <option value="" disabled>Select Subject</option>
                      {SUBJECTS.map((sub, i) => (
                        <option key={i} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <Icon icon="lucide:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Number of Occupants */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    NUMBER OF OCCUPANTS
                  </label>
                  <div className="relative">
                    <select
                      name="occupants"
                      value={formData.occupants}
                      onChange={handleChange}
                      className="w-full appearance-none bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                    >
                      {['1', '2', '3', '4+'].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <Icon icon="lucide:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    GENDER
                  </label>
                  <div className="flex items-center gap-5 mt-3">
                    {['Male', 'Female', 'Any'].map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${formData.gender === g
                          ? 'border-[#062F26]'
                          : 'border-slate-300 group-hover:border-[#062F26]'
                          }`}>
                          {formData.gender === g && <div className="w-[10px] h-[10px] rounded-full bg-[#062F26]" />}
                        </div>
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={formData.gender === g}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span className={`text-sm font-medium ${formData.gender === g ? 'text-[#062F26]' : 'text-slate-600 group-hover:text-slate-800'
                          }`}>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  PREFERRED CONTACT METHOD
                </label>
                <div className="flex flex-wrap gap-5">
                  {['Call', 'WhatsApp', 'Chat', 'Email'].map(method => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${formData.contactMethod === method
                        ? 'border-[#062F26]'
                        : 'border-slate-300 group-hover:border-[#062F26]'
                        }`}>
                        {formData.contactMethod === method && <div className="w-[10px] h-[10px] rounded-full bg-[#062F26]" />}
                      </div>
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={formData.contactMethod === method}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${formData.contactMethod === method ? 'text-[#062F26]' : 'text-slate-600 group-hover:text-slate-800'
                        }`}>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  MESSAGE <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Hi,&#10;&#10;I am interested in your PG.&#10;Could you please let me know if a single sharing room is available from 15th July?&#10;&#10;Thank you."
                  rows="4"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all resize-none"
                ></textarea>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 mt-1">
                <input
                  type="checkbox"
                  name="agreedToShareDetails"
                  id="agreedToShareDetails"
                  checked={formData.agreedToShareDetails}
                  onChange={handleChange}
                  required
                  className="mt-1 w-[16px] h-[16px] rounded border-slate-300 text-brand-teal focus:ring-brand-teal cursor-pointer"
                />
                <label htmlFor="agreedToShareDetails" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                  I agree to share my contact details with the owner.
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-6 pb-6 pt-2 bg-white rounded-b-2xl shrink-0 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="inquiry-form"
            disabled={isLoading || !formData.agreedToShareDetails}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-[#537267] hover:bg-[#435e54] transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Icon icon="eos-icons:loading" className="w-4 h-4" /> : <Icon icon="lucide:send" className="w-4 h-4" />}
            Send Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryModal;
