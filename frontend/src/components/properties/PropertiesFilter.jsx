import { Icon } from '@iconify/react';

const PropertiesFilter = ({
  propertyFor, setPropertyFor,
  propertyType, setPropertyType,
  roomType, setRoomType,
  budgetRange, setBudgetRange,
  amenitiesFilter, setAmenitiesFilter,
  foodPreference, setFoodPreference,
  verifiedOnly, setVerifiedOnly,
  isOpen, onClose
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        />
      )}

      {/* Drawer Container */}
      <div className={`fixed inset-y-0 right-0 z-[1000] w-[85vw] sm:w-[320px] bg-white shadow-2xl lg:shadow-none lg:static lg:w-[300px] lg:flex-shrink-0 lg:z-auto lg:bg-transparent transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="bg-white lg:rounded-lg lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:border lg:border-slate-100 lg:sticky lg:top-[10px] h-[100dvh] lg:h-[calc(100vh-100px)] flex flex-col overflow-hidden">

          {/* Header (Fixed) */}
          <div className="flex-none flex items-center justify-between px-5 sm:px-6 lg:px-4 pt-6 lg:pt-4 pb-4 border-b border-slate-100 bg-white">
            <h2 className="text-lg font-bold text-slate-900">Filters</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setPropertyFor('Both');
                  setPropertyType('');
                  setRoomType('');
                  setBudgetRange('Any');
                  setAmenitiesFilter('');
                  setFoodPreference('');
                  setVerifiedOnly(false);
                }}
                className="text-brand-teal cursor-pointer text-xs underline font-bold hover:underline flex items-center gap-1"
              >
                Reset Filters <Icon icon="lucide:refresh-cw" className="w-3 h-3" />
              </button>
              {/* Close Button for Mobile */}
              <button
                onClick={onClose}
                className="lg:hidden bg-slate-100 p-1.5 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
                aria-label="Close filters"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 lg:px-4 py-5 space-y-5 custom-scrollbar">

            {/* Property For */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Property For</label>
              <div className="relative flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/80 isolate">
                {/* Sliding Indicator */}
                <div
                  className="absolute top-1 bottom-1 w-[calc(33.333%-2.66px)] bg-white rounded-md shadow-[0_2px_8px_rgba(4,47,38,0.06)] border border-slate-200/60 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
                  style={{ transform: `translateX(${['PG', 'Tenant', 'Both'].indexOf(propertyFor) * 100}%)`, left: '4px' }}
                />
                {['PG', 'Tenant', 'Both'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPropertyFor(type)}
                    className={`flex-1 relative z-10 py-2 text-xs font-bold cursor-pointer rounded-md transition-colors duration-200 ${propertyFor === type ? 'text-brand-teal drop-shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Property Type</label>
              <div className="relative">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-3 pl-3 pr-8 text-xs font-medium text-slate-500 outline-none focus:border-brand-teal appearance-none cursor-pointer">
                  <option value="">Select Property Type</option>
                  <option value="Villa">Villa</option>
                  <option value="Flat">Flat</option>
                  <option value="House">House</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Room Type</label>
              <div className="relative">
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-3 pl-3 pr-8 text-xs font-medium text-slate-500 outline-none focus:border-brand-teal appearance-none cursor-pointer">
                  <option value="">Select Room Type</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Sharing Room">Sharing Room</option>
                  <option value="Entire Place">Entire Place</option>
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Budget Range</label>
              <div className="w-full h-1 bg-slate-200 rounded-full mb-3 relative mt-2">
                <div className="absolute left-0 right-1/4 h-full bg-[#062F26] rounded-full"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#062F26] rounded-full shadow cursor-pointer"></div>
                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#062F26] rounded-full shadow cursor-pointer"></div>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>₹0</span>
                <span>₹1,00,000+</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Any', '₹0 - ₹10K', '₹10K - ₹20K', '₹20K+'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setBudgetRange(range)}
                    className={`py-2 text-xs font-bold rounded-md border transition-all ${budgetRange === range ? 'bg-teal-50 border-brand-teal text-brand-teal' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Amenities</label>
              <div className="relative">
                <select
                  value={amenitiesFilter}
                  onChange={(e) => setAmenitiesFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-3 pl-3 pr-8 text-xs font-medium text-slate-500 outline-none focus:border-brand-teal appearance-none cursor-pointer">
                  <option value="">Select Amenities</option>
                  <option value="Wi-Fi">Wi-Fi</option>
                  <option value="AC">AC</option>
                  <option value="Food">Food</option>
                  <option value="Parking">Parking</option>
                  <option value="Gym">Gym</option>
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Food Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Food Preference</label>
              <div className="relative">
                <select
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-3 pl-3 pr-8 text-xs font-medium text-slate-500 outline-none focus:border-brand-teal appearance-none cursor-pointer">
                  <option value="">Any Food Preference</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Both">Both (Veg & Non-Veg)</option>
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Footer (Fixed) */}
          <div className="flex-none px-5 sm:px-6 lg:px-4 py-4 lg:py-3 border-t border-slate-100 flex flex-col gap-3 pb-8 lg:pb-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-brand-teal cursor-pointer text-brand-teal bg-gray-100 border-gray-300 rounded focus:ring-brand-teal focus:ring-1 transition-all" />
              <label htmlFor="verifiedOnly" className="text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                Verified Properties Only <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-brand-teal" />
              </label>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#062F26] hover:bg-[#04201a] text-white text-sm font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Icon icon="lucide:sliders-horizontal" className="w-4 h-4" /> Apply Filters
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default PropertiesFilter;
