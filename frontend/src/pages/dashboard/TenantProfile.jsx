import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const TenantProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profilePic: '',
    dob: '',
    gender: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    }
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
            dob: user.dob ? user.dob.split('T')[0] : '',
            gender: user.gender || '',
            emergencyContact: user.emergencyContact || { name: '', relationship: '', phone: '' },
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

  const handleNestedChange = (e, parent) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [e.target.name]: e.target.value
      }
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating profile...');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully', { id: toastId });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', { id: toastId });
    }
  };

  return (
    <div className="animate-fadeIn mx-auto pb-10 ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
            <Icon icon="lucide:user" className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">Profile Settings</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your personal information and contact details</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Profile Summary Card */}
        <div className="w-full lg:w-[320px] shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center text-center lg:sticky lg:top-6 overflow-hidden relative">
          {/* Cover Photo / Top Background */}
          <div className="w-full h-32 bg-linear-to-r from-emerald-600 to-brand-teal absolute top-0 left-0"></div>

          <div className="relative group mb-4 mt-16 z-10">
            <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-md">
              <div className="w-full h-full bg-linear-to-tr from-[#062F26] to-emerald-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-inner overflow-hidden">
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'T'
                )}
              </div>
            </div>

            <label className="absolute inset-1.5 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
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

          <div className="px-8 pb-8 flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-1">{formData.fullName || 'Tenant Name'}</h2>
            <p className="text-sm font-medium text-slate-500 mb-4">{formData.email}</p>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-8 border border-emerald-100">
              <Icon icon="lucide:shield-check" className="w-4 h-4 mr-1.5" />
              Verified Tenant
            </span>

            {/* Update Photo Button */}
            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all cursor-pointer group">
              {isUploading ? (
                <Icon icon="lucide:loader-2" className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Icon icon="lucide:image-plus" className="w-4.5 h-4.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
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
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full flex-1 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800"></div>

          <div className="flex items-start justify-between mb-8 border-b border-slate-100 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                <Icon icon="lucide:user" className="w-6 h-6 text-slate-600" />
              </div>
              <div className="pt-0.5">
                <h3 className="text-xl font-bold text-[#062F26]">Personal Information</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Manage your basic details and contact information.</p>
              </div>
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-xs"
              >
                <Icon icon="lucide:pencil" className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-xs"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Icon icon="lucide:calendar" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm transition-all ${isEditing
                      ? 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal'
                      : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                      }`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Gender
                </label>
                <div className="relative">
                  <Icon icon="lucide:user-circle" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm transition-all appearance-none ${isEditing
                      ? 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal'
                      : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                      }`}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <Icon icon="lucide:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-[#062F26] mb-6">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name of contact person"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => handleNestedChange(e, 'emergencyContact')}
                    disabled={!isEditing}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition-all ${isEditing
                      ? 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal'
                      : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                      }`}
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    placeholder="e.g. Father, Mother"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => handleNestedChange(e, 'emergencyContact')}
                    disabled={!isEditing}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition-all ${isEditing
                      ? 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal'
                      : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                      }`}
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Emergency contact number"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => handleNestedChange(e, 'emergencyContact')}
                    disabled={!isEditing}
                    className={`w-full border rounded-xl px-4 py-3 text-sm transition-all ${isEditing
                      ? 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal'
                      : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                      }`}
                  />
                </div>
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

export default TenantProfile;
