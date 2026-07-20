import { Icon } from '@iconify/react';

const AdminPropertyViewModal = ({ property, onClose }) => {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#062F26]">Property Details</h2>
            <p className="text-sm text-slate-500 font-medium">{property.pgName || property.propertyCategory || 'Property Listing'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Basic Info & Owner */}
            <div className="space-y-6">

              {/* Owner Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Icon icon="lucide:user" className="w-4 h-4 text-blue-500" />
                  Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Name</span>
                    <span className="text-sm font-semibold text-slate-700">{property.owner?.fullName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Phone</span>
                    <span className="text-sm font-semibold text-slate-700">{property.owner?.phone || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Email</span>
                    <span className="text-sm font-semibold text-slate-700">{property.owner?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Basic Listing Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Listing Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Type</span>
                    <span className="text-sm font-semibold text-slate-700">{property.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Category</span>
                    <span className="text-sm font-semibold text-slate-700">{property.propertyCategory || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">City</span>
                    <span className="text-sm font-semibold text-slate-700">{property.city || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Locality</span>
                    <span className="text-sm font-semibold text-slate-700">{property.locality || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Address</span>
                    <span className="text-sm font-semibold text-slate-700">{property.address || '-'}</span>
                  </div>
                  {property.description && (
                    <div className="col-span-2">
                      <span className="text-xs font-bold text-slate-400 block uppercase">Description</span>
                      <span className="text-sm font-semibold text-slate-700">{property.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PG SPECIFIC DETAILS */}
              {property.propertyType === 'PG' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">PG Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">PG Present In</span>
                        <span className="text-sm font-semibold text-slate-700">{property.pgPresentIn || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Operational Since</span>
                        <span className="text-sm font-semibold text-slate-700">{property.operationalSince || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Preferred Gender</span>
                        <span className="text-sm font-semibold text-slate-700">{property.preferredGender || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Tenant Preference</span>
                        <span className="text-sm font-semibold text-slate-700">{property.tenantPreference || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Gate Closing Time</span>
                        <span className="text-sm font-semibold text-slate-700">{property.gateClosingTime || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Notice Period</span>
                        <span className="text-sm font-semibold text-slate-700">{property.noticePeriod || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {property.rooms && property.rooms.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Rooms</h3>
                      <div className="space-y-3">
                        {property.rooms.map((room, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="font-bold text-sm text-slate-800 mb-2">{room.sharingType} Sharing</div>
                            <div className="grid grid-cols-2 gap-y-2 text-xs">
                              <div><span className="text-slate-500">Rent:</span> ₹{room.rentPerBed}</div>
                              <div><span className="text-slate-500">Deposit:</span> ₹{room.depositPerBed}</div>
                              <div><span className="text-slate-500">Total Beds:</span> {room.totalBeds}</div>
                              <div><span className="text-slate-500">Available:</span> {room.availableBeds}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Amenities & Services</h3>
                    <div className="text-xs text-slate-700 space-y-2">
                      {property.services && property.services.length > 0 && (
                        <div><strong className="text-slate-500 block uppercase text-xs mb-1">Services:</strong> {property.services.join(', ')}</div>
                      )}
                      {property.commonAmenities && property.commonAmenities.length > 0 && (
                        <div><strong className="text-slate-500 block uppercase text-xs mb-1">Common Amenities:</strong> {property.commonAmenities.join(', ')}</div>
                      )}
                      {property.foodProvided && (
                        <div>
                          <strong className="text-slate-500 block uppercase text-xs mb-1">Food:</strong>
                          Provided ({property.vegNonVeg || 'N/A'}) - Meals: {property.meals?.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* TENANT SPECIFIC DETAILS */}
              {property.propertyType === 'Tenant' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Property Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">BHK Type</span>
                        <span className="text-sm font-semibold text-slate-700">{property.bhkType || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Furnishing</span>
                        <span className="text-sm font-semibold text-slate-700">{property.furnishingStatus || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Bathrooms</span>
                        <span className="text-sm font-semibold text-slate-700">{property.bathrooms || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Balconies</span>
                        <span className="text-sm font-semibold text-slate-700">{property.balconies || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Built-up Area</span>
                        <span className="text-sm font-semibold text-slate-700">{property.builtUpArea ? `${property.builtUpArea} sq.ft` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Carpet Area</span>
                        <span className="text-sm font-semibold text-slate-700">{property.carpetArea ? `${property.carpetArea} sq.ft` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Floor</span>
                        <span className="text-sm font-semibold text-slate-700">{property.propertyOnFloor} of {property.totalFloors}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Age of Property</span>
                        <span className="text-sm font-semibold text-slate-700">{property.ageOfProperty || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Pricing & Preferences</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Monthly Rent</span>
                        <span className="text-sm font-bold text-blue-700">₹{property.monthlyRent || '0'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Security Deposit</span>
                        <span className="text-sm font-semibold text-slate-700">₹{property.securityAmount || '0'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Maintenance</span>
                        <span className="text-sm font-semibold text-slate-700">{property.maintenanceCharges ? `₹${property.maintenanceCharges} / ${property.maintenancePeriod}` : 'None'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Preferred Tenants</span>
                        <span className="text-sm font-semibold text-slate-700">{property.preferredTenants?.join(', ') || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Max People</span>
                        <span className="text-sm font-semibold text-slate-700">{property.maxPeople || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Available From</span>
                        <span className="text-sm font-semibold text-slate-700">{property.availableFromType === 'Immediate' ? 'Immediate' : (property.availableDate || '-')}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}


            </div>

            {/* Right Column: Verification Docs */}
            <div className="space-y-6">

              <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Icon icon="lucide:shield-check" className="w-4 h-4" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#062F26]">Verification Documents</h3>
                </div>

                {property.verificationDocs && property.verificationDocs.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600 mb-2">Review these documents carefully before verifying the property.</p>
                    <div className="grid grid-cols-2 gap-3">
                      {property.verificationDocs.map((doc, idx) => {
                        const isPdf = doc.url.toLowerCase().includes('.pdf');
                        return (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-lg border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all group"
                          >
                            <Icon
                              icon={isPdf ? "lucide:file-text" : "lucide:image"}
                              className="w-8 h-8 text-emerald-400 group-hover:text-emerald-500 transition-colors"
                            />
                            <span className="text-xs font-bold text-slate-600 truncate w-full text-center">Document {idx + 1}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Icon icon="lucide:file-x-2" className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm font-medium text-center max-w-50">No verification documents were uploaded by the owner.</p>
                  </div>
                )}
              </div>

              {/* Property Images (Moved to Right Column) */}
              {property.images && property.images.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Icon icon="lucide:image" className="w-4 h-4" />
                    </div>
                    <h3 className="text-[15px] font-bold text-[#062F26]">Property Images ({property.images.length})</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {property.images.map((img, idx) => (
                      <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity shadow-sm group relative">
                        <img src={img.url} alt="Property" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Icon icon="lucide:external-link" className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyViewModal;
