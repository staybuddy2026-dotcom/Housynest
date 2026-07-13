import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const FilterSection = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('PG');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pgFor, setPgFor] = useState('');
  const [preferredTenants, setPreferredTenants] = useState('');
  const [occupancy, setOccupancy] = useState('');

  const typeDropdownRef = useRef(null);
  const priceDropdownRef = useRef(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedType) params.append('type', selectedType);
    if (searchQuery) params.append('search', searchQuery);
    if (selectedPrice) params.append('price', selectedPrice);
    if (pgFor) params.append('pgFor', pgFor);
    if (preferredTenants) params.append('tenants', preferredTenants);
    if (occupancy) params.append('occupancy', occupancy);

    navigate(`/properties?${params.toString()}`);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setIsPriceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Search Filter Bar */}
      <div className="max-w-[1300px] mx-auto w-full px-4 -mt-8 sm:-mt-10 lg:mt-[-60px] relative z-30 mb-20">
        <div className="bg-[#062F26] rounded-2xl px-3 py-2 lg:py-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between border border-[#13463a]">

          {/* Property Type Dropdown */}
          <div
            ref={typeDropdownRef}
            className="w-full lg:w-[200px] flex flex-col gap-1 px-4 lg:px-6 py-3 lg:py-0 lg:border-r border-[#13463a] relative shrink-0 cursor-pointer group"
            onClick={() => {
              const willOpen = !isTypeDropdownOpen;
              setIsTypeDropdownOpen(willOpen);
              if (willOpen) {
                setIsPriceDropdownOpen(false);
                setTimeout(() => window.scrollBy({ top: 250, behavior: 'smooth' }), 50);
              }
            }}
          >
            <span className="text-xs font-semibold text-[#a1b8b2] mb-1">Property Type</span>
            <div className="flex items-center justify-between w-full border-b border-[#13463a] pb-1.5 group-hover:border-brand-yellow transition-colors">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon icon={selectedType === 'Tenant' ? "lucide:user-check" : "lucide:user"} className="text-brand-yellow" width="16" />
                <span className="truncate">{selectedType}</span>
              </div>
              <Icon icon="lucide:chevron-down" className="text-[#a1b8b2] group-hover:text-white transition-colors shrink-0" width="18" />
            </div>

            {/* Dropdown Menu */}
            {isTypeDropdownOpen && (
              <div className="absolute top-[100%] lg:top-[120%] left-0 w-full lg:w-[240px] bg-[#0B3D32] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-[#13463a] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#a1b8b2] hover:bg-[#13463a] hover:text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); setSelectedType('PG'); setIsTypeDropdownOpen(false); }}
                >
                  <Icon icon="lucide:user" className="text-brand-yellow" width="18" />
                  PG
                </button>
                <button
                  className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#a1b8b2] hover:bg-[#13463a] hover:text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); setSelectedType('Tenant'); setIsTypeDropdownOpen(false); }}
                >
                  <Icon icon="lucide:user-check" className="text-brand-yellow" width="18" />
                  Tenant
                </button>
              </div>
            )}
          </div>

          {/* Location / Name Input */}
          <div className="flex-1 flex flex-col gap-1 px-4 lg:px-6 py-3 lg:py-0 lg:border-r border-[#13463a] group">
            <span className="text-xs font-semibold text-[#a1b8b2] mb-1">Search Name / City</span>
            <div className="flex items-center gap-2 w-full border-b border-[#13463a] pb-1.5 group-focus-within:border-brand-yellow group-hover:border-brand-yellow transition-colors">
              <Icon icon="lucide:map-pin" className="text-brand-yellow shrink-0" width="17" />
              <input
                type="text"
                placeholder="e.g. Koramangala, Bangalore"
                className="w-full text-sm font-semibold text-white placeholder:text-[#a1b8b2]/70 outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Price Range Input */}
          <div
            ref={priceDropdownRef}
            className="w-full lg:w-[250px] flex flex-col gap-1 px-4 lg:px-6 py-3 lg:py-0 lg:border-r border-[#13463a] relative shrink-0 cursor-pointer group"
            onClick={() => {
              const willOpen = !isPriceDropdownOpen;
              setIsPriceDropdownOpen(willOpen);
              if (willOpen) {
                setIsTypeDropdownOpen(false);
                setTimeout(() => window.scrollBy({ top: 350, behavior: 'smooth' }), 50);
              }
            }}
          >
            <span className="text-xs font-semibold text-[#a1b8b2] mb-1">Price Range</span>
            <div className="flex items-center justify-between w-full border-b border-[#13463a] pb-1.5 group-hover:border-brand-yellow transition-colors">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:wallet" className="text-brand-yellow" width="16" />
                <span className={`text-sm font-semibold transition-colors ${selectedPrice ? 'text-white' : 'text-[#a1b8b2] group-hover:text-white'}`}>
                  {selectedPrice || 'Select Price'}
                </span>
              </div>
              <Icon icon="lucide:chevron-down" className="text-[#a1b8b2] group-hover:text-white transition-colors shrink-0" width="18" />
            </div>

            {/* Dropdown Menu */}
            {isPriceDropdownOpen && (
              <div className="absolute top-[100%] lg:top-[120%] left-0 w-full lg:w-[260px] bg-[#0B3D32] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-[#13463a] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                {['Any Price', 'Under ₹5,000', '₹5,000 - ₹10,000', '₹10,000 - ₹15,000', '₹15,000 - ₹20,000', 'Above ₹20,000'].map((price) => (
                  <button
                    key={price}
                    className="w-full flex items-center cursor-pointer px-4 py-3 rounded-xl text-sm font-semibold text-[#a1b8b2] hover:bg-[#13463a] hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPrice(price === 'Any Price' ? '' : price);
                      setIsPriceDropdownOpen(false);
                    }}
                  >
                    {price}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions: More Filters + Search */}
          <div className="flex flex-row items-center gap-3 px-3 lg:px-0 lg:pl-6 lg:pr-1 py-4 lg:py-0 shrink-0 w-full lg:w-auto mt-1 lg:mt-0">
            <button
              onClick={(e) => { e.stopPropagation(); setIsDrawerOpen(true); }}
              className="flex items-center justify-center flex-[1.2] sm:flex-1 lg:flex-none cursor-pointer gap-1.5 sm:gap-2 px-2 sm:px-5 py-3.5 rounded-[14px] border border-[#13463a] text-[#a1b8b2] font-semibold text-xs sm:text-sm hover:border-brand-yellow hover:text-brand-yellow hover:bg-[#13463a]/50 transition-all bg-white/5"
            >
              <Icon icon="lucide:sliders-horizontal" width="18" className="shrink-0" />
              Filters
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center justify-center flex-[2] lg:flex-none cursor-pointer gap-2 px-2 sm:px-8 py-3.5 rounded-[14px] bg-brand-yellow hover:bg-brand-yellow-hover text-slate-900 font-bold text-sm sm:text-sm shadow-[0_8px_20px_rgba(255,184,0,0.15)] hover:shadow-[0_8px_25px_rgba(255,184,0,0.25)] transition-all duration-300">
              <Icon icon="lucide:search" width="18" className="shrink-0 sm:w-5 sm:h-5" />
              Search PG
            </button>
          </div>

        </div>
      </div>

      {/* Right Drawer Overlay */}
      <div className={`fixed inset-0 z-[100] flex justify-end pointer-events-none ${isDrawerOpen ? 'pointer-events-auto' : ''}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsDrawerOpen(false)}
        ></div>

        {/* Drawer Panel */}
        <div
          className={`relative h-full w-full max-w-[380px] bg-white shadow-2xl flex flex-col pointer-events-auto transition-transform duration-500 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="lucide:sliders-horizontal" className="text-brand-teal" width="18" />
              More Filters
            </h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Icon icon="lucide:x" width="18" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 flex flex-col justify-between px-6 py-5 overflow-hidden">
            <div className="space-y-6">

              {/* PG For */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-brand-teal">
                    <Icon icon="lucide:users" width="16" />
                  </div>
                  PG For
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPgFor(opt === pgFor ? '' : opt)}
                      className={`py-2 rounded-lg border text-xs font-semibold transition-all ${pgFor === opt
                        ? 'border-[#04473a] text-[#04473a] bg-teal-50/50'
                        : 'border-gray-200 text-slate-600 hover:border-[#04473a] hover:text-[#04473a] hover:bg-teal-50/30'
                        }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Tenants */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-brand-teal">
                    <Icon icon="lucide:briefcase" width="16" />
                  </div>
                  Preferred Tenants
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {['Students', 'Professionals', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPreferredTenants(opt === preferredTenants ? '' : opt)}
                      className={`py-2 rounded-lg border text-xs font-semibold transition-all ${preferredTenants === opt
                        ? 'border-[#04473a] text-[#04473a] bg-teal-50/50'
                        : 'border-gray-200 text-slate-600 hover:border-[#04473a] hover:text-[#04473a] hover:bg-teal-50/30'
                        }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupancy */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-brand-teal">
                    <Icon icon="lucide:bed" width="16" />
                  </div>
                  Occupancy
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {['Single', 'Double', 'Triple', 'Four'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setOccupancy(opt === occupancy ? '' : opt)}
                      className={`py-2 rounded-lg border text-xs font-semibold transition-all ${occupancy === opt
                        ? 'border-[#04473a] text-[#04473a] bg-teal-50/50'
                        : 'border-gray-200 text-slate-600 hover:border-[#04473a] hover:text-[#04473a] hover:bg-teal-50/30'
                        }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex items-start gap-2 mt-4">
              <Icon icon="lucide:info" className="text-brand-teal shrink-0 mt-0.5" width="16" />
              <p className="text-xs text-teal-800 leading-tight font-medium">
                Applying these advanced filters helps us find the most suitable properties tailored to your specific lifestyle.
              </p>
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setPgFor('');
                setPreferredTenants('');
                setOccupancy('');
              }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleSearch}
              className="flex-[2] py-2.5 rounded-xl bg-[#04473a] hover:bg-[#03362c] text-white font-bold text-sm shadow-md transition-all flex justify-center items-center gap-2"
            >
              Show Results
              <Icon icon="lucide:arrow-right" width="16" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default FilterSection;
