import React from 'react';
import { Icon } from '@iconify/react';

const propertyStats = [
  { label: 'Room Type', value: 'Single Sharing' },
  { label: 'State', value: 'Karnataka' },
  { label: 'Monthly Rent', value: '₹10,000' },
  { label: 'Next Rent Due', value: '20 Jun 2026' }
];

const bottomStats = [
  { icon: 'lucide:calendar-clock', label: 'Move In Date', value: '20 May 2026' },
  { icon: 'lucide:calendar-days', label: 'No. of Months', value: '12 Months' },
  { icon: 'lucide:shield-check', label: 'Security Deposit', value: '₹10,000' },
  { icon: 'lucide:wallet', label: 'Total Due', value: '₹10,000' }
];

const quickActions = [
  { icon: 'lucide:wallet', title: 'Pay Rent', desc: 'View dues and make payment securely' },
  { icon: 'lucide:file-text', title: 'My Agreement', desc: 'View and download your rental agreement' },
  { icon: 'lucide:bell', title: 'Raise Complaint', desc: 'Report an issue or raise a complaint' },
  { icon: 'lucide:user', title: 'Contact Owner', desc: 'Get in touch with the property owner' }
];

const bookingSummary = [
  { label: 'Booking ID', value: 'HNPG20260520' },
  { label: 'Booking Date', value: '20 May 2026' },
  { label: 'Room', value: 'Room 302' },
  { label: 'Bed', value: 'Bed 1 (Near Window)' },
  { label: 'Floor', value: '2nd Floor' },
  { label: 'Property Type', value: 'PG' },
  { label: 'Stay Duration', value: <>20 May 2026 -<br />20 May 2027</>, isRightAligned: true },
  { label: 'Payment Method', value: 'UPI', hasTopBorder: true },
  { label: 'Payment Status', value: <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">Paid</span> }
];

const TenantBookings = () => {
  return (
    <div className="pb-10 mx-auto space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#062F26]">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your active stay and booking details</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* LEFT COLUMN - Main Content */}
        <div className="flex-1 space-y-4">

          {/* Property Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row gap-6 relative">
              {/* Image */}
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop"
                alt="PG Room"
                className="w-full sm:w-48 h-48 sm:h-auto object-cover rounded-xl shrink-0"
              />

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#062F26]">Royal Nest PG</h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                      <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400" />
                      Indiranagar, Bangalore
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {propertyStats.map((stat, idx) => (
                    <div key={idx}>
                      <p className="text-[11px] text-slate-400 font-semibold mb-1">{stat.label}</p>
                      <p className="text-sm font-bold text-slate-800">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="bg-slate-50/50 border-t border-slate-100 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-100">
              {bottomStats.map((stat, idx) => (
                <div key={idx} className={`flex items-center gap-3 ${idx === 0 ? 'pl-2 sm:pl-4' : 'pl-4'}`}>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon icon={stat.icon} className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">{stat.label}</p>
                    <p className="text-xs font-bold text-[#062F26]">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold text-[#062F26] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-[#062F26] group-hover:text-white transition-colors">
                      <Icon icon={action.icon} className="w-6 h-6" />
                    </div>
                    <Icon icon="lucide:chevron-right" className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#062F26] text-sm mb-1">{action.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Due Banner */}
          <div>
            <h3 className="text-lg font-bold text-[#062F26] mb-4">Upcoming Due</h3>
            <div className="bg-[#EAF5F2]/50 border border-emerald-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full sm:w-auto flex-1">

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Icon icon="lucide:calendar" className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Next Rent Due On</p>
                    <p className="text-sm font-bold text-[#062F26]">20 Jun 2026</p>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                <div>
                  <p className="text-xs text-slate-500 font-medium mb-0.5">Amount Due</p>
                  <p className="text-sm font-bold text-[#062F26]">₹10,000</p>
                </div>

                <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Upcoming</span>
                </div>
              </div>

              <button className="w-full sm:w-auto px-8 py-2.5 bg-[#062F26] text-white font-bold text-sm rounded-lg cursor-pointer shadow-md hover:bg-[#08483B] transition-colors shrink-0">
                Pay Now
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - Sidebar */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 space-y-4">

          {/* Booking Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#062F26] mb-6">Booking Summary</h3>

            <div className="space-y-4">
              {bookingSummary.map((item, idx) => (
                <div key={idx} className={`flex justify-between items-${item.isRightAligned ? 'start' : 'center'} text-sm ${item.hasTopBorder ? 'pt-2 border-t border-slate-100' : ''}`}>
                  <span className="text-slate-500 font-medium">{item.label}</span>
                  <span className={`font-bold text-slate-800 ${item.isRightAligned ? 'text-right' : ''}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#062F26] mb-2">Need Help?</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Our support team is here to help you.
            </p>
            <button className="w-full py-3 border border-[#0AA87D] text-[#0AA87D] font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
              <Icon icon="lucide:headphones" className="w-4 h-4" />
              Contact Support
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TenantBookings;
