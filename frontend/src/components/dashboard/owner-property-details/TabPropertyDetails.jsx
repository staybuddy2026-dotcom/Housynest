import React from 'react';
import { Icon } from '@iconify/react';

const TabPropertyDetails = ({ property }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-[#062F26] mb-5 flex items-center gap-2">
          <Icon icon="lucide:info" className="w-5 h-5 text-brand-teal" />
          Property Configuration & Details
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4 mb-6">
          {property.bhkType && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Configuration</p>
              <p className="text-sm font-bold text-slate-700">{property.bhkType}</p>
            </div>
          )}
          {property.furnishingStatus && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Furnishing</p>
              <p className="text-sm font-bold text-slate-700">{property.furnishingStatus}</p>
            </div>
          )}
          {property.bathrooms && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Bathrooms</p>
              <p className="text-sm font-bold text-slate-700">{property.bathrooms}</p>
            </div>
          )}
          {property.balconies && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Balconies</p>
              <p className="text-sm font-bold text-slate-700">{property.balconies}</p>
            </div>
          )}
          {property.builtUpArea && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Built-up Area</p>
              <p className="text-sm font-bold text-slate-700">{property.builtUpArea} sq.ft</p>
            </div>
          )}
          {property.carpetArea && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Carpet Area</p>
              <p className="text-sm font-bold text-slate-700">{property.carpetArea} sq.ft</p>
            </div>
          )}
          {property.propertyOnFloor && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Floor No.</p>
              <p className="text-sm font-bold text-slate-700">{property.propertyOnFloor} / {property.totalFloors || '?'}</p>
            </div>
          )}
          {property.facing && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Facing</p>
              <p className="text-sm font-bold text-slate-700">{property.facing}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9]">
            <h4 className="text-sm font-bold text-[#062F26] mb-3 flex items-center gap-2">
              <Icon icon="lucide:indian-rupee" className="w-4 h-4 text-brand-teal" />
              Rental & Financials
            </h4>
            <div className="space-y-3 sm:space-y-2.5">
              <div className="flex justify-between items-start gap-3 border-b border-slate-200/50 pb-2 sm:border-0 sm:pb-0">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Monthly Rent</span>
                <span className="text-sm font-black text-[#062F26] text-right break-words">₹{Number(property.monthlyRent || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-start gap-3 border-b border-slate-200/50 pb-2 sm:border-0 sm:pb-0">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Security Deposit</span>
                <span className="text-sm font-bold text-slate-700 text-right break-words">{property.securityAmount ? `₹${Number(property.securityAmount).toLocaleString('en-IN')}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-start gap-3">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Maintenance</span>
                <span className="text-sm font-bold text-slate-700 text-right break-words">{property.maintenanceCharges && property.maintenanceCharges !== '0' ? `₹${Number(property.maintenanceCharges).toLocaleString('en-IN')} / ${property.maintenancePeriod || 'month'}` : 'Included'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9]">
            <h4 className="text-sm font-bold text-[#062F26] mb-4 sm:mb-3 flex items-center gap-2">
              <Icon icon="lucide:users" className="w-4 h-4 text-blue-500" />
              Tenant Preferences
            </h4>
            <div className="space-y-3 sm:space-y-2.5">
              <div className="flex justify-between items-start gap-3 border-b border-slate-200/50 pb-2 sm:border-0 sm:pb-0">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Preferred Tenants</span>
                <span className="text-sm font-bold text-slate-700 text-right break-words">{property.preferredTenants?.length > 0 ? property.preferredTenants.join(', ') : 'Anyone'}</span>
              </div>
              <div className="flex justify-between items-start gap-3 border-b border-slate-200/50 pb-2 sm:border-0 sm:pb-0">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Max People</span>
                <span className="text-sm font-bold text-slate-700 text-right break-words">{property.maxPeople || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-start gap-3">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Available From</span>
                <span className="text-[11px] sm:text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md text-right break-words mt-[-2px]">{property.availableFromType === 'Immediate' ? 'Immediate' : (property.availableDate || 'N/A')}</span>
              </div>
            </div>
          </div>
        </div>

        {property.localityDescription && (
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#F3EFE9] mt-4">
            <h4 className="text-sm font-bold text-[#062F26] mb-2 flex items-center gap-2">
              <Icon icon="lucide:map" className="w-4 h-4 text-purple-500" />
              Locality Description
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.localityDescription}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default TabPropertyDetails;
