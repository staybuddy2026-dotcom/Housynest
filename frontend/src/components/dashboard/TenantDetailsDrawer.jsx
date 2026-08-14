import React from 'react';
import { Icon } from '@iconify/react';
import { ReactLenis } from 'lenis/react';

const TenantDetailsDrawer = ({ selectedTenant, onClose, getPaymentBadge }) => {
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
            <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0 flex items-start justify-between z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-lg shadow-inner">
                  {selectedTenant.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#062F26]">{selectedTenant.name}</h2>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Icon icon="lucide:more-vertical" className="w-5 h-5" />
                    </button>
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
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <ReactLenis
              className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50"
              options={{ smoothTouch: true }}
            >
              <div className="p-6 pb-24 sm:pb-6 space-y-6">

                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
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
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
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
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
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
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
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
              </div>
            </ReactLenis>
          </>
        )}
      </div>
    </>
  );
};

export default TenantDetailsDrawer;
