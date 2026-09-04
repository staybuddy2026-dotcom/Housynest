export const DEFAULT_ENGLISH_AGREEMENT = `<h1>RENTAL AGREEMENT</h1>
<p style="text-align: center; font-weight: bold;">(11-Month Rental Agreement)</p>

This Leave and License Agreement ("Agreement") is entered into on [agreement_date], at [agreement_city].

`;

export const DEFAULT_TERMS_AND_CONDITIONS = [
  {
    titleEn: "Nature and Duration of Agreement",
    descriptionEn: "This Agreement is a Leave and License Agreement granted for a period of 11 (eleven) months from the Commencement Date. It does not create any tenancy rights, sub-tenancy rights, or any other right of occupation in favor of the Licensee. The Licensee shall use the accommodation solely for residential purposes.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Monthly Rent and Payment",
    descriptionEn: "The Licensee agrees to pay the monthly license fee of ₹[rent_amount] on or before the 5th day of every calendar month. Continued occupation of the premises is conditional on timely payment of rent. A late fee may be charged for delayed payments as per the Licensor's policy.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Security Deposit and Lock-in Period",
    descriptionEn: "A refundable security deposit of ₹[deposit_amount] is collected prior to move-in. The Licensee agrees to a minimum lock-in period of 3 months. If the Licensee vacates the premises before the lock-in period expires, the security deposit shall be forfeited. The deposit shall be refunded upon vacating the premises after adjusting any outstanding dues, unpaid rent, utility charges, or damages.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Utilities and Additional Charges",
    descriptionEn: "Charges for electricity, water, internet, laundry, food, housekeeping, and any other services availed by the Licensee shall be borne by the Licensee as per actual consumption or as per the Licensor's applicable rate card.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Maintenance and Care of Premises",
    descriptionEn: "The Licensee shall maintain the accommodation, attached furniture, fixtures, fittings, and common areas in good, clean, and hygienic condition. The cost of any willful damage or negligent damage caused by the Licensee shall be recoverable from the Licensee or from the security deposit.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "House Rules and Prohibited Activities",
    descriptionEn: "a) Smoking, consumption of alcohol, and use of illegal substances are strictly prohibited within the premises.\nb) The Licensee shall conduct themselves in a lawful and considerate manner so as not to disturb other residents or neighbors.\nc) Cooking in rooms is strictly prohibited unless a designated kitchen area is provided.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Guests and Visitors",
    descriptionEn: "Guests and visitors are permitted only in the designated common areas during visiting hours. Overnight stays of guests are strictly prohibited without prior written permission from the Licensor and may incur additional charges.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Alterations",
    descriptionEn: "The Licensee shall not make any structural changes, permanent alterations, drilling, painting, or modifications to the accommodation or common areas.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Notice Period and Termination",
    descriptionEn: "After the lock-in period, either party may terminate this Agreement by giving a 30-day advance notice in writing. The Licensor reserves the right to terminate this Agreement immediately and evict the Licensee in the event of breach of any term, non-payment of rent, or misconduct.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Vacation of Premises",
    descriptionEn: "Upon termination or expiry of this Agreement, the Licensee shall vacate the accommodation, remove all personal belongings, return all keys, and hand over the premises in the same condition as received, subject to normal wear and tear.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Liability",
    descriptionEn: "The Licensor shall not be liable for any loss, theft, or damage to the Licensee's personal belongings within the premises.",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Governing Law and Jurisdiction",
    descriptionEn: "This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the jurisdiction of the competent courts at [agreement_city].",
    titleGu: "", descriptionGu: ""
  },
  {
    titleEn: "Entire Agreement",
    descriptionEn: "This Agreement constitutes the entire understanding between the parties regarding the accommodation.",
    titleGu: "", descriptionGu: ""
  }
];

// Variable tags for quick insertion
export const availableTags = [
  { tag: '[agreement_date]', label: 'Agreement Date' },
  { tag: '[agreement_city]', label: 'Agreement City' },
  { tag: '[property_name]', label: 'Property Name' },
  { tag: '[owner_name]', label: 'Owner Name' },
  { tag: '[property_address]', label: 'Address' },
  { tag: '[property_locality]', label: 'Locality' },
  { tag: '[property_city]', label: 'City' },
  { tag: '[rent_amount]', label: 'Monthly Rent' },
  { tag: '[deposit_amount]', label: 'Security Deposit' },
  { tag: '[tenant_full_name]', label: 'Tenant Name' },
  { tag: '[tenant_mobile]', label: 'Tenant Mobile' },
  { tag: '[tenant_email]', label: 'Tenant Email' },
  { tag: '[room_name]', label: 'Room Name' },
  { tag: '[bed_number]', label: 'Bed Number' },
  { tag: '[move_in_date]', label: 'Move-In Date' }
];
