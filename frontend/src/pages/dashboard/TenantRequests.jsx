import React, { useState, useEffect, Fragment } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import socket from '../../lib/socket';

const TenantRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/inquiries/tenant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const mappedRequests = data.map(inq => ({
            id: inq._id,
            title: !inq.propertyId ? 'Deleted Property' : (inq.propertyId.pgName || (inq.propertyId.bhkType ? `${inq.propertyId.bhkType} ${inq.propertyId.propertyCategory}` : inq.propertyId.propertyCategory) || 'Unknown Property'),
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
            owner: inq.ownerId
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

    const handleInquirySent = (newInq) => {
      fetchRequests();
    };

    socket.on('inquirySent', handleInquirySent);

    return () => {
      socket.off('inquirySent', handleInquirySent);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">New</span>;
      case 'Contacted':
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">Contacted</span>;
      case 'In Discussion':
        return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">In Discussion</span>;
      case 'Closed':
        return <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans animate-fadeIn pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 px-6 pt-6 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#062F26] tracking-tight">My Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Track your property inquiries and requests</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700">
          <Icon icon="lucide:message-square" className="w-4 h-4 text-brand-teal" />
          Total Requests: <span className="text-[#062F26]">{requests.length}</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-white sticky top-0 z-20">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Property</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Date Sent</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Message</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-medium">
                  <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin mx-auto text-brand-teal mb-2" />
                  <p>Loading your requests...</p>
                </td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request) => {
                const isExpanded = expandedId === request.id;

                return (
                  <Fragment key={request.id}>
                    <tr className={`transition-colors group ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/50 border-b border-slate-100'}`}>
                      
                      {/* Property */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            <img src={request.propertyImage} alt={request.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#062F26] group-hover:text-brand-teal transition-colors">{request.title}</p>
                            <p className="text-xs font-medium text-slate-500 my-0.5 flex items-center gap-1">
                              <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-slate-400" />
                              {request.location}
                            </p>
                            <p className="text-xs font-medium text-slate-600">
                              <span className="font-bold">{request.budget}</span> / month
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date Sent */}
                      <td className="py-4 px-6 align-middle">
                        <p className="text-xs font-bold text-slate-700">{request.date}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{request.time}</p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 align-middle">
                        {getStatusBadge(request.status)}
                      </td>

                      {/* Message */}
                      <td className="py-4 px-6 align-middle max-w-50">
                        <p className="text-xs font-bold text-brand-teal truncate mb-1" title={request.subject}>
                          Sub: {request.subject}
                        </p>
                        <p className="text-xs font-medium text-slate-600 truncate leading-relaxed" title={request.message}>
                          {request.message}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 align-middle text-right">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : request.id)}
                          className={`px-4 py-2 border text-xs font-bold rounded-lg transition-colors ${isExpanded
                            ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            : 'bg-white border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white'
                            }`}
                        >
                          {isExpanded ? 'Close Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    <tr>
                      <td colSpan="5" className="p-0 border-none">
                        <div className={`grid transition-[grid-template-rows,opacity] duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-b border-slate-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            <div className="bg-slate-50/80 p-6 shadow-inner">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">

                                {/* Message Full Details */}
                                <div className="md:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                  <div className="flex items-center gap-2 mb-3 text-brand-teal">
                                    <Icon icon="lucide:message-square" className="w-5 h-5" />
                                    <h4 className="font-bold text-sm">Your Request Message</h4>
                                  </div>
                                  <p className="text-sm font-bold text-slate-800 mb-1">Subject: {request.subject}</p>
                                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {request.message}
                                  </p>
                                </div>

                                {/* Requirements & Info */}
                                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                                  
                                  {request.owner && (
                                    <>
                                      <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-1">
                                        <Icon icon="lucide:user" className="w-5 h-5 text-emerald-600" />
                                        Owner Contact
                                      </h4>
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                          <Icon icon="lucide:phone" className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-slate-500 uppercase">{request.owner.fullName || 'Owner'}</p>
                                          <p className="text-sm font-semibold text-slate-800">{request.owner.phone || 'Phone unavailable'}</p>
                                        </div>
                                      </div>
                                      <div className="h-px bg-slate-100 w-full my-1"></div>
                                    </>
                                  )}

                                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-1">
                                    <Icon icon="lucide:list-checks" className="w-5 h-5 text-brand-teal" />
                                    Your Requirements
                                  </h4>

                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                      <Icon icon="lucide:calendar-days" className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase">Move-in Date</p>
                                      <p className="text-sm font-semibold text-slate-800">{request.moveIn}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                      <Icon icon="lucide:users" className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase">Occupants & Gender</p>
                                      <p className="text-sm font-semibold text-slate-800">{request.occupants} Person(s) • {request.gender}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                      <Icon icon="lucide:home" className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase">Property Type</p>
                                      <p className="text-sm font-semibold text-slate-800">{request.roomType}</p>
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
                <td colSpan="5" className="py-16 text-center">
                  <Icon icon="lucide:message-circle-x" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No Requests Yet</h3>
                  <p className="text-sm text-slate-500">You haven't sent any inquiries or booking requests yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantRequests;
