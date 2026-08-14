import React, { useState, useEffect, Fragment } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import socket from '../../lib/socket';

const tableHeaders = [
  { label: 'Property Details', align: 'left' },
  { label: 'Unit Details', align: 'left' },
  { label: 'Date Sent', align: 'left' },
  { label: 'Message Overview', align: 'left' },
  { label: 'Status', align: 'center' },
  { label: 'Actions', align: 'right' }
];

const TenantRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/leads/tenant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const mappedRequests = data.map(inq => ({
            id: inq._id,
            title: !inq.propertyId ? 'Deleted Property' : (inq.propertyId.pgName || inq.propertyId.societyName || (inq.propertyId.bhkType ? `${inq.propertyId.bhkType} ${inq.propertyId.propertyCategory}` : inq.propertyId.propertyCategory) || 'Unknown Property'),
            status: inq.status,
            date: new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date(inq.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            roomType: inq.propertyId?.propertyType || 'N/A',
            moveIn: inq.moveInDate ? new Date(inq.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
            budget: inq.propertyId?.monthlyRent ? `₹${inq.propertyId.monthlyRent}` : (inq.propertyId?.rooms?.[0]?.rentPerBed ? `₹${inq.propertyId.rooms[0].rentPerBed}` : 'N/A'),
            subject: inq.subject || 'N/A',
            occupants: inq.occupants || 'N/A',
            gender: inq.gender || 'Any',
            message: inq.message,
            propertyImage: inq.propertyId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
            location: inq.propertyId?.locality ? `${inq.propertyId.locality}, ${inq.propertyId.city}` : (inq.propertyId?.city || 'Location unavailable'),
            owner: inq.ownerId,
            floorName: inq.floorName || null,
            roomName: inq.roomName || null,
            bedName: inq.bedName || null,
            contactMethod: inq.contactMethod || 'N/A'
          }));
          setRequests(mappedRequests);
        } else {
          toast.error('Failed to fetch requests');
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        toast.error('Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    const handleLeadSent = (newInq) => {
      fetchRequests();
    };

    socket.on('leadSent', handleLeadSent);

    return () => {
      socket.off('leadSent', handleLeadSent);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm hover:bg-emerald-100 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">New</span>
          </div>
        );
      case 'Contacted':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-sm hover:bg-blue-100 transition-colors">
            <Icon icon="lucide:phone-outgoing" className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Contacted</span>
          </div>
        );
      case 'In Discussion':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm hover:bg-amber-100 transition-colors">
            <Icon icon="lucide:messages-square" className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">In Discussion</span>
          </div>
        );
      case 'Closed':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
            <Icon icon="lucide:check-circle-2" className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Closed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full  font-sans animate-fadeIn pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm group cursor-pointer hover:bg-emerald-100 transition-colors">
            <Icon icon="lucide:message-square" className="w-5 h-5 text-emerald-600 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">My Requests</h1>
            <p className="text-sm text-slate-500 font-medium">Track your property leads and requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-bold text-slate-700">
          <Icon icon="lucide:message-square" className="w-4 h-4 text-brand-teal" />
          Total Requests: <span className="text-[#062F26]">{requests.length}</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block flex-1 mb-10 bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className={`px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${header.align === 'center' ? 'text-center' : header.align === 'right' ? 'text-right' : ''}`}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Loading your requests...</p>
                  </td>
                </tr>
              ) : requests.length > 0 ? (
                requests.map((request) => {
                  const isExpanded = expandedId === request.id;
                  return (
                    <Fragment key={request.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : request.id)}
                        className={`transition-colors duration-300 cursor-pointer group ${isExpanded ? 'bg-brand-teal/5' : 'bg-white hover:bg-slate-50/80'}`}
                      >
                        <td className="px-6 py-3 align-middle">
                          <div className="flex items-center gap-5">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden shadow-sm shrink-0">
                              <img src={request.propertyImage} alt={request.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 border border-black/5 rounded-2xl"></div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-[#062F26] text-base group-hover:text-brand-teal transition-colors">{request.title}</p>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${request.roomType === 'PG' ? 'bg-purple-100 text-purple-700' : request.roomType === 'Tenant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {request.roomType}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-brand-teal/70" />
                                {request.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {request.roomType === 'Tenant' ? (
                            <span className="text-xs font-bold text-slate-700">Entire Property</span>
                          ) : (request.floorName || request.roomName || request.bedName) ? (
                            <div className="flex flex-col gap-1.5 items-start">
                              {request.floorName && <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-wider">{request.floorName}</span>}
                              {(request.roomName || request.bedName) && (
                                <div className="flex gap-1.5 items-center">
                                  {request.roomName && <span className="px-2 py-0.5 bg-brand-teal/5 border border-brand-teal/20 text-brand-teal rounded-md text-[9px] font-bold uppercase tracking-wider">{request.roomName}</span>}
                                  {request.bedName && <span className="px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-600 rounded-md text-[9px] font-bold uppercase tracking-wider">{request.bedName}</span>}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-800">{request.date}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1">{request.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle max-w-[320px]">
                          <div className="flex flex-col">
                            <p className="text-[13px] font-bold text-brand-teal line-clamp-1 mb-1.5">Re: {request.subject}</p>
                            <p className="text-[13px] font-medium text-slate-600 line-clamp-1 group-hover:text-slate-800 transition-colors leading-relaxed">{request.message}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                          <div className="inline-block scale-95 origin-center">
                            {getStatusBadge(request.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <button className={`px-4 py-2 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all duration-500 inline-flex items-center justify-center gap-2 ${isExpanded ? 'bg-brand-teal text-white shadow-[0_4px_20px_rgba(10,168,125,0.3)] hover:bg-[#062F26] hover:-translate-y-0.5' : 'bg-slate-100 text-slate-600 hover:bg-brand-teal hover:text-white shadow-sm hover:shadow-[0_4px_15px_rgba(10,168,125,0.2)] hover:-translate-y-0.5'}`}>
                            {isExpanded ? 'Close Details' : 'View Details'}
                            <Icon icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Details Row with Smooth Animation */}
                      <tr>
                        <td colSpan="6" className="p-0 border-none bg-slate-50/60">
                          <div className={`grid transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                              <div className="p-5 shadow-inner border-b border-slate-200 w-full">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                                  {/* Message Full Details */}
                                  <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 text-brand-teal">
                                      <Icon icon="lucide:message-square" className="w-4 h-4" />
                                      <h4 className="font-bold text-xs uppercase tracking-wider">Full Request Message</h4>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[14px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap relative flex-1">
                                      <Icon icon="lucide:quote" className="absolute top-3 right-3 w-8 h-8 text-slate-200/60 -z-0" />
                                      <span className="relative z-10 italic">"{request.message}"</span>
                                    </div>
                                  </div>

                                  {/* Requirements & Info */}
                                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                                    {request.owner && (
                                      <>
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <Icon icon="lucide:shield-check" className="w-4 h-4 text-emerald-600" />
                                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Owner Contact</h4>
                                          </div>
                                          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 rounded-xl border border-emerald-100/50 shadow-sm">
                                            <a href={`tel:${request.owner.phone}`} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md active:scale-95 shrink-0">
                                              <Icon icon="lucide:phone-call" className="w-4 h-4" />
                                            </a>
                                            <div>
                                              <p className="text-sm font-bold text-[#062F26]">{request.owner.fullName || 'Owner'}</p>
                                              <p className="text-xs font-bold text-emerald-700">{request.owner.phone || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="h-px bg-slate-100 w-full my-0"></div>
                                      </>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="flex flex-col gap-1 bg-blue-50/40 p-3 rounded-xl border border-blue-100/30">
                                        <div className="flex items-center gap-1.5">
                                          <Icon icon="lucide:calendar-days" className="w-3.5 h-3.5 text-blue-500" />
                                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Move-in</p>
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-800">{request.moveIn}</p>
                                      </div>

                                      <div className="flex flex-col gap-1 bg-purple-50/40 p-3 rounded-xl border border-purple-100/30">
                                        <div className="flex items-center gap-1.5">
                                          <Icon icon="lucide:users" className="w-3.5 h-3.5 text-purple-500" />
                                          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Occupants</p>
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{request.occupants} <span className="text-[10px] font-medium text-slate-500">({request.gender})</span></p>
                                      </div>

                                      <div className="col-span-2 flex flex-col gap-1 bg-amber-50/40 p-3 rounded-xl border border-amber-100/30">
                                        <div className="flex items-center gap-1.5">
                                          <Icon icon="lucide:message-circle" className="w-3.5 h-3.5 text-amber-500" />
                                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Preferred Contact</p>
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-800 capitalize">{request.contactMethod}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-28 text-center">
                    <Icon icon="lucide:message-circle-x" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Requests Yet</h3>
                    <p className="text-sm text-slate-500">You haven't sent any leads or booking requests yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Fallback for small screens) */}
      <div className="lg:hidden grid grid-cols-1 gap-6 pb-20">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500 text-sm font-medium">
            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-brand-teal mb-3" />
            <p className="text-base">Loading your requests...</p>
          </div>
        ) : requests.length > 0 ? (
          requests.map((request) => {
            const isExpanded = expandedId === request.id;
            return (
              <div
                key={request.id}
                className={`bg-white rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col ${isExpanded ? 'border-brand-teal shadow-[0_8px_30px_rgba(10,168,125,0.12)] -translate-y-1' : 'border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-brand-teal/40 hover:-translate-y-1 group'}`}
              >
                {/* Header (Image + Title) */}
                <div className="relative h-48 shrink-0 overflow-hidden">
                  <img src={request.propertyImage} alt={request.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#062F26]/90 via-[#062F26]/20 to-transparent transition-opacity duration-300"></div>

                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="absolute bottom-4 left-5 right-5 z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white line-clamp-1 shadow-sm">{request.title}</h3>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider border ${request.roomType === 'PG' ? 'bg-purple-500/80 text-white border-purple-400/50' : request.roomType === 'Tenant' ? 'bg-indigo-500/80 text-white border-indigo-400/50' : 'bg-slate-500/80 text-white border-slate-400/50'} backdrop-blur-sm`}>
                        {request.roomType}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-emerald-100 flex items-center gap-1.5 drop-shadow-sm mb-2">
                      <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{request.location}</span>
                    </p>
                    {request.roomType === 'Tenant' ? (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/10">Entire Property</span>
                      </div>
                    ) : (request.floorName || request.roomName || request.bedName) && (
                      <div className="flex flex-wrap gap-1.5">
                        {request.floorName && <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/10">{request.floorName}</span>}
                        {request.roomName && <span className="px-2 py-0.5 bg-brand-teal/80 backdrop-blur-sm text-white rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/20">{request.roomName}</span>}
                        {request.bedName && <span className="px-2 py-0.5 bg-purple-500/80 backdrop-blur-sm text-white rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/20">{request.bedName}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body (Stats) */}
                <div className="p-6 flex-1 flex flex-col bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100/50 hover:bg-emerald-50/50 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Icon icon="lucide:indian-rupee" className="w-3 h-3" /> Budget
                      </p>
                      <p className="text-sm font-bold text-[#062F26]">{request.budget} <span className="text-[10px] font-medium text-slate-500">/mo</span></p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100/50 hover:bg-emerald-50/50 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Icon icon="lucide:calendar-clock" className="w-3 h-3" /> Sent On
                      </p>
                      <p className="text-sm font-bold text-[#062F26]">{request.date}</p>
                    </div>
                  </div>

                  <div className="mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[11px] font-bold text-brand-teal mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <Icon icon="lucide:message-square" className="w-3.5 h-3.5" />
                      Sub: {request.subject}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {request.message}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out bg-slate-50/30 ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 border-t border-slate-100">

                    <div className="mb-6 mt-6">
                      <h4 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Icon icon="lucide:align-left" className="w-4 h-4 text-brand-teal" /> Full Message
                      </h4>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap relative shadow-sm">
                        <Icon icon="lucide:quote" className="absolute top-3 right-3 w-8 h-8 text-slate-100 -z-0" />
                        <span className="relative z-10 italic">"{request.message}"</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {request.owner && (
                        <div className="col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100/50 flex items-center justify-between shadow-sm">
                          <div>
                            <h4 className="font-bold text-[10px] text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" /> Owner Contact
                            </h4>
                            <p className="text-sm font-bold text-[#062F26]">{request.owner.fullName || 'Owner'}</p>
                            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">{request.owner.phone || 'N/A'}</p>
                          </div>
                          <a href={`tel:${request.owner.phone}`} className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95">
                            <Icon icon="lucide:phone-call" className="w-5 h-5" />
                          </a>
                        </div>
                      )}

                      <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/50">
                        <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Icon icon="lucide:calendar-days" className="w-3.5 h-3.5" /> Move-in
                        </h4>
                        <p className="text-sm font-bold text-[#062F26]">{request.moveIn}</p>
                      </div>

                      <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100/50">
                        <h4 className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Icon icon="lucide:users" className="w-3.5 h-3.5" /> Occupants
                        </h4>
                        <p className="text-sm font-bold text-[#062F26] truncate">{request.occupants} <span className="text-[11px] font-medium text-slate-500">({request.gender})</span></p>
                      </div>

                      <div className="col-span-2 bg-amber-50/60 p-4 rounded-2xl border border-amber-100/50">
                        <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Icon icon="lucide:message-circle" className="w-3.5 h-3.5" /> Preferred Contact
                        </h4>
                        <p className="text-sm font-bold text-[#062F26] capitalize">{request.contactMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand Toggle Button */}
                <div className="p-6 pt-0 mt-auto bg-white relative z-10 rounded-b-3xl">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                    className={`w-full py-3.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border ${isExpanded
                      ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      : 'bg-white border-slate-200 text-[#062F26] hover:border-brand-teal hover:bg-brand-teal/5 shadow-sm hover:shadow-md'
                      }`}
                  >
                    {isExpanded ? 'Hide Details' : 'View Full Details'}
                    <Icon icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} className={`w-4 h-4 transition-transform ${isExpanded ? 'text-slate-500' : 'text-brand-teal'}`} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-28 text-center bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-28 h-28 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-8 border border-slate-200 shadow-inner">
              <Icon icon="lucide:message-circle-x" className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-[#062F26] mb-3 tracking-tight">No Requests Yet</h3>
            <p className="text-base text-slate-500 max-w-[320px] mx-auto leading-relaxed">You haven't sent any leads or requests for properties yet. Start exploring and contact owners!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TenantRequests;
