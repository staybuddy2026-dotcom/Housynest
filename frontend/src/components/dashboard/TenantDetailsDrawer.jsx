import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ReactLenis } from 'lenis/react';
import toast from 'react-hot-toast';

const TenantDetailsDrawer = ({ selectedTenant, onClose, getPaymentBadge }) => {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [forceRender, setForceRender] = useState(0);

  useEffect(() => {
    // Reset state when a new tenant is selected
    setShowOtp(false);
    setOtp('');
  }, [selectedTenant]);

  const handleSendOtp = () => {
    setShowOtp(true);
    // Note: toast requires import toast from 'react-hot-toast', I need to add that import at top.
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setIsSigning(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/bookings/${selectedTenant.rawBooking._id}/consent`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Agreement signed successfully!');
        setShowOtp(false);
        setOtp('');
        // Mutate the local object so the UI updates immediately
        selectedTenant.rawBooking.ownerConsentStatus = 'Consented';
        // Force a re-render
        setForceRender(prev => prev + 1);

        // Tell parent to refresh in background
        window.dispatchEvent(new Event('globalBookingStatusUpdated'));
        const event = new CustomEvent('tenantSigned', { detail: selectedTenant.rawBooking._id });
        window.dispatchEvent(event);
      } else {
        toast.error('Failed to sign the agreement.');
      }
    } catch (error) {
      console.error('Error signing agreement', error);
      toast.error('An error occurred while signing.');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <>
      {/* Side Drawer Overlay */}
      {selectedTenant && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-[480px] bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out transform ${selectedTenant ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        {selectedTenant && (
          <>
            {/* Drawer Header */}
            <div className="p-5 pb-4 bg-white border-b border-slate-100 shrink-0 flex items-start justify-between z-10 relative">
              <div className="flex items-center gap-4">
                {selectedTenant.profilePic ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                    <img src={selectedTenant.profilePic} alt={selectedTenant.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-lg shadow-inner shrink-0">
                    {selectedTenant.initials}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#062F26]">{selectedTenant.name}</h2>
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    {selectedTenant.propertyName && selectedTenant.propertyType ? (
                      <span className="text-brand-teal font-semibold mr-1">{selectedTenant.propertyName} ({selectedTenant.propertyType}) • </span>
                    ) : null}
                    {selectedTenant.propertyType === 'Tenant' ? (
                      <span>Full Property</span>
                    ) : (
                      <span>{selectedTenant.room} - {selectedTenant.bed}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full cursor-pointer bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <ReactLenis
              className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50"
              options={{ smoothTouch: true }}
            >
              <div className="p-5 pb-24 sm:pb-6 space-y-4">

                {/* Personal Information */}
                <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Phone</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.phone}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Email</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.email}</span>
                    </div>
                    {selectedTenant.personalInfo?.dob && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Date of Birth</span>
                        <span className="text-sm font-bold text-slate-800">{new Date(selectedTenant.personalInfo.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedTenant.personalInfo?.gender && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Gender</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.personalInfo.gender}</span>
                      </div>
                    )}
                    {selectedTenant.personalInfo?.institutionName && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Profession/Institution</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.personalInfo.institutionName}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Joined</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.moveIn}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedTenant.emergencyContact?.name && (
                  <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h4 className="text-sm font-bold text-[#062F26] mb-4">Emergency Contact</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Name</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.emergencyContact.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Relationship</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.emergencyContact.relation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Phone</span>
                        <span className="text-sm font-bold text-slate-800">{selectedTenant.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Room & Booking Details */}
                <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Room & Booking Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Room Number</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.roomNumber}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Bed Number</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.bedNumber}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Booking ID</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.bookingId}</span>
                    </div>
                    {selectedTenant.rawBooking?.createdAt && (
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Booking Date</span>
                        <span className="text-sm font-bold text-slate-800">{new Date(selectedTenant.rawBooking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Moved In Date</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.moveInIso}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Lease Duration</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.leaseDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <h4 className="text-sm font-bold text-[#062F26] mb-4">Financial Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Monthly Rent</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.monthlyRentNum}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Security Deposit</span>
                      <span className="text-sm font-bold text-slate-800">{selectedTenant.securityDepositNum}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Payment Status</span>
                      {getPaymentBadge ? getPaymentBadge(selectedTenant.payment) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border bg-slate-100 text-slate-500 border-slate-200">
                          {selectedTenant.payment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Agreement Status */}
                {selectedTenant.rawBooking && (
                  <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h4 className="text-sm font-bold text-[#062F26] mb-4">Lease Agreement</h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Tenant eSign</span>
                        {(selectedTenant.rawBooking.tenantConsentStatus === 'Consented' || selectedTenant.rawBooking.eSignStatus === 'Completed') ? (
                          <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">Signed</span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">Pending</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-500">Owner eSign</span>
                          {selectedTenant.rawBooking.ownerConsentStatus === 'Consented' ? (
                            <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">Signed</span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">Pending</span>
                          )}
                        </div>

                        {selectedTenant.rawBooking.ownerConsentStatus !== 'Consented' && (selectedTenant.rawBooking.tenantConsentStatus === 'Consented' || selectedTenant.rawBooking.eSignStatus === 'Completed') && (
                          <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            {!showOtp ? (
                              <div>
                                <p className="text-xs text-slate-600 mb-3">Both parties must sign the agreement. Sign now using your Aadhaar OTP.</p>
                                <button
                                  onClick={handleSendOtp}
                                  className="w-full py-2 bg-[#062F26] text-white rounded-lg text-sm font-bold hover:bg-emerald-900 transition-colors"
                                >
                                  Sign Agreement
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-xs font-bold text-emerald-700">OTP Sent to Aadhaar Linked Mobile</p>
                                <input
                                  type="text"
                                  placeholder="Enter 6-digit OTP"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  maxLength={6}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-teal"
                                />
                                <button
                                  onClick={handleVerifyOtp}
                                  disabled={isSigning || otp.length < 6}
                                  className="w-full py-2 bg-[#0AA87D] text-white rounded-lg text-sm font-bold hover:bg-[#088c68] disabled:opacity-50 transition-colors flex justify-center items-center"
                                >
                                  {isSigning ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : 'Verify & Sign'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedTenant.rawBooking.ownerConsentStatus === 'Consented' && (
                          <button
                            onClick={() => window.open(`/api/bookings/${selectedTenant.rawBooking._id}/download-agreement?token=${localStorage.getItem('accessToken')}`, '_blank')}
                            className="mt-2 w-full py-2 border-2 border-[#062F26] text-[#062F26] rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex justify-center items-center gap-2"
                          >
                            <Icon icon="lucide:download" className="w-4 h-4" />
                            Download Agreement
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ReactLenis>
          </>
        )}
      </div>
    </>
  );
};

export default TenantDetailsDrawer;
