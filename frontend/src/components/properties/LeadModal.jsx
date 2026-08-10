import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import Lenis from 'lenis';
import CustomDropdown from '../list-property/CustomDropdown';

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

const LeadModal = ({ isOpen, onClose, property }) => {
  const [formData, setFormData] = useState({
    moveInDate: '',
    occupants: '1',
    gender: 'Any',
    contactMethod: 'WhatsApp',
    subject: '',
    message: '',
    agreedToShareDetails: false,
    floorName: '',
    roomName: '',
    bedName: ''
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
      toast.error('Please enter your lead message');
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
        toast.error('You must be logged in to send an lead');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: property._id || property.id,
          ownerId: property.owner._id || property.owner.id || property.owner,
          ...Object.fromEntries(Object.entries(formData).filter(([_, v]) => v !== ''))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send lead');
      }

      toast.success('Lead sent successfully to the owner!');
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
      console.error('Error sending lead:', error);
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
            <form onSubmit={handleSubmit} id="lead-form" className="space-y-4">
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
                    <CustomDropdown
                      placeholder="Select Subject"
                      value={formData.subject || "Select Subject"}
                      options={["Select Subject", ...SUBJECTS]}
                      onChange={(val) => setFormData(prev => ({ ...prev, subject: val === "Select Subject" ? "" : val }))}
                      containerClassName="w-full"
                      buttonClassName="py-2.5 !border-slate-200 bg-[#F8FAFC] text-slate-800"
                    />
                  </div>
                </div>

                {/* PG Specific Fields */}
                {property?.propertyType === 'PG' && property?.floors?.length > 0 && (
                  <>
                    {/* Floor */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        SELECT FLOOR
                      </label>
                      <div className="relative">
                        <CustomDropdown
                          placeholder="Any Floor"
                          value={formData.floorName || "Any Floor"}
                          options={["Any Floor", ...property.floors.map(f => f.floorName)]}
                          onChange={(val) => {
                            setFormData(prev => ({ ...prev, floorName: val === "Any Floor" ? "" : val, roomName: '', bedName: '' }));
                          }}
                          containerClassName="w-full"
                          buttonClassName="py-2.5 !border-slate-200 bg-[#F8FAFC] text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Room */}
                    {formData.floorName && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          SELECT ROOM
                        </label>
                        <div className="relative">
                          <CustomDropdown
                            placeholder="Any Room"
                            value={formData.roomName || "Any Room"}
                            options={["Any Room", ...(property.floors.find(f => f.floorName === formData.floorName)?.rooms.map(room => room.roomName) || [])]}
                            onChange={(val) => {
                              setFormData(prev => ({ ...prev, roomName: val === "Any Room" ? "" : val, bedName: '' }));
                            }}
                            containerClassName="w-full"
                            buttonClassName="py-2.5 !border-slate-200 bg-[#F8FAFC] text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Bed */}
                    {formData.roomName && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          SELECT BED
                        </label>
                        <div className="relative">
                          <CustomDropdown
                            placeholder="Any Bed"
                            value={formData.bedName || "Any Bed"}
                            options={["Any Bed", ...(property.floors.find(f => f.floorName === formData.floorName)?.rooms.find(r => r.roomName === formData.roomName)?.beds.map(bed => bed.bedName) || [])]}
                            onChange={(val) => setFormData(prev => ({ ...prev, bedName: val === "Any Bed" ? "" : val }))}
                            containerClassName="w-full"
                            buttonClassName="py-2.5 !border-slate-200 bg-[#F8FAFC] text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Number of Occupants */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    NUMBER OF OCCUPANTS
                  </label>
                  <div className="relative">
                    <CustomDropdown
                      placeholder="1"
                      value={formData.occupants}
                      options={['1', '2', '3', '4+']}
                      onChange={(val) => setFormData(prev => ({ ...prev, occupants: val }))}
                      containerClassName="w-full"
                      buttonClassName="py-2.5 !border-slate-200 bg-[#F8FAFC] text-slate-800"
                    />
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
                  data-lenis-prevent
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
            form="lead-form"
            disabled={isLoading || !formData.agreedToShareDetails}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-[#062F26] hover:bg-[#062F26] transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Icon icon="eos-icons:loading" className="w-4 h-4" /> : <Icon icon="lucide:send" className="w-4 h-4" />}
            Send Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
