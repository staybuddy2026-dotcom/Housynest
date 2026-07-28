import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const OwnerBookings = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { title: '11', subtitle: 'Total Pending', desc: 'Requires Action', icon: 'lucide:clock', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
    { title: '5', subtitle: 'Approved', desc: 'Awaiting Full Payment', icon: 'lucide:check-circle-2', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { title: '3', subtitle: 'Active', desc: 'Currently Staying', icon: 'lucide:home', color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { title: '2', subtitle: 'Moved Out', desc: 'Past Bookings', icon: 'lucide:log-out', color: 'text-slate-500', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
  ];

  const bookings = [
    {
      id: 'BK-1204',
      date: '10 Oct, 8:45 pm',
      tenant: 'Geet',
      phone: '8857815102',
      property: 'Rohan PG Alexis',
      bed: 'A-2204 • Bed 2',
      moveIn: '2025-01-15',
      movedOut: null,
      rent: '₹35,000',
      deposit: 'Token: ₹2500',
      status: 'CONFIRMED',
      source: 'REQUEST',
    },
    {
      id: 'BK-8821',
      date: '12 Oct, 4:00 pm',
      tenant: 'Rahul Sharma',
      phone: '9876543210',
      property: 'Rohan PG Elipse',
      bed: '302-A • Bed 1',
      moveIn: '2025-01-20',
      movedOut: 'Moved-out: 2025-10-20',
      rent: '₹25,000',
      deposit: 'Token: ₹2500',
      status: 'PENDING',
      source: 'DIRECT',
    },
    {
      id: 'BK-9932',
      date: '15 Oct, 2:30 pm',
      tenant: 'Priya Patel',
      phone: '9876543111',
      property: 'Sunshine PG',
      bed: 'Room 4A • Bed 1',
      moveIn: '2025-02-01',
      movedOut: null,
      rent: '₹12,000',
      deposit: 'Token: ₹1000',
      status: 'ACTIVE',
      source: 'DIRECT',
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase();
    return (
      booking.tenant.toLowerCase().includes(query) ||
      booking.phone.includes(query) ||
      booking.id.toLowerCase().includes(query) ||
      booking.property.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full relative pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#062F26] mb-1 tracking-tight">Bookings</h1>
          <p className="text-sm text-slate-500 font-medium">Active bookings created after approval of booking requests or via direct booking.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#062F26] hover:bg-brand-teal text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm shrink-0">
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Create Booking
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-extrabold text-[#062F26]">{stat.title}</h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${stat.bgColor} ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon icon={stat.icon} className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{stat.subtitle}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          {/* Search */}
          <div className="relative w-full sm:w-96 group">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, phone, booking id, or property..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-white">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Booking</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Tenant</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Property / Bed</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move - In Date</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent / Deposit</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer">
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-brand-teal transition-colors">{booking.id}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{booking.date}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{booking.tenant}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{booking.phone}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{booking.property}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{booking.bed}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-700">{booking.moveIn}</div>
                    {booking.movedOut && (
                      <div className="text-[11px] font-medium text-slate-400 mt-1">{booking.movedOut}</div>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{booking.rent}</div>
                    <div className="text-[11px] font-bold text-[#25D366] mt-1 tracking-wide">{booking.deposit}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getStatusStyle(booking.status)} shadow-sm`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider w-max border border-slate-200">
                      {booking.source}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No bookings found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerBookings;
