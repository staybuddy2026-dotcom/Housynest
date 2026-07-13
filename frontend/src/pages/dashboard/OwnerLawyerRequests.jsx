import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

import toast from 'react-hot-toast';

const LawyerRequestCard = ({ request, onUpdateStatus, onDeclineRequest }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const lawyer = request.lawyer || {};
  const name = lawyer.fullName || 'Unknown Lawyer';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const date = new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const memberSince = new Date(lawyer.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const experience = lawyer.lawyerDetails?.experience || 0;
  const barCouncilNo = lawyer.lawyerDetails?.barCouncilNumber || 'N/A';
  const certificateImg = lawyer.lawyerDetails?.certificate || 'https://via.placeholder.com/200x120?text=No+Certificate';

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 mb-4 flex flex-col gap-6 group overflow-hidden relative">
      {/* Subtle background glow for pending requests */}
      {request.status === 'pending' && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EAF5F2] text-[#062F26] flex items-center justify-center font-bold text-lg uppercase shrink-0 border border-[#062F26]/20">
            {lawyer.profilePic ? (
              <img src={lawyer.profilePic} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-[17px] font-bold text-[#062F26] capitalize tracking-tight group-hover:text-brand-primary transition-colors">{name}</h3>
              {lawyer.lawyerStatus === 'approved' && (
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50/80 backdrop-blur-sm border border-emerald-100/50 px-2 py-0.5 rounded-full">
                  <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Icon icon="lucide:mail" className="w-3.5 h-3.5" />
                {lawyer.email}
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="lucide:phone" className="w-3.5 h-3.5" />
                {lawyer.phone}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 font-medium mt-2">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                <Icon icon="lucide:briefcase" className="w-3.5 h-3.5 text-slate-400" />
                {experience} yrs experience
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                <Icon icon="lucide:award" className="w-3.5 h-3.5 text-slate-400" />
                Bar #{barCouncilNo}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                <Icon icon="lucide:calendar-clock" className="w-3.5 h-3.5 text-slate-400" />
                {date}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto relative z-10">
          {request.status === 'accepted' && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl w-fit shadow-sm">
              <Icon icon="lucide:check-circle-2" className="w-4.5 h-4.5" />
              Accepted
            </span>
          )}

          {request.status === 'rejected' && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl w-fit shadow-sm">
              <Icon icon="lucide:ban" className="w-4.5 h-4.5" />
              Declined
            </span>
          )}

          {request.status === 'pending' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDeclineRequest(request._id)}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 px-4 py-2 rounded-xl transition-all duration-300 w-fit hover:shadow-sm"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={() => onUpdateStatus(request._id, 'accepted')}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#062F26] hover:bg-[#062F26]/90 px-5 py-2 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#062F26]/20 w-fit relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 w-full translate-x-[-100%] hover:animate-[shimmer_1.5s_infinite]"></div>
                <Icon icon="lucide:check" className="w-4 h-4" />
                Accept
              </button>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#062F26] px-2 py-1 rounded-lg transition-colors w-full md:w-auto justify-center mt-1 group/btn"
          >
            {isExpanded ? 'Hide details' : 'View full profile'}
            <Icon icon="lucide:chevron-down" className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 pt-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              {/* Left Column */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                  <Icon icon="lucide:user" className="w-3.5 h-3.5" />
                  Lawyer Details
                </h4>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-bold text-[#062F26] capitalize">{name}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-sm font-bold text-[#062F26]">{lawyer.phone}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm font-bold text-[#062F26]">{experience} years</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 opacity-0 hidden md:flex">
                  <Icon icon="lucide:info" className="w-3.5 h-3.5" />
                  More Info
                </h4>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-bold text-indigo-600 truncate">{lawyer.email}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bar Council No.</p>
                    <p className="text-sm font-bold text-[#062F26]">{barCouncilNo}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                    <p className="text-sm font-bold text-[#062F26]">{memberSince}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Section */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                <Icon icon="lucide:file-badge" className="w-3.5 h-3.5" />
                Bar Council Certificate
              </h4>
              <div className="w-64 h-40 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-white flex items-center justify-center p-2 relative group hover:border-slate-300 transition-colors cursor-pointer">
                {certificateImg.includes('via.placeholder') ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Icon icon="lucide:file-x" className="w-8 h-8 opacity-50" />
                    <span className="text-xs font-medium">No Document Provided</span>
                  </div>
                ) : (
                  <>
                    <img src={certificateImg} alt="Certificate" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                    <a href={certificateImg} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 backdrop-blur-[2px]">
                      <Icon icon="lucide:external-link" className="w-6 h-6" />
                      <span className="text-xs font-bold">View Full Document</span>
                    </a>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerLawyerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    fetchRequests();
    markAsRead();

    const handleNewRequest = (e) => {
      const newRequest = e.detail;
      setRequests(prev => [newRequest, ...prev]);
    };

    window.addEventListener('globalNewLawyerRequest', handleNewRequest);

    return () => {
      window.removeEventListener('globalNewLawyerRequest', handleNewRequest);
    };
  }, []);

  const markAsRead = async () => {
    try {
      await fetch('/api/lawyer-requests/mark-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      window.dispatchEvent(new CustomEvent('lawyerRequestsRead'));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/lawyer-requests/owner', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      } else {
        toast.error('Failed to load requests');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      const response = await fetch(`/api/lawyer-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(`Request ${status} successfully`);
        setRequests(prev => prev.map(req => req._id === id ? { ...req, status } : req));
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred while updating status');
    }
  };

  const handleDeclineRequest = (id) => {
    setSelectedRequestId(id);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  return (
    <div className="animate-fadeIn pb-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#062F26] tracking-tight mb-2">Lawyer Requests</h1>
        <p className="text-sm text-slate-500 font-medium">
          Lawyers who want to work with you — review their details and respond
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-semibold">
          <Icon icon="lucide:scale" className="w-4 h-4" />
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading requests...</div>
        ) : requests.length > 0 ? (
          requests.map(request => (
            <LawyerRequestCard
              key={request._id}
              request={request}
              onUpdateStatus={handleUpdateStatus}
              onDeclineRequest={handleDeclineRequest}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Icon icon="lucide:scale" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Lawyer Requests</h3>
            <p className="text-sm text-slate-500">You don't have any pending or accepted lawyer requests at the moment.</p>
          </div>
        )}
      </div>
      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#062F26] mb-2 flex items-center gap-2">
              <Icon icon="lucide:ban" className="w-5 h-5 text-red-500" />
              Decline Request
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for declining this request. This will be sent to the lawyer.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter your reason here..."
              className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062F26]/20 focus:border-[#062F26] resize-none mb-4"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedRequestId, 'rejected', rejectionReason);
                  setRejectModalOpen(false);
                }}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerLawyerRequests;
