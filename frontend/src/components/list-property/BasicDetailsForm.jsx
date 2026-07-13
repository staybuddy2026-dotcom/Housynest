import { useState } from 'react';
import { Icon } from '@iconify/react';

const InputField = ({ label, required, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all placeholder:font-normal placeholder:text-slate-400"
      {...props}
    />
  </div>
);

const SelectField = ({ label, required, options, ...props }) => (
  <div className="flex flex-col gap-1.5 relative">
    <label className="text-xs font-bold text-[#062F26]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all appearance-none text-slate-700"
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <Icon icon="lucide:chevron-down" width="16" />
      </div>
    </div>
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-base font-bold text-[#062F26] mb-5">{title}</h3>
);

const BasicDetailsForm = ({ formData, setFormData }) => {
  const [newUsp, setNewUsp] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUspAdd = (e) => {
    e.preventDefault();
    if (newUsp.trim() && !formData.usps.includes(newUsp.trim())) {
      setFormData(prev => ({ ...prev, usps: [...prev.usps, newUsp.trim()] }));
      setNewUsp('');
    }
  };

  const handleUspRemove = (uspToRemove) => {
    setFormData(prev => ({ ...prev, usps: prev.usps.filter(u => u !== uspToRemove) }));
  };

  const toggleMeal = (meal) => {
    setFormData(prev => {
      const meals = prev.meals.includes(meal)
        ? prev.meals.filter(m => m !== meal)
        : [...prev.meals, meal];
      return { ...prev, meals };
    });
  };

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm">

      {/* Property Type Toggle */}
      <SectionTitle title="Basic Details" />
      <div className="flex flex-col gap-2 mb-8">
        <label className="text-xs font-bold text-[#062F26]">I want to list</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, propertyType: 'PG' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-bold text-sm transition-all
              ${formData.propertyType === 'PG' ? 'border-brand-teal bg-[#EAF5F2] text-brand-teal' : 'border-slate-100 bg-white text-slate-500 hover:border-brand-teal/30 hover:bg-slate-50'}`}
          >
            <Icon icon="lucide:users" width="20" /> PG / Paying Guest
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, propertyType: 'Tenant' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-bold text-sm transition-all
              ${formData.propertyType === 'Tenant' ? 'border-brand-teal bg-[#EAF5F2] text-brand-teal' : 'border-slate-100 bg-white text-slate-500 hover:border-brand-teal/30 hover:bg-slate-50'}`}
          >
            <Icon icon="lucide:home" width="20" /> Rental Property / Tenant
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-10">
        <InputField label="Property Name / Title" name="title" required value={formData.title} onChange={handleChange} placeholder="Luxury Green Nest PG" />

        <div className="grid grid-cols-2 gap-6">
          <SelectField label="Property Category" name="category" required options={['PG', 'Hostel', 'Co-living']} value={formData.category} onChange={handleChange} />
          <SelectField label="Preferred For" name="preferredFor" required options={['Male', 'Female', 'Anyone']} value={formData.preferredFor} onChange={handleChange} />
        </div>

        <InputField label="Full Address" name="address" required value={formData.address} onChange={handleChange} placeholder="Koramangala 4th Block, Bangalore, Karnataka - 560034" />

        <div className="grid grid-cols-3 gap-6">
          <InputField label="Landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near Forum Mall" />
          <InputField label="Area / Locality" name="locality" required value={formData.locality} onChange={handleChange} placeholder="Koramangala" />
          <InputField label="Pincode" name="pincode" required value={formData.pincode} onChange={handleChange} placeholder="560034" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <InputField label="Google Map Link (Optional)" name="mapLink" value={formData.mapLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
          <InputField label="Latitude (Optional)" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="12.9352" />
          <InputField label="Longitude (Optional)" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="77.6245" />
        </div>
      </div>

      {/* Pricing Details */}
      <SectionTitle title="Pricing Details" />
      <div className="flex flex-col gap-6 mb-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-[#062F26]">Monthly Rent (Starting From) <span className="text-red-500">*</span></label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500 font-medium">₹</span>
              <input type="number" name="rent" value={formData.rent} onChange={handleChange} placeholder="6000" className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-[#062F26]">Security Deposit <span className="text-red-500">*</span></label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500 font-medium">₹</span>
              <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} placeholder="10000" className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium absolute -bottom-5">Refundable</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-2">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-[#062F26]">Maintenance Charges</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500 font-medium">₹</span>
              <input type="text" name="maintenanceCharges" value={formData.maintenanceCharges} onChange={handleChange} placeholder="Included in Rent" className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
            </div>
          </div>
          <SelectField label="Maintenance Type" name="maintenanceType" options={['Included', 'Extra per month']} value={formData.maintenanceType} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-[#062F26]">Food Charges</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500 font-medium">₹</span>
              <input type="text" name="foodCharges" value={formData.foodCharges} onChange={handleChange} placeholder="Included in Rent" className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-[#062F26]">Food Provided</label>
            <div className="flex items-center gap-6 mt-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="foodProvided" checked={formData.foodProvided === true} onChange={() => setFormData({ ...formData, foodProvided: true })} className="w-4 h-4 text-brand-teal focus:ring-brand-teal border-slate-300" />
                <span className="text-sm font-bold text-slate-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="foodProvided" checked={formData.foodProvided === false} onChange={() => setFormData({ ...formData, foodProvided: false })} className="w-4 h-4 text-brand-teal focus:ring-brand-teal border-slate-300" />
                <span className="text-sm font-bold text-slate-700">No</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <SelectField label="Veg / Non-Veg" name="vegNonVeg" options={['Both', 'Veg Only', 'Non-Veg Only']} value={formData.vegNonVeg} onChange={handleChange} />
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#062F26]">Meals Included</label>
            <div className="flex items-center gap-2 mt-0.5">
              {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => toggleMeal(meal)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors ${formData.meals.includes(meal) ? 'bg-[#EAF5F2] text-brand-teal' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {meal}
                </button>
              ))}
              <button className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <Icon icon="lucide:plus" width="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Details */}
      <SectionTitle title="Availability Details" />
      <div className="flex flex-col gap-6 mb-10">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-[#062F26]">Available From <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Icon icon="lucide:calendar" width="16" />
              </div>
            </div>
          </div>
          <SelectField label="Rental Period" name="rentalPeriod" required options={['11 Months', '6 Months', 'No Lock-in']} value={formData.rentalPeriod} onChange={handleChange} />
          <SelectField label="Notice Period" name="noticePeriod" required options={['30 Days', '15 Days', '2 Months']} value={formData.noticePeriod} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-[#062F26]">Gate Closing Time</label>
            <div className="relative">
              <input type="time" name="gateClosingTime" value={formData.gateClosingTime} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Icon icon="lucide:clock" width="16" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#062F26]">Short Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Property description..."
            rows="4"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal resize-none"
          ></textarea>
          <div className="text-right text-[10px] text-slate-400 font-medium">{formData.description.length}/500</div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#062F26]">USP (Unique Selling Point)</label>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {formData.usps.map((usp, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-[#EAF5F2] text-brand-teal px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
                {usp}
                <button type="button" onClick={() => handleUspRemove(usp)} className="hover:text-red-500 transition-colors">
                  <Icon icon="lucide:x" width="12" />
                </button>
              </div>
            ))}
            <div className="relative">
              <input
                type="text"
                value={newUsp}
                onChange={(e) => setNewUsp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUspAdd(e);
                  }
                }}
                placeholder="Add USP"
                className="w-32 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-brand-teal"
              />
              <button type="button" onClick={(e) => handleUspAdd(e)} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-teal">
                <Icon icon="lucide:plus" width="14" />
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Example: Prime Location, Near Metro, 24x7 Security, Great Food, etc.</span>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
        <button type="button" className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="button" className="px-8 py-3 rounded-xl bg-[#062F26] text-white font-bold text-sm hover:bg-[#04473a] transition-colors shadow-lg shadow-[#062F26]/20 flex items-center gap-2">
          Save & Continue <Icon icon="lucide:arrow-right" width="16" />
        </button>
      </div>

    </div>
  );
};

export default BasicDetailsForm;
