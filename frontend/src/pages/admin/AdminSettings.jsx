import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

const AdminSettings = () => {
  // Mock state for forms
  const [profileForm, setProfileForm] = useState({
    name: 'Admin User',
    email: 'admin@housynest.com',
    profilePic: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileForm({
        name: parsedUser.fullName || parsedUser.name || 'Admin User',
        email: parsedUser.email || 'admin@housynest.com',
        profilePic: parsedUser.profilePic || '',
      });
    }
  }, []);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log('Saving profile:', profileForm);
    alert('Profile updated successfully!');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/upload-profile-pic', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setProfileForm({ ...profileForm, profilePic: data.profilePic });

        // Update local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.profilePic = data.profilePic;
          localStorage.setItem('user', JSON.stringify(parsedUser));

          // Trigger storage event so other tabs/components can sync if needed
          window.dispatchEvent(new Event('storage'));
        }

        alert('Profile picture updated successfully!');
      } else {
        alert(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('An error occurred while uploading');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('An error occurred while updating the password');
    }
  };

  return (
    <div className="max-w-350 3xl:max-w-420 mx-auto pb-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pt-2">
        <div className="flex items-start gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
            <Icon icon="lucide:settings" className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#062F26]">Settings</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Manage your account preferences and security.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Profile Settings */}
        <div className="lg:col-span-5 space-y-8">

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center gap-3">
              <Icon icon="lucide:user" className="w-5 h-5 text-[#062F26]" />
              <h2 className="text-base font-bold text-[#062F26]">Personal Information</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 sm:p-6">

              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-6 sm:mb-8 text-center sm:text-left">
                <div className="w-20 h-20 rounded-full bg-[#062F26] flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden relative group">
                  {profileForm.profilePic ? (
                    <img src={profileForm.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profileForm.name.charAt(0).toUpperCase()
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Icon icon="lucide:loader" className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800">{profileForm.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5 mb-3">Super Administrator</p>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`text-xs font-bold text-[#059669] hover:text-[#047857] transition-colors border border-[#059669]/20 bg-emerald-50 px-3 py-1.5 rounded-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? 'Uploading...' : 'Change Avatar'}
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#062F26]/20 focus:border-[#062F26] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#062F26]/20 focus:border-[#062F26] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#062F26] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#084236] transition-colors shadow-sm"
                >
                  <Icon icon="lucide:save" className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Security Settings */}
        <div className="lg:col-span-7 space-y-8">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center gap-3">
              <Icon icon="lucide:shield-check" className="w-5 h-5 text-[#059669]" />
              <h2 className="text-base font-bold text-[#062F26]">Security & Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="p-4 sm:p-6">

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 mb-8">
                <Icon icon="lucide:info" className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                  Ensure your account is using a long, random password to stay secure. We recommend using a password manager.
                </p>
              </div>

              <div className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Icon icon="lucide:lock" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#062F26]/20 focus:border-[#062F26] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Icon icon="lucide:key" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#062F26]/20 focus:border-[#062F26] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Icon icon="lucide:check-circle" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#062F26]/20 focus:border-[#062F26] transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#059669] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#047857] transition-colors shadow-sm"
                >
                  <Icon icon="lucide:refresh-ccw" className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminSettings;
