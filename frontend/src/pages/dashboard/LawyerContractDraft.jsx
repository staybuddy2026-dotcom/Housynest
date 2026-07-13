import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const LawyerContractDraft = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bookedTenants, setBookedTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const [formData, setFormData] = useState({
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    propertyAddress: '',
    monthlyRent: '',
    securityDeposit: '',
    leaseDuration: '11 months',
    noticePeriod: '1 month',
    startDate: '',
    endDate: '',
    terms: 'PROPERTY ADDRESS: [Property Address]\n\nTERMS AND CONDITIONS:\n1. The tenant agrees to pay the monthly rent on or before the 5th of each month.\n2. The security deposit is refundable at the end of the lease, subject to deductions for damages.\n3. The tenant shall not sublet the property without prior written consent from the owner.\n4. The tenant shall maintain the property in good condition.\n5. Any modifications to the property require written approval from the owner.\n6. Utilities (electricity, water, gas) are the responsibility of the tenant unless otherwise agreed.\n7. The tenant shall allow the owner reasonable access for inspections with prior notice.',
    policies: 'POLICIES:\n- No smoking inside the premises.\n- Pets are not allowed without prior written consent.\n- Noise levels must be kept reasonable, especially between 10 PM and 8 AM.\n- Garbage disposal must follow local municipal guidelines.\n- Parking (if applicable) is limited to designated areas only.'
  });

  useEffect(() => {
    fetchContract();

    const handleOwnerSigned = (e) => {
      if (e.detail._id === id) {
        setContract(prev => ({ ...prev, status: 'Pending Tenant Signature' }));
        toast.success('Owner has signed the contract!');
      }
    };

    const handleTenantSigned = (e) => {
      if (e.detail._id === id) {
        setContract(prev => ({ ...prev, status: 'Fully Executed' }));
        toast.success('Tenant has signed the contract! It is fully executed.');
      }
    };

    window.addEventListener('ownerSignedContract', handleOwnerSigned);
    window.addEventListener('tenantSignedContract', handleTenantSigned);

    return () => {
      window.removeEventListener('ownerSignedContract', handleOwnerSigned);
      window.removeEventListener('tenantSignedContract', handleTenantSigned);
    };
  }, [id]);

  const fetchContract = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/contracts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setContract(data);
        setFormData({
          tenantName: data.tenantName || '',
          tenantEmail: data.tenantEmail || '',
          tenantPhone: data.tenantPhone || '',
          propertyAddress: data.propertyAddress || '',
          monthlyRent: data.monthlyRent || '',
          securityDeposit: data.securityDeposit || '',
          leaseDuration: data.leaseDuration || '11 months',
          noticePeriod: data.noticePeriod || '1 month',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          terms: data.terms || formData.terms,
          policies: data.policies || formData.policies,
        });

        // Fetch booked tenants for this owner
        try {
          const tenantsResponse = await fetch(`/api/contracts/${id}/booked-tenants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (tenantsResponse.ok) {
            const tenantsData = await tenantsResponse.json();
            setBookedTenants(tenantsData);
          }
        } catch (e) {
          console.error('Failed to fetch booked tenants', e);
        }

      } else {
        toast.error('Failed to load contract');
        navigate('/lawyer/contracts');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTenant = (tenant) => {
    setSelectedTenantId(tenant._id);
    setFormData(prev => ({
      ...prev,
      tenantName: tenant.fullName,
      tenantEmail: tenant.email,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (action = 'Draft') => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      let endpoint = `/api/contracts/${id}`;
      let method = 'PUT';

      if (action === 'SendToOwner') {
        endpoint = `/api/contracts/${id}/send-to-owner`;
        method = 'POST';
      } else if (action === 'SendToTenant') {
        endpoint = `/api/contracts/${id}/send-to-tenant`;
        method = 'POST';
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (action === 'Draft') {
          toast.success('Draft saved successfully');
        } else if (action === 'SendToOwner') {
          toast.success('Contract sent to owner for signature');
          setContract(prev => ({ ...prev, status: 'Pending Owner Signature' }));
        } else if (action === 'SendToTenant') {
          toast.success('Contract sent to tenant for signature');
          setContract(prev => ({ ...prev, status: 'Pending Tenant Signature' })); // Will wait for fully executed
        }
      } else {
        toast.error('Failed to update contract');
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!contract) return null;

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lawyer/contracts')}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-all"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Back to Contracts
          </button>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${contract.status === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200' :
            contract.status === 'Fully Executed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
            <Icon icon={contract.status === 'Fully Executed' ? "lucide:check-circle-2" : "lucide:file-edit"} className="w-4 h-4" />
            {contract.status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {contract.status === 'Draft' && (
            <>
              <button
                onClick={() => handleSave('Draft')}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave('SendToOwner')}
                disabled={isSaving || !formData.tenantEmail}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#062F26] hover:bg-opacity-90 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Icon icon="lucide:send" className="w-4 h-4" />
                Send to Owner
              </button>
            </>
          )}

          {contract.status === 'Pending Owner Signature' && (
            <span className="px-5 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <Icon icon="lucide:clock" className="w-4 h-4" />
              Waiting for Owner Signature
            </span>
          )}

          {contract.status === 'Pending Tenant Signature' && (
            <button
              onClick={() => handleSave('SendToTenant')}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#062F26] hover:bg-opacity-90 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Icon icon="lucide:send" className="w-4 h-4" />
              Send to Tenant
            </button>
          )}

          {contract.status === 'Fully Executed' && (
            <button
              onClick={() => window.open(`/api/contracts/${contract._id}/download`, '_blank')}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-brand-teal hover:bg-opacity-90 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Icon icon="lucide:download" className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">

        {/* OWNER SECTION */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h4 className="text-xs font-bold text-[#062F26]/50 uppercase tracking-widest mb-5">Owner Details</h4>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md bg-[#EAF5F2] flex items-center justify-center font-bold text-[#062F26] text-xl">
              {contract.ownerId?.profilePic ? (
                <img src={contract.ownerId.profilePic} alt={contract.ownerId.fullName} className="w-full h-full object-cover" />
              ) : (
                contract.ownerId?.fullName?.charAt(0) || 'O'
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#062F26] leading-tight mb-1">{contract.ownerId?.fullName}</h3>
              <p className="text-sm font-medium text-slate-500">{contract.ownerId?.email}</p>
            </div>
          </div>
        </div>

        {/* TENANT DETAILS SECTION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="text-xs font-bold text-[#062F26]/50 uppercase tracking-widest">Tenant Details</h4>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Select a booked tenant to auto-fill</span>
          </div>

          <div className="mb-8 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
            <label className="block text-xs font-bold text-slate-500 mb-3">Booked Tenants ({bookedTenants.length})</label>
            <div className="flex flex-wrap gap-3">
              {bookedTenants.length > 0 ? (
                bookedTenants.map((tenant) => (
                  <button
                    key={tenant._id}
                    type="button"
                    onClick={() => handleSelectTenant(tenant)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm ${selectedTenantId === tenant._id
                      ? 'bg-[#062F26] border-[#062F26] text-white ring-2 ring-[#062F26]/30 ring-offset-2'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-[#062F26]/30 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedTenantId === tenant._id ? 'bg-white/20' : 'bg-slate-100'}`}>
                      <Icon icon="lucide:user" className={`w-4 h-4 ${selectedTenantId === tenant._id ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-sm font-bold ${selectedTenantId === tenant._id ? 'text-white' : 'text-slate-800'}`}>
                        {tenant.fullName}
                      </span>
                    </div>
                    {selectedTenantId === tenant._id && (
                      <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-emerald-400 ml-1" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic bg-white px-4 py-3 rounded-xl border border-slate-200">No booked tenants found for this owner.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Tenant Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon icon="lucide:user" className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="tenantName"
                  value={formData.tenantName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Tenant Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon icon="lucide:mail" className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="tenantEmail"
                  value={formData.tenantEmail}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Tenant Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon icon="lucide:phone" className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="tenantPhone"
                  value={formData.tenantPhone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PROPERTY & FINANCIALS SECTION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h4 className="text-xs font-bold text-[#062F26]/50 uppercase tracking-widest mb-6">Property & Financials</h4>

          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Property Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon icon="lucide:map-pin" className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  placeholder="Complete property address"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-1">Monthly Rent</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon icon="lucide:indian-rupee" className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-1">Security Deposit</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon icon="lucide:indian-rupee" className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-1">Lease Duration</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon icon="lucide:calendar-days" className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="leaseDuration"
                    value={formData.leaseDuration}
                    onChange={handleInputChange}
                    placeholder="11 months"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-1">Notice Period</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon icon="lucide:clock-4" className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    placeholder="1 month"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all [color-scheme:light]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 transition-all [color-scheme:light]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TERMS & CONDITIONS SECTION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h4 className="text-xs font-bold text-[#062F26]/50 uppercase tracking-widest mb-6">Terms & Conditions</h4>

          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Agreement Terms</label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                rows={9}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-5 py-4 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 custom-scrollbar resize-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Rules & Policies</label>
              <textarea
                name="policies"
                value={formData.policies}
                onChange={handleInputChange}
                rows={6}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-5 py-4 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 custom-scrollbar resize-none transition-all"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LawyerContractDraft;
