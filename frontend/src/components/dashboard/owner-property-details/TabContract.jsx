import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const DEFAULT_ENGLISH_AGREEMENT = `<h1>RENTAL / LEAVE AND LICENSE AGREEMENT</h1>

This Leave and License Agreement ("Agreement") is entered into on [agreement_date], at [agreement_city].

<h3>PARTIES TO THE AGREEMENT</h3>

<b>Licensor (Owner/Property Manager):</b>
[property_name], having its premises at [property_address], [property_city]
(hereinafter referred to as the "Licensor")

<b>Licensee (Tenant):</b>
[tenant_full_name]
Contact: [tenant_mobile] | [tenant_email]
Date of Birth: [tenant_date_of_birth]
(hereinafter referred to as the "Licensee")

<h3>ACCOMMODATION DETAILS</h3>
<b>Property:</b> [property_name]
<b>Address:</b> [property_address], [property_locality], [property_city]
<b>Room / Unit:</b> [room_name]
<b>Bed Number:</b> [bed_number]

<h3>FINANCIAL TERMS</h3>
<b>Monthly Rent:</b> ₹[rent_amount]
<b>Security Deposit:</b> ₹[deposit_amount]
<b>Commencement Date:</b> [move_in_date]
<b>Vacation Date:</b> [move_out_date]
<b>Booking Reference:</b> [booking_reference]

<b>9. Notice Period and Termination</b>
After the lock-in period, either party may terminate this Agreement by giving a 30-day advance notice in writing. The Licensor reserves the right to terminate this Agreement immediately and evict the Licensee in the event of breach of any term, non-payment of rent, or misconduct.

<b>10. Vacation of Premises</b>
Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation, remove all personal belongings, return all keys, and hand over the premises in the same condition as received, subject to normal wear and tear.

<b>11. Liability</b>
The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises.

<b>12. Governing Law and Jurisdiction</b>
This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city].

<b>13. Entire Agreement</b>
This Agreement constitutes the entire understanding between the parties regarding the accommodation.

<h3>EMERGENCY CONTACT</h3>
The Licensee shall not use the premises for any illegal, commercial, or immoral activity. The Licensee shall not sublet the accommodation or any part thereof to any third party.

<b>10. Notice Period and Termination</b>
Either party may terminate this Agreement by giving advance notice as agreed at the time of move-in or as communicated in writing. The Licensor reserves the right to terminate this Agreement immediately in the event of breach of any term of this Agreement, non-payment of rent, or conduct detrimental to other residents.

<b>11. Vacation of Premises</b>
Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation on or before the agreed vacation date, remove all personal belongings, return all keys and access devices, and hand over the premises in the same condition as received, subject to normal wear and tear.

<b>12. Liability</b>
The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises. The Licensee is advised to arrange personal insurance coverage for their valuables if required.

<b>13. Force Majeure</b>
Neither party shall be liable for any failure or delay in performance due to circumstances beyond their reasonable control, including natural disasters, government restrictions, or other force majeure events.

<b>14. Governing Law and Jurisdiction</b>
This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city].

<b>15. Entire Agreement</b>
This Agreement, along with any house rules communicated separately, constitutes the entire understanding between the parties regarding the accommodation. Any modification to this Agreement shall be mutually agreed upon in writing.

<h3>EMERGENCY CONTACT</h3>
<b>Name:</b> [emergency_contact_name]
<b>Phone:</b> [emergency_contact_phone]
<b>Relationship:</b> [emergency_contact_relationship]

<h3>SIGNATURES</h3>
By proceeding with occupation of the premises, the Licensee acknowledges that they have read, understood, and agree to be bound by all the terms and conditions of this Agreement.

<b>Licensee:</b> [tenant_full_name]
<b>Date:</b> [agreement_date]`;

