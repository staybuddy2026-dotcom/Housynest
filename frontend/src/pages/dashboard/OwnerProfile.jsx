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
  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(false);
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-[#062F26] tracking-tight mb-6">Profile Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Profile Summary Card */}
        <div className="w-full lg:w-[320px] shrink-0 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center lg:sticky lg:top-6">
          <div className="relative group mb-5">
            <div className="w-28 h-28 bg-linear-to-tr from-[#062F26] to-brand-teal rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-inner overflow-hidden ring-4 ring-slate-50">
              {formData.profilePic ? (
                <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'O'
              )}
            </div>

            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {isUploading ? (
                <Icon icon="lucide:loader-2" className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Icon icon="lucide:camera" className="w-6 h-6 text-white" />
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
          
          <h2 className="text-xl font-bold text-slate-800 leading-tight mb-1.5">{formData.fullName || 'Owner Name'}</h2>
          <p className="text-sm font-medium text-slate-500 mb-4">{formData.email}</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EAF5F2] text-[#062F26] mb-8">
            Owner
          </span>
          
          {/* Update Photo Button */}
          <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 hover:text-[#062F26] transition-all cursor-pointer group">
            {isUploading ? (
              <Icon icon="lucide:loader-2" className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <Icon icon="lucide:image-plus" className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#062F26] transition-colors" />
            )}
            {isUploading ? 'Uploading...' : 'Update Photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full flex-1 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-[#062F26]">Personal Information</h3>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#EAF5F2] text-[#062F26] text-sm font-bold rounded-xl hover:bg-[#062F26] hover:text-white transition-colors"
              >
                <Icon icon="lucide:pencil" className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

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
                  disabled={!isEditing}
                  required
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm transition-all ${isEditing
                      ? 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal'
                      : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                    }`}
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
            {isEditing && <p className="text-xs text-slate-400 mt-2 ml-1">Email cannot be changed.</p>}
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
                disabled={!isEditing}
                className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm transition-all ${isEditing
                    ? 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal'
                    : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                  }`}
              />
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <button
              type="submit"
              className="mt-2 w-full bg-[#062F26] text-white font-bold text-[15px] py-3.5 rounded-xl hover:bg-brand-teal transition-colors shadow-sm"
            >
              Save Changes
            </button>
          )}
        </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
