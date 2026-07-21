import { useState, useEffect, Fragment, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const TABS = ['All Inquiries', 'New', 'Contacted', 'In Discussion', 'Closed'];

const OwnerInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Inquiries');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedId, setExpandedId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/inquiries/owner', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const mappedInquiries = data.map(inq => ({
            id: inq._id,
            inquirer: {
              name: inq.senderId?.fullName || 'Unknown',
              phone: inq.senderId?.phone || 'N/A',
              email: inq.senderId?.email || 'N/A',
              initial: (inq.senderId?.fullName || 'U').charAt(0).toUpperCase(),
              profilePic: inq.senderId?.profilePic,
              color: 'bg-teal-100 text-teal-700'
            },
            property: {
              title: inq.propertyId?.pgName || (inq.propertyId?.bhkType ? `${inq.propertyId.bhkType} ${inq.propertyId.propertyCategory}` : inq.propertyId?.propertyCategory) || 'Unknown Property',
              location: `${inq.propertyId?.locality || ''}, ${inq.propertyId?.city || ''}`.replace(/^, | , $/g, ''),
              rent: inq.propertyId?.monthlyRent ? `₹${inq.propertyId.monthlyRent}` : inq.propertyId?.rooms?.[0]?.rentPerBed ? `₹${inq.propertyId.rooms[0].rentPerBed}` : 'N/A',
              image: inq.propertyId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&auto=format&fit=crop&q=60'
            },
            date: new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date(inq.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: inq.status,
            lastMessage: inq.message,
            subject: inq.subject || 'N/A',
            moveInDate: inq.moveInDate ? new Date(inq.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
            occupants: inq.occupants || 'N/A',
            gender: inq.gender || 'N/A',
            contactMethod: inq.contactMethod || 'N/A',
            isRead: inq.isRead || false
          }));
          setInquiries(mappedInquiries);
        } else {
          toast.error('Failed to fetch inquiries');
        }
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        toast.error('Failed to fetch inquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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

  const filteredInquiries = inquiries.filter(inq => {
    // Tab Filter
    const matchesTab = activeTab === 'All Inquiries' || inq.status === activeTab;

    // Search Filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      inq.inquirer.name.toLowerCase().includes(searchLower) ||
      inq.inquirer.phone.includes(searchLower) ||
      inq.property.title.toLowerCase().includes(searchLower) ||
      inq.property.location.toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  const totalItems = filteredInquiries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);

  // Pagination Helper
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedId(null);
    }
  };

  const handleExpandInquiry = async (inq) => {
    const isExpanded = expandedId === inq.id;
    setExpandedId(isExpanded ? null : inq.id);

    // If we are expanding and it is not read, mark it as read
    if (!isExpanded && !inq.isRead) {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/inquiries/${inq.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          // Update local state to prevent re-fetching
          setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, isRead: true } : i));
          // Notify the sidebar to decrement the inquiries count
          window.dispatchEvent(new Event('messagesRead'));
        }
      } catch (err) {
        console.error('Failed to mark inquiry as read', err);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Inquiry marked as ${newStatus}`);
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 px-6 pt-6 pb-0 gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors outline-none focus:outline-none ${activeTab === tab
                ? 'border-brand-teal text-[#062F26]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 pb-4">
          <div className="relative group">
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal w-4 h-4 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone or property..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-70 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm font-medium outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all placeholder:text-slate-400 text-slate-700 bg-slate-50 focus:bg-white"
            />
          </div>
          <button className="flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:border-brand-teal hover:text-brand-teal transition-all bg-white shadow-sm">
            <Icon icon="lucide:filter" className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto pb-32">
        <table className="w-full min-w-250 text-left">
          <thead className="bg-white sticky top-0 z-20">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Inquirer</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Property</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Inquiry Date</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Last Message</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500 text-sm font-medium">
                  <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin mx-auto text-brand-teal" />
                  <p className="mt-2">Loading inquiries...</p>
                </td>
              </tr>
            ) : paginatedInquiries.length > 0 ? (
              paginatedInquiries.map((inq) => {
                const isExpanded = expandedId === inq.id;

                return (
                  <Fragment key={inq.id}>
                    <tr className={`transition-colors group ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/50 border-b border-slate-100'}`}>

                      {/* Inquirer */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${inq.inquirer.color}`}>
                            {inq.inquirer.profilePic ? (
                              <img src={inq.inquirer.profilePic} alt={inq.inquirer.name} className="w-full h-full object-cover" />
                            ) : (
                              inq.inquirer.initial
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#062F26]">{inq.inquirer.name}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{inq.inquirer.phone}</p>
                            <p className="text-xs font-medium text-slate-500">{inq.inquirer.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <img src={inq.property.image} alt={inq.property.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#062F26] group-hover:text-brand-teal transition-colors">{inq.property.title}</p>
                            <p className="text-xs font-medium text-slate-500 my-0.5">{inq.property.location}</p>
                            <p className="text-xs font-medium text-slate-600">
                              <span className="font-bold">{inq.property.rent}</span> / month
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Inquiry Date */}
                      <td className="py-4 px-6 align-middle">
                        <p className="text-xs font-bold text-slate-700">{inq.date}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{inq.time}</p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 align-middle">
                        {getStatusBadge(inq.status)}
                      </td>

                      {/* Last Message */}
                      <td className="py-4 px-6 align-middle max-w-50">
                        <p className="text-xs font-bold text-brand-teal truncate mb-1" title={inq.subject}>
                          Sub: {inq.subject}
                        </p>
                        <p className="text-xs font-medium text-slate-600 truncate leading-relaxed" title={inq.lastMessage}>
                          {inq.lastMessage}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-2 relative">
                          <button
                            onClick={() => handleExpandInquiry(inq)}
                            className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors ${isExpanded
                              ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              : 'bg-white border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white'
                              }`}
                          >
                            {isExpanded ? 'Close Details' : 'View Details'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === inq.id ? null : inq.id);
                            }}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                          >
                            <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                          </button>

                          {/* Status Dropdown Menu */}
                          {activeDropdownId === inq.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 py-1.5 z-50 animate-[fadeIn_0.2s_ease-out]"
                            >
                              <div className="px-3 py-1.5 mb-1 border-b border-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Update Status
                              </div>
                              {inq.status === 'New' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq.id, 'Contacted'); setActiveDropdownId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                >
                                  <Icon icon="lucide:check-circle" className="w-4 h-4" />
                                  Mark as Contacted
                                </button>
                              )}
                              {(inq.status === 'New' || inq.status === 'Contacted') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq.id, 'In Discussion'); setActiveDropdownId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
                                >
                                  <Icon icon="lucide:users" className="w-4 h-4" />
                                  In Discussion
                                </button>
                              )}
                              {inq.status !== 'Closed' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq.id, 'Closed'); setActiveDropdownId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                                >
                                  <Icon icon="lucide:x-circle" className="w-4 h-4" />
                                  Close Inquiry
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>

                    {/* Expanded Details Row */}
                    <tr>
                      <td colSpan="6" className="p-0 border-none">
                        <div className={`grid transition-[grid-template-rows,opacity] duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-b border-slate-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            <div className="bg-slate-50/80 p-6 shadow-inner">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">

                                {/* Message Full Details */}
                                <div className="md:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                  <div className="flex items-center gap-2 mb-3 text-brand-teal">
                                    <Icon icon="lucide:message-square" className="w-5 h-5" />
                                    <h4 className="font-bold text-sm">Inquiry Message</h4>
                                  </div>
                                  <p className="text-sm font-bold text-slate-800 mb-1">Subject: {inq.subject}</p>
                                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {inq.lastMessage}
                                  </p>
                                </div>

                                {/* Requirements & Info */}
                                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-1">
                                    <Icon icon="lucide:list-checks" className="w-5 h-5 text-brand-teal" />
                                    Requirements
                                  </h4>

                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                      <Icon icon="lucide:calendar-days" className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase">Move-in Date</p>
                                      <p className="text-sm font-semibold text-slate-800">{inq.moveInDate}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                      <Icon icon="lucide:users" className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase">Occupants & Gender</p>
                                      <p className="text-sm font-semibold text-slate-800">{inq.occupants} Person(s) • {inq.gender}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                      <Icon icon="lucide:phone-call" className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase">Preferred Contact</p>
                                      <p className="text-sm font-semibold text-slate-800">{inq.contactMethod}</p>
                                    </div>
                                  </div>

                                </div>

                              </div>

                              {/* Action Buttons for the Inquiry */}
                              <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button 
                                  onClick={() => navigate('/owner/messages', { state: { activeInquiryId: inq.id } })}
                                  className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white text-sm font-bold rounded-lg hover:bg-[#062F26] transition-colors shadow-sm"
                                >
                                  <Icon icon="lucide:message-circle" className="w-4 h-4" />
                                  Reply to Inquiry
                                </button>
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
                <td colSpan="6" className="py-12 text-center text-slate-500 text-sm font-medium">
                  No inquiries found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white shrink-0">
        <p className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-700">{totalItems === 0 ? 0 : startIndex + 1} to {endIndex}</span> of <span className="font-bold text-slate-700">{totalItems} inquiries</span>
        </p>

        {totalItems > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-brand-teal hover:text-brand-teal transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border font-medium text-sm transition-colors ${currentPage === page
                    ? 'border-brand-teal text-brand-teal font-bold bg-emerald-50'
                    : 'border-slate-200 text-slate-600 hover:border-brand-teal hover:text-brand-teal bg-white'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-brand-teal hover:text-brand-teal transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>

            <div className="relative group">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none flex items-center gap-2 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 bg-white cursor-pointer hover:border-brand-teal text-xs font-medium text-slate-600 outline-none"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
              <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-brand-teal pointer-events-none transition-colors" />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default OwnerInquiries;