const TabContract = ({ property, bookings = [] }) => {
  const [showContractFormat, setShowContractFormat] = useState(false);

  const activeBookings = bookings.filter(b => b.status === 'Active' || b.status === 'Confirmed' || b.status === 'Completed');

  const tenantContracts = activeBookings.map((b) => {
    const firstName = b.personalInfo?.firstName || '';
    const lastName = b.personalInfo?.lastName || '';
    const fullName = b.tenantId?.fullName || `${firstName} ${lastName}`.trim() || 'Unknown Tenant';
    const room = property.propertyType === 'Tenant' ? 'Full Property' : b.roomDetails?.roomName || 'N/A';
    const bed = property.propertyType === 'Tenant' ? '-' : b.roomDetails?.bedName || 'N/A';
    
    return {
      id: b._id,
      tenantName: fullName,
      room: room,
      bed: bed,
      date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: (b.status === 'Active' || b.status === 'Completed') ? 'Signed' : 'Pending'
    };
  });

  const handleViewContract = async (bookingId) => {
    if (!bookingId) return;
    try {
      const toastId = toast.loading('Loading contract...');
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/bookings/${bookingId}/download-agreement`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.dismiss(toastId);
    } catch (error) {
      toast.error('Failed to load contract PDF');
      console.error(error);
    }
  };

  const handleDownloadContract = async (bookingId, tenantName) => {
    if (!bookingId) return;
    try {
      const toastId = toast.loading('Downloading contract...');
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/bookings/${bookingId}/download-agreement`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rent_Agreement_${tenantName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download complete', { id: toastId });
    } catch (error) {
      toast.error('Failed to download contract PDF');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Contract Agreement Card */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-100 shadow-sm w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EAF5F2] text-brand-teal rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Icon icon="lucide:file-text" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#062F26]">
                {showContractFormat ? 'Contract Format' : 'Tenant Contracts'}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 sm:mt-1">
                {showContractFormat
                  ? "Review the property's base contract format"
                  : "View and download signed tenant agreements"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowContractFormat(!showContractFormat)}
            className="px-4 py-2 sm:py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#062F26] rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full sm:w-auto mt-2 sm:mt-0"
          >
            <Icon icon={showContractFormat ? "lucide:users" : "lucide:file-cog"} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            {showContractFormat ? 'View Tenant Contracts' : 'Contract Format'}
          </button>
        </div>

        {showContractFormat ? (
          <div className="bg-[#FAF6F0] border border-[#F3EFE9] rounded-xl p-4 sm:p-5 md:p-6 flex flex-col gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold shrink-0 mt-1 sm:mt-0">
                <Icon icon="lucide:shield-check" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-[#062F26]">
                  {property.ownerContract?.isCustomized ? 'Customized Agreement' : 'Standard Agreement'}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                  {property.ownerContract?.isCustomized ? 'Using customized contract text' : 'Using Housynest\'s default standardized contract'}
                </p>
              </div>
            </div>

            {/* Embedded Text Viewer */}
            <div className="w-full h-[600px] md:h-[700px] rounded-xl overflow-y-auto custom-scrollbar border border-slate-200 bg-white p-6 md:p-8 space-y-6" data-lenis-prevent="true">
              <div
                className="prose prose-sm md:prose-base max-w-none text-slate-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: property.ownerContract?.isCustomized && property.ownerContract?.contractTextEn
                    ? property.ownerContract.contractTextEn
                    : DEFAULT_ENGLISH_AGREEMENT
                }}
              />
              
              {/* Dynamic Terms and Conditions */}
              {(() => {
                const termsToUse = property?.ownerContract?.termsAndConditions?.length > 0
                  ? property.ownerContract.termsAndConditions
                  : [
                      { titleEn: "Nature and Duration of Agreement", descriptionEn: "This Agreement is a Leave and License Agreement granted for a period of 11 (eleven) months from the Commencement Date. It does not create any tenancy rights, sub-tenancy rights, or any other right of occupation in favor of the Licensee. The Licensee shall use the accommodation solely for residential purposes." },
                      { titleEn: "Monthly Rent and Payment", descriptionEn: "The Licensee agrees to pay the monthly license fee of ₹[rent_amount] on or before the 5th day of every calendar month. Continued occupation of the premises is conditional on timely payment of rent. A late fee may be charged for delayed payments as per the Licensor's policy." },
                      { titleEn: "Security Deposit and Lock-in Period", descriptionEn: "A refundable security deposit of ₹[deposit_amount] is collected prior to move-in. The Licensee agrees to a minimum lock-in period of 3 months. If the Licensee vacates the premises before the lock-in period expires, the security deposit shall be forfeited. The deposit shall be refunded upon vacating the premises after adjusting any outstanding dues, unpaid rent, utility charges, or damages." },
                      { titleEn: "Utilities and Additional Charges", descriptionEn: "Charges for electricity, water, internet, laundry, food, housekeeping, and any other services availed by the Licensee shall be borne by the Licensee as per actual consumption or as per the Licensor's applicable rate card." },
                      { titleEn: "Maintenance and Care of Premises", descriptionEn: "The Licensee shall maintain the accommodation, attached furniture, fixtures, fittings, and common areas in good, clean, and hygienic condition. The cost of any willful damage or negligent damage caused by the Licensee shall be recoverable from the Licensee or from the security deposit." },
                      { titleEn: "House Rules and Prohibited Activities", descriptionEn: "a) Smoking, consumption of alcohol, and use of illegal substances are strictly prohibited within the premises.\nb) The Licensee shall conduct themselves in a lawful and considerate manner so as not to disturb other residents or neighbors.\nc) Cooking in rooms is strictly prohibited unless a designated kitchen area is provided." },
                      { titleEn: "Guests and Visitors", descriptionEn: "Guests and visitors are permitted only in the designated common areas during visiting hours. Overnight stays of guests are strictly prohibited without prior written permission from the Licensor and may incur additional charges." },
                      { titleEn: "Alterations", descriptionEn: "The Licensee shall not make any structural changes, permanent alterations, drilling, painting, or modifications to the accommodation or common areas." },
                      { titleEn: "Notice Period and Termination", descriptionEn: "After the lock-in period, either party may terminate this Agreement by giving a 30-day advance notice in writing. The Licensor reserves the right to terminate this Agreement immediately and evict the Licensee in the event of breach of any term, non-payment of rent, or misconduct." },
                      { titleEn: "Vacation of Premises", descriptionEn: "Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation, remove all personal belongings, return all keys, and hand over the premises in the same condition as received, subject to normal wear and tear." },
                      { titleEn: "Liability", descriptionEn: "The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises." },
                      { titleEn: "Governing Law and Jurisdiction", descriptionEn: "This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city]." },
                      { titleEn: "Entire Agreement", descriptionEn: "This Agreement constitutes the entire understanding between the parties regarding the accommodation." }
                    ];
                
                if (termsToUse.length === 0) return null;

                return (
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <h3 className="font-bold text-[#062F26] uppercase tracking-wider text-base mb-4">
                      TERMS AND CONDITIONS
                    </h3>
                    <div className="space-y-4">
                      {termsToUse.map((term, idx) => (
                        <p key={idx} className="text-sm md:text-base text-slate-700 leading-relaxed">
                          <strong className="font-bold text-slate-800">
                            {idx + 1}. {term.titleEn}
                          </strong>
                          <br />
                          <span className="whitespace-pre-wrap">{term.descriptionEn}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tenantContracts.length > 0 ? (
              <div className="grid gap-4">
                {tenantContracts.map((contract) => (
                  <div key={contract.id} className="bg-white border border-slate-200 hover:border-brand-teal/40 transition-colors rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        <Icon icon="lucide:user" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#062F26] text-sm sm:text-base truncate">{contract.tenantName}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Icon icon="lucide:door-closed" className="w-3.5 h-3.5" /> {contract.room} {contract.bed !== '-' ? `(${contract.bed})` : ''}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1"><Icon icon="lucide:calendar" className="w-3.5 h-3.5" /> {contract.date}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border mt-1 sm:mt-0 ${contract.status === 'Signed' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>{contract.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button 
                        onClick={() => handleViewContract(contract.id)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold bg-[#EAF5F2] text-[#0AA87D] hover:bg-[#0AA87D] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Icon icon="lucide:eye" width="16" />
                        View
                      </button>
                      <button 
                        onClick={() => handleDownloadContract(contract.id, contract.tenantName)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold bg-[#062F26] text-white hover:bg-brand-teal transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Icon icon="lucide:download" width="16" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-slate-100">
                <Icon icon="lucide:users" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No tenant contracts available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabContract;
