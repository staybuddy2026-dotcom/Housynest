import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const LawyerProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    barRegistrationNumber: 'BRN-2023-8924',
    specialization: 'Real Estate Law',
    experience: '8 Years',
    officeAddress: '123 Legal Avenue, Supreme Court Road, New Delhi'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const user = await response.json();
          setFormData(prev => ({
            ...prev,
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
          }));
          // Update localStorage so navbar and other places have latest
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    toast.success('Profile updated successfully');
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto pb-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#062F26] tracking-tight mb-1">Profile Settings</h1>
        <p className="text-sm text-slate-500">Manage your personal and professional information</p>
      </div>

      {/* Top Profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden group">
        {/* Decorative Background Element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-teal/5 rounded-full blur-2xl group-hover:bg-brand-teal/10 transition-colors duration-500 pointer-events-none"></div>

        <div className="w-16 h-16 bg-[#062F26] rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-inner">
          {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'L'}
        </div>

        <div className="relative z-10">
          <h2 className="text-lg font-bold text-slate-800 leading-tight mb-1">{formData.fullName || 'Lawyer Name'}</h2>
          <p className="text-sm text-slate-500 mb-2">{formData.email}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#062F26] text-white">
              <Icon icon="lucide:scale" className="w-3 h-3" />
              Verified Lawyer
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">{formData.email}</p>
        </div>
      </div>

      {/* Settings Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sidebar Nav (Optional for future expansion) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm sticky top-6">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-[#062F26] font-bold text-sm border border-slate-200 shadow-sm transition-colors text-left">
              <Icon icon="lucide:user" className="w-4 h-4" /> Personal Info
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold text-sm transition-colors text-left mt-1">
              <Icon icon="lucide:lock" className="w-4 h-4" /> Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold text-sm transition-colors text-left mt-1">
              <Icon icon="lucide:bell" className="w-4 h-4" /> Notifications
            </button>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Icon icon="lucide:user" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Icon icon="lucide:phone" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-slate-100/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                  <Icon icon="lucide:info" className="w-3.5 h-3.5" />
                  Email cannot be changed directly for security reasons.
                </p>
              </div>

              <h3 className="text-base font-bold text-slate-800 mt-4 mb-2 border-b border-slate-100 pb-4">Professional Details</h3>

              {/* Bar Council ID */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Bar Council Registration <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Icon icon="lucide:scale" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="barId"
                    value={formData.barId}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
                  />
                </div>
              </div>

              {/* Office Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Office Address
                </label>
                <div className="relative">
                  <Icon icon="lucide:map-pin" className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all resize-y custom-scrollbar"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#062F26] hover:bg-brand-teal text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LawyerProfile;
