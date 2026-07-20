import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const defaultTemplate = `Hello {name},

We help PG owners in Ahmedabad & Gandhinagar get more tenants through our platform.

Currently, we are offering FREE listing and promotion for early partners.

Would you like to list your PG with us and get more inquiries?

Reply YES and we will get you started.`;

const AdminWhatsAppOutreach = () => {
  const [activeTab, setActiveTab] = useState('Compose');
  const [template, setTemplate] = useState(defaultTemplate);
  const [recipients, setRecipients] = useState([
    { id: 1, phone: '', ownerName: '', pgName: '' }
  ]);
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const fetchLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'Leads') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchLeads();
    }
  }, [activeTab, fetchLeads]);

  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now(), phone: '', ownerName: '', pgName: '' }
    ]);
  };

  const handleRecipientChange = (id, field, value) => {
    setRecipients(recipients.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleRemoveRecipient = (id) => {
    if (recipients.length === 1) return; // Keep at least one
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleSend = async (recipient) => {
    if (!recipient.phone) return;

    // Clean phone number
    let phoneStr = recipient.phone.trim();
    if (!phoneStr.startsWith('+')) {
      phoneStr = '+91' + phoneStr;
    }
    const rawPhone = phoneStr.replace(/\s+/g, '').replace('+', '');

    // Replace {name}
    const displayName = recipient.ownerName.trim() || 'Sir/Madam';
    const finalMessage = template.replace('{name}', displayName);

    const encodedMessage = encodeURIComponent(finalMessage);
    const waUrl = `https://wa.me/${rawPhone}?text=${encodedMessage}`;

    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            phone: rawPhone,
            ownerName: recipient.ownerName.trim(),
            pgName: recipient.pgName.trim()
          })
        });
        if (res.ok) {
          toast.success('Lead saved to database!');
          if (activeTab === 'Leads') fetchLeads();
        }
      }
    } catch (error) {
      console.error('Error saving lead:', error);
    }

    window.open(waUrl, '_blank');
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success('Lead status updated!');
        fetchLeads();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Something went wrong');
    }
  };

  const totalLeads = leads.length;
  const interestedLeads = leads.filter(l => l.status === 'Interested').length;
  const listedLeads = leads.filter(l => l.status === 'Listed').length;

  return (
    <div className="max-w-350 mx-auto pb-8">

      {/* Premium Header Section */}
      <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 sm:p-6 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-teal flex items-center justify-center shadow-lg shadow-brand-teal/20 shrink-0">
            <Icon icon="mdi:whatsapp" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#062F26]">WhatsApp Outreach</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Send targeted messages • leads auto-saved</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 sm:px-5 sm:py-3 flex flex-col items-center justify-center min-w-21.25 sm:min-w-25">
            <span className="text-2xl font-bold text-[#059669] leading-none">{totalLeads}</span>
            <span className="text-xs font-bold text-slate-500 mt-1">Leads</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 sm:px-5 sm:py-3 flex flex-col items-center justify-center min-w-21.25 sm:min-w-25">
            <span className="text-xl sm:text-2xl font-bold text-blue-500 leading-none">{interestedLeads}</span>
            <span className="text-xs sm:text-xs font-bold text-slate-500 mt-1">Interested</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 sm:px-5 sm:py-3 flex flex-col items-center justify-center min-w-21.25 sm:min-w-25">
            <span className="text-xl sm:text-2xl font-bold text-purple-500 leading-none">{listedLeads}</span>
            <span className="text-xs sm:text-xs font-bold text-slate-500 mt-1">Listed</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-4 w-full overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('Compose')}
          className={`flex items-center justify-center cursor-pointer whitespace-nowrap gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm sm:text-sm font-bold transition-all flex-1 sm:flex-none ${activeTab === 'Compose'
            ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
        >
          <Icon icon="lucide:mail-plus" className="w-4 h-4" />
          Compose
        </button>
        <button
          onClick={() => setActiveTab('Leads')}
          className={`flex items-center justify-center cursor-pointer whitespace-nowrap gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm sm:text-sm font-bold transition-all flex-1 sm:flex-none ${activeTab === 'Leads'
            ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
            : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100'
            }`}
        >
          <Icon icon="lucide:clipboard-list" className="w-4 h-4" />
          Leads {totalLeads > 0 && `(${totalLeads})`}
        </button>
      </div>

      {activeTab === 'Compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left Panel: Message Template */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-teal"></div>
              <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Message Template</h2>
            </div>
            <div className="p-5 flex-1 bg-slate-50/30">
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full h-80 p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-xl text-[#062F26] text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-teal/30 resize-none custom-scrollbar"
              />
              <p className="text-xs text-slate-500 font-medium mt-4">
                If owner name is provided, <span className="font-bold text-slate-700">{"{name}"}</span> is replaced with their name. Otherwise, it defaults to "Sir/Madam".
              </p>
            </div>
          </div>

          {/* Right Panel: Recipients List */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-[#062F26]">Recipients</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#059669] text-xs font-bold">
                  {recipients.length}
                </span>
              </div>
              <button
                onClick={handleAddRecipient}
                className="flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-lg bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal/90 transition-colors shadow-sm"
              >
                <Icon icon="lucide:plus" className="w-4 h-4" />
                Add Recipient
              </button>
            </div>

            <div className="p-4 sm:p-6 flex flex-col gap-6">
              {recipients.map((recipient, index) => {
                const isSendEnabled = recipient.phone.trim().length >= 10;

                return (
                  <div key={recipient.id} className="relative flex flex-col gap-4 p-4 sm:p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors group">

                    {recipients.length > 1 && (
                      <button
                        onClick={() => handleRemoveRecipient(recipient.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove recipient"
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-500">Fill details and send</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Phone Field */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-sm font-bold">+91</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Phone *"
                          value={recipient.phone}
                          onChange={(e) => handleRecipientChange(recipient.id, 'phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal placeholder:text-slate-400"
                        />
                      </div>

                      {/* Owner Name Field */}
                      <input
                        type="text"
                        placeholder="Owner name"
                        value={recipient.ownerName}
                        onChange={(e) => handleRecipientChange(recipient.id, 'ownerName', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal placeholder:text-slate-400"
                      />

                      {/* PG Name Field */}
                      <input
                        type="text"
                        placeholder="PG name"
                        value={recipient.pgName}
                        onChange={(e) => handleRecipientChange(recipient.id, 'pgName', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => handleSend(recipient)}
                        disabled={!isSendEnabled}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${isSendEnabled
                          ? 'bg-brand-teal text-white hover:bg-brand-teal/90 shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                        <Icon icon="mdi:whatsapp" className="w-4 h-4" />
                        Send on WhatsApp
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {activeTab === 'Leads' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <h2 className="text-base font-bold text-[#062F26] mr-1">Lead Database</h2>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#e8fbf0] text-[#059669] text-xs sm:text-xs font-bold whitespace-nowrap">
                {totalLeads} total
              </span>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-xs font-bold whitespace-nowrap">
                {interestedLeads} interested
              </span>
            </div>
            <button
              onClick={fetchLeads}
              disabled={isLoadingLeads}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto"
            >
              <Icon icon="lucide:refresh-cw" className={`w-3.5 h-3.5 ${isLoadingLeads ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto min-w-200">
              <thead className="bg-[#F8F9FA] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">PHONE</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">NAME</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">PG NAME</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">STATUS</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">No leads found. Start sending WhatsApp messages to capture leads!</td>
                  </tr>
                ) : (
                  leads.map((lead, idx) => (
                    <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-brand-teal font-bold text-sm">
                          <Icon icon="mdi:whatsapp" className="w-4 h-4" />
                          {lead.phone}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-700">{lead.ownerName || '-'}</td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-700">{lead.pgName || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="relative inline-block w-fit">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                            className={`appearance-none text-xs font-bold pl-3 pr-8 py-1.5 rounded-md outline-none cursor-pointer border hover:border-slate-300 transition-colors ${lead.status === 'Interested' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              lead.status === 'Listed' ? 'bg-[#e8fbf0] text-[#059669] border-[#bbf7d0]' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                          >
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Listed">Listed</option>
                          </select>
                          <Icon icon="lucide:chevron-down" className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${lead.status === 'Interested' ? 'text-blue-500' :
                            lead.status === 'Listed' ? 'text-[#059669]' :
                              'text-slate-400'
                            }`} />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-500 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminWhatsAppOutreach;
