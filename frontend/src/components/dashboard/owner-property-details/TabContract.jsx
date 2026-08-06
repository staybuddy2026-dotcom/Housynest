import React from 'react';
import { Icon } from '@iconify/react';

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

<h3>TERMS AND CONDITIONS</h3>

<b>1. Nature of Agreement</b>
This Agreement is a Leave and License Agreement only. It does not create any tenancy rights, sub-tenancy rights, or any other right of occupation in favor of the Licensee. The Licensee shall use the accommodation solely for residential purposes.

<b>2. Monthly Rent and Payment</b>
The Licensee agrees to pay the monthly license fee of ₹[rent_amount] on or before the due date communicated by the Licensor. Continued occupation of the premises is conditional on timely payment of rent and any applicable charges.

<b>3. Security Deposit</b>
A refundable security deposit of ₹[deposit_amount] has been or shall be collected prior to move-in. The deposit shall be refunded within a reasonable time after the Licensee vacates the premises, after adjusting any outstanding dues, unpaid rent, utility charges, or costs of repairing damages caused by the Licensee beyond normal wear and tear.

<b>4. Utilities and Additional Charges</b>
Charges for electricity, water, internet, laundry, food, housekeeping, and any other services availed by the Licensee shall be borne by the Licensee as per actual consumption or as per the Licensor's applicable rate card communicated separately.

<b>5. Maintenance and Care of Premises</b>
The Licensee shall maintain the accommodation, attached furniture, fixtures, fittings, and common areas in good, clean, and hygienic condition. The Licensee shall promptly report any damage or defect to the Licensor. The cost of any willful damage or negligent damage caused by the Licensee shall be recoverable from the Licensee or from the security deposit.

<b>6. Conduct and House Rules</b>
The Licensee shall conduct themselves in a lawful and considerate manner so as not to disturb other residents, staff, or neighbors. The Licensee shall abide by all house rules, facility timings, and guidelines communicated by the Licensor from time to time.

<b>7. Guests and Visitors</b>
Guests and visitors shall be permitted on the premises only as per the Licensor's guest and visitor policy communicated separately. Overnight stays of guests shall require prior permission from the Licensor.

<b>8. Alterations</b>
The Licensee shall not make any structural changes, permanent alterations, drilling, painting, or modifications to the accommodation or common areas without the prior written consent of the Licensor.

<b>9. Prohibited Uses</b>
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

const TabContract = ({ property }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Contract Agreement Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm w-full">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-[#EAF5F2] text-brand-teal rounded-xl flex items-center justify-center shrink-0">
            <Icon icon="lucide:file-text" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#062F26]">Contract Agreement</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Review the property's terms and conditions</p>
          </div>
        </div>

        {property.ownerContract?.isCustomized || property.ownerContract?.url ? (
          <>
            <p className="text-sm text-slate-500 font-medium mb-4">
              Official customized owner contract stored in Cloudinary
            </p>
            <div className="bg-[#EAF5F2]/50 border border-brand-teal/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold shrink-0">
                  <Icon icon="lucide:file-type-2" width="22" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#062F26] truncate max-w-[200px] sm:max-w-md">
                    {property.ownerContract?.fileName || 'Owner Contract Agreement.pdf'}
                  </p>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Icon icon="lucide:cloud-check" width="12" className="text-brand-teal" /> Stored in Cloudinary
                  </span>
                </div>
              </div>
              {property.ownerContract?.url && (
                <a
                  href={property.ownerContract.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-[#062F26] text-white hover:bg-brand-teal transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  <Icon icon="lucide:external-link" width="16" />
                  Open in New Tab
                </a>
              )}
            </div>

            {/* Embedded PDF Viewer */}
            {property.ownerContract?.url && (
              <div className="mt-6 w-full h-[600px] md:h-[700px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <iframe
                  src={`${property.ownerContract.url}#view=FitH`}
                  title="Contract Agreement"
                  className="w-full h-full"
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#FAF6F0] border border-[#F3EFE9] rounded-xl p-5 md:p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold shrink-0">
                <Icon icon="lucide:shield-check" width="24" />
              </div>
              <div>
                <p className="text-base font-bold text-[#062F26]">
                  {property.ownerContract?.isCustomized ? 'Customized Agreement' : 'Standard Agreement'}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {property.ownerContract?.isCustomized ? 'Using customized contract text' : 'Using Housynest\'s default standardized contract'}
                </p>
              </div>
            </div>

            {/* Embedded Text Viewer */}
            <div className="w-full h-[600px] md:h-[700px] rounded-xl overflow-y-auto custom-scrollbar border border-slate-200 bg-white p-6 md:p-8" data-lenis-prevent="true">
              <div
                className="prose prose-sm md:prose-base max-w-none text-slate-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: property.ownerContract?.isCustomized && property.ownerContract?.contractTextEn
                    ? property.ownerContract.contractTextEn
                    : DEFAULT_ENGLISH_AGREEMENT
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabContract;
