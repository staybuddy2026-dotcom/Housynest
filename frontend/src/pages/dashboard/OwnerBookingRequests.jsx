import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const OwnerBookingRequests = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { title: '1', subtitle: 'Total Pending', desc: 'Requires Action', icon: 'lucide:clock', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
    { title: '1', subtitle: 'Approved', desc: 'Awaiting Full Payment', icon: 'lucide:check-circle-2', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { title: '0', subtitle: 'Rejected', desc: 'Not Proceeded', icon: 'lucide:x-circle', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-100' },
    { title: '50%', subtitle: 'Conversion Rate', desc: 'Requests to Bookings', icon: 'lucide:percent', color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { title: '₹ 0', subtitle: 'Total Revenue', desc: 'Current Month', icon: 'lucide:indian-rupee', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
  ];

  const requests = [
    {
      id: 'BR-28',
      date: '05 Jan, 4:15 pm',
      customer: 'Geet',
      phone: '8857815102',
      property: 'Rohan PG Alexis',
      bed: 'A-2204 • Bed 2',
      moveIn: '2026-01-15',
      rent: '₹ 15,000',
      token: '₹2500',
      paymentStatus: 'Pending',
      status: 'PENDING APPROVAL',
    },
    {
      id: 'BR-27',
      date: '29 Dec, 11:01 am',
      customer: 'Niraj Rawool',
      phone: '8857815102',
      property: 'Rohan PG Elipse',
      bed: 'A-2204 • Bed 2',
      moveIn: '2025-01-15',
      rent: '₹ 25,000',
      token: '₹2500',
      paymentStatus: 'Pending',
      status: 'APPROVED',
    },
  ];

  const tabs = ['All', 'Pending Approval', 'Approved', 'Rejected'];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING APPROVAL':
        return 'bg-amber-100 text-amber-700';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredRequests = requests.filter(req => {
    let matchesTabLogic = true;
    if (activeTab === 'Pending Approval') matchesTabLogic = req.status === 'PENDING APPROVAL';
    else if (activeTab === 'Approved') matchesTabLogic = req.status === 'APPROVED';
    else if (activeTab === 'Rejected') matchesTabLogic = req.status === 'REJECTED';
    
    const matchesSearch = req.customer.toLowerCase().includes(searchQuery.toLowerCase()) || req.phone.includes(searchQuery) || req.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTabLogic && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full relative pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#062F26] mb-1 tracking-tight">Booking Requests</h1>
        <p className="text-sm text-slate-500 font-medium">Manage pre-booking applications. Approve requests to notify customers for full payment.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
          <div className="relative w-full sm:w-80 group">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-slate-100 flex overflow-x-auto hide-scrollbar bg-slate-50/30">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors relative ${
                activeTab === tab ? 'text-[#062F26]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#25D366] rounded-t-full shadow-[0_-2px_8px_rgba(37,211,102,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-white">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Request</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Customer</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Property / Bed</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Move - In Date</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rent / Token</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Payment</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F8F9FA] transition-colors group">
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-brand-teal transition-colors">{req.id}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{req.date}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{req.customer}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{req.phone}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{req.property}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{req.bed}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-700">{req.moveIn}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-800 text-sm">{req.rent}</div>
                    <div className="text-[11px] font-bold text-[#25D366] mt-1 tracking-wide">Token: {req.token}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold w-max">
                      <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
                      {req.paymentStatus}
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider ${getStatusStyle(req.status)} shadow-sm`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button className="text-[13px] font-bold text-blue-500 hover:text-blue-700 hover:underline underline-offset-2 transition-all">
                        View
                      </button>
                      {req.status === 'PENDING APPROVAL' && (
                        <>
                          <button className="text-[13px] font-bold text-emerald-500 hover:text-emerald-700 hover:underline underline-offset-2 transition-all">
                            Approve
                          </button>
                          <button className="text-[13px] font-bold text-red-500 hover:text-red-700 hover:underline underline-offset-2 transition-all">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No booking requests found.</p>
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

export default OwnerBookingRequests;
