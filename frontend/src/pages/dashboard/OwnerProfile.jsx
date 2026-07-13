import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const OwnerProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profilePic: '',
  });
  const [isUploading, setIsUploading] = useState(false);

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
          setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            profilePic: user.profilePic || '',
          });
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('profilePic', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading photo...');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/upload-profile-pic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setFormData(prev => ({ ...prev, profilePic: updatedUser.profilePic }));
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('profilePicUpdated'));
        toast.success('Profile photo updated successfully', { id: toastId });
      } else {
        throw new Error('Failed to upload');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    toast.success('Profile updated successfully');
  };

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-[#062F26] tracking-tight mb-6">Profile Settings</h1>

      {/* Top Profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex items-center gap-5">
        <div className="relative group">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#062F26] to-brand-teal rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-inner overflow-hidden">
            {formData.profilePic ? (
              <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'O'
            )}
          </div>

          <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {isUploading ? (
              <Icon icon="lucide:loader-2" className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Icon icon="lucide:camera" className="w-5 h-5 text-white" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 leading-tight mb-1">{formData.fullName || 'Owner Name'}</h2>
          <p className="text-sm text-slate-500 mb-2">{formData.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF5F2] text-[#062F26]">
            Owner
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-[#062F26] mb-6 border-b border-slate-100 pb-4">Personal Information</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Icon icon="lucide:user" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 ml-1">Email cannot be changed.</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Icon icon="lucide:phone" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full bg-[#062F26] text-white font-bold text-[15px] py-3.5 rounded-xl hover:bg-brand-teal transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerProfile;
