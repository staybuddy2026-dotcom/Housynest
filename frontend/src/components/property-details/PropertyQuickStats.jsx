import { Icon } from '@iconify/react';

const PropertyQuickStats = ({ property, propertyType }) => {
  return (
    <div className="w-full grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-start sm:justify-between gap-6 sm:gap-4 bg-white rounded-[24px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-6 lg:p-8 mb-8 border border-slate-50">
      {propertyType !== 'PG' && (
        <>
          <div className="flex items-center gap-3 lg:gap-4">
            <Icon icon="lucide:bed-double" className="w-5 h-5 lg:w-6 lg:h-6 text-brand-teal stroke-[2.5]" />
            <div>
              <p className="text-sm sm:text-sm lg:text-base font-bold text-[#062F26]">{property.title.match(/(\d+)BHK/i)?.[1] || '2'}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">BHK</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
        </>
      )}

      <div className="flex items-center gap-3 lg:gap-4">
        <Icon icon="lucide:home" className="w-5 h-5 lg:w-6 lg:h-6 text-brand-teal stroke-[2.5]" />
        <div>
          <p className="text-sm sm:text-sm lg:text-base font-bold text-[#062F26]">{propertyType}</p>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Property Type</p>
        </div>
      </div>
      <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>

      {propertyType === 'PG' ? (
        <>
          <div className="flex items-center gap-3 lg:gap-4">
            <Icon icon="lucide:users" className="w-5 h-5 lg:w-6 lg:h-6 text-brand-teal stroke-[2.5]" />
            <div>
              <p className="text-sm sm:text-sm lg:text-base font-bold text-[#062F26]">{property.tenantPreference || 'Anyone'}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tenants Preferred</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 lg:gap-4">
            <Icon icon="lucide:users-round" className="w-5 h-5 lg:w-6 lg:h-6 text-brand-teal stroke-[2.5]" />
            <div>
              <p className="text-sm sm:text-sm lg:text-base font-bold text-[#062F26]">{property.maxPeople || '4'}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Max People</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
        </>
      )}

      {propertyType !== 'PG' && (
        <>
          <div className="flex items-center gap-3 lg:gap-4">
            <Icon icon="lucide:building" className="w-5 h-5 lg:w-6 lg:h-6 text-brand-teal stroke-[2.5]" />
            <div>
              <p className="text-sm sm:text-sm lg:text-base font-bold text-[#062F26]">{property.category || 'Apartment'}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Category</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
        </>
      )}

      <div className="flex items-center gap-3 lg:gap-4">
        <Icon icon="lucide:user" className="w-5 h-5 lg:w-6 lg:h-6 text-brand-teal stroke-[2.5]" />
        <div>
          <p className="text-sm sm:text-sm lg:text-base font-bold text-[#062F26]">{propertyType === 'PG' ? (property.preferredGender || 'Male') : (property.tenantPreference || 'Family/Bachelors')}</p>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Preferred</p>
        </div>
      </div>

      {propertyType === 'PG' && (
        <>
          <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
          <div className="flex items-center gap-3 lg:gap-4">
            <Icon icon="lucide:utensils" className="w-5 h-5 lg:w-6 lg:h-6 text-brand-teal stroke-[2.5]" />
            <div>
              <p className="text-sm sm:text-sm lg:text-base font-bold text-[#062F26]">{property.vegNonVeg || 'Veg & Non-Veg'}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Food</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyQuickStats;
