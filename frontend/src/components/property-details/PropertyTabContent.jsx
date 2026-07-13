import { Icon } from '@iconify/react';

const PropertyTabContent = ({
  activeTab,
  property,
  propertyType,
  pgRooms,
  selectedRoomIndex,
  setSelectedRoomIndex
}) => {
  return (
    <div className="flex-1 bg-white rounded-[24px] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 p-4 sm:p-6 lg:p-8 min-h-[400px]">

      {activeTab === 'Overview' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#062F26]">About Property</h3>
          </div>
          <p className="text-sm text-slate-600 leading-[1.7] font-medium mb-8 whitespace-pre-line">
            {property.description || (propertyType === 'PG' ? (
              <>{property.title} offers a comfortable and secure living experience with well-furnished rooms, modern amenities and hygienic food. Located in the heart of {property.location.split(',').slice(-2)[0] || property.location.split(',')[0]}, it is ideal for students and working professionals.</>
            ) : (
              <>{property.title} offers a premium living experience with excellent ventilation, modern amenities, and easy access to local markets and transport. Ideal for families and working professionals seeking a comfortable home.</>
            ))}
          </p>

          <div className="bg-[#F4F9F8] rounded-xl p-5 flex gap-4 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-brand-teal/20">
            <div className="text-brand-teal flex-shrink-0 mt-0.5">
              <Icon icon="lucide:award" className="w-[22px] h-[22px] group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h4 className="font-bold text-[#062F26] text-sm mb-1">USP</h4>
              <p className="text-sm text-slate-600 font-medium leading-[1.6]">
                {property.uspText || (propertyType === 'PG'
                  ? `Prime location in ${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} with excellent connectivity, modern amenities, hygienic food and a peaceful environment.`
                  : `Prime location in ${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} with excellent connectivity, spacious interiors, dedicated parking, and a peaceful environment.`)}
              </p>
            </div>
          </div>



          {propertyType !== 'PG' && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <h4 className="text-base font-bold text-[#062F26] mb-3">Locality Description</h4>
              <p className="text-sm text-slate-600 leading-[1.7] font-medium whitespace-pre-line">
                {property.localityDescription || `${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} is one of the most prominent neighborhoods, known for its vibrant atmosphere and tree-lined streets. It offers a perfect blend of residential tranquility and commercial energy. The area is highly sought after by students and young professionals due to its proximity to major IT parks, top-tier educational institutions, and an abundance of cafes, restaurants, and entertainment options. With excellent connectivity to other parts of the city, living in ${property.location.split(',').slice(-2)[0] || property.location.split(',')[0]} provides unmatched convenience and lifestyle benefits.`}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Room Details' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Room Details</h3>

          {propertyType === 'PG' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {pgRooms.map((room, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRoomIndex(idx)}
                  className={`cursor-pointer rounded-2xl border p-6 transition-all duration-300 transform hover:-translate-y-1 ${selectedRoomIndex === idx
                    ? 'bg-white border-brand-teal shadow-[0_10px_30px_rgba(10,168,125,0.12)] ring-2 ring-brand-teal/10'
                    : 'bg-white border-slate-200 shadow-sm hover:border-brand-teal/40 hover:shadow-[0_10px_30px_rgba(10,168,125,0.08)]'
                    } group`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className={`text-lg font-bold transition-colors ${selectedRoomIndex === idx ? 'text-brand-teal' : 'text-[#062F26] group-hover:text-brand-teal'}`}>{room.title}</h4>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${selectedRoomIndex === idx ? 'bg-brand-teal text-white' : 'bg-[#EAF5F2] text-brand-teal group-hover:bg-brand-teal group-hover:text-white'}`}>{room.available} available</span>
                  </div>

                  <div className="flex flex-col gap-3 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Total Sharing</span>
                      <span className="text-sm font-bold text-[#062F26]">{room.totalBeds}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Monthly Rent</span>
                      <span className={`text-sm font-bold transition-colors ${selectedRoomIndex === idx ? 'text-brand-teal' : 'text-[#062F26]'}`}>₹ {room.rent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Security Deposit</span>
                      <span className="text-sm font-bold text-[#062F26]">₹ {room.deposit}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5 flex flex-wrap gap-2">
                    {room.amenities.map((amenity, i) => (
                      <span key={i} className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border ${selectedRoomIndex === idx ? 'bg-[#EAF5F2] border-brand-teal/30 text-brand-teal' : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-[#EAF5F2] group-hover:border-brand-teal/20 group-hover:text-brand-teal'}`}>{amenity}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {activeTab === 'Property Details' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            {(propertyType === 'PG' ? [
              { icon: 'lucide:users', label: 'Category', value: property.category },
              { icon: 'lucide:building-2', label: 'Present In', value: property.pgPresentIn },
              { icon: 'lucide:clock', label: 'Operational Since', value: property.operationalSince },
              { icon: 'lucide:parking-circle', label: 'Parking Available', value: (property.parking && property.parking.length > 0) ? property.parking.join(', ') : null }
            ].filter(detail => detail.value) : [
              { icon: 'lucide:home', label: 'Type', value: property.category },
              { icon: 'lucide:bed-double', label: 'Bedrooms', value: property.bhkType },
              { icon: 'lucide:bath', label: 'Bathrooms', value: property.bathrooms },
              { icon: 'lucide:layout-template', label: 'Balcony', value: property.balconies },
              { icon: 'lucide:sofa', label: 'Furnishing', value: property.furnishingStatus },
              { icon: 'lucide:compass', label: 'Facing', value: property.facing },
              { icon: 'lucide:clock', label: 'Maintenance Charges', value: property.maintenanceCharges },
              { icon: 'lucide:scaling', label: 'Built Up Area', value: property.builtUpArea ? `${property.builtUpArea} sq.ft.` : null },
              { icon: 'lucide:scaling', label: 'Carpet Area', value: property.carpetArea ? `${property.carpetArea} sq.ft.` : null },
              { icon: 'lucide:layers', label: 'Total Floors', value: property.totalFloors },
              { icon: 'lucide:arrow-up-to-line', label: 'Property on Floor', value: property.propertyOnFloor },
              { icon: 'lucide:calendar-clock', label: 'Age of Property', value: property.ageOfProperty },
              { icon: 'lucide:building-2', label: 'Society', value: property.societyName },
              { icon: 'lucide:shield', label: 'Security Deposit', value: property.securityAmount ? `₹${property.securityAmount}` : null },
              { icon: 'lucide:plus-square', label: 'Additional Rooms', value: (property.additionalRooms && property.additionalRooms.length > 0) ? property.additionalRooms.join(', ') : null },
              { icon: 'lucide:eye', label: 'Overlooking', value: (property.overlooking && property.overlooking.length > 0) ? property.overlooking.join(', ') : null }
            ].filter(detail => detail.value)).map((detail, idx) => (
              <div key={idx} className="group flex items-start gap-3 p-2 -ml-2 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300"><Icon icon={detail.icon} className="w-[18px] h-[18px] text-brand-teal stroke-[2]" /></div>
                <div className="flex-1 grid grid-cols-[140px_1fr] items-start">
                  <p className="text-sm font-medium text-slate-500">{detail.label}</p>
                  <p className="text-sm font-bold text-[#062F26] leading-snug">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Amenities & Services' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Amenities & Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4">
            {property.amenities.map((amenityName, idx) => (
              <div key={idx} className="group flex items-center gap-3 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <span className="w-2 h-2 rounded-full bg-brand-teal/40 group-hover:bg-brand-teal transition-colors"></span>
                <span className="text-sm font-bold text-[#062F26]">{amenityName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Food Details' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Food Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Icon icon="lucide:utensils-crossed" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Food Provided</p>
                <p className="text-sm font-bold text-[#062F26]">{property.foodProvided ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Icon icon="lucide:coffee" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Meals</p>
                <p className="text-sm font-bold text-[#062F26] leading-snug">{(property.meals && property.meals.length > 0) ? property.meals.join(', ') : 'Not Specified'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Icon icon="lucide:salad" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Veg / Non-Veg</p>
                <p className="text-sm font-bold text-[#062F26]">{property.vegNonVeg || 'Both'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Icon icon="lucide:receipt" className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Food Charges</p>
                <p className="text-sm font-bold text-[#062F26]">{property.foodCharges || 'Included in Rent'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Rules & Policies' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Rules & Policies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {propertyType === 'PG' && (
              <>
                <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <Icon icon="lucide:clock" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Gate Closing Time</p>
                    <p className="text-sm font-bold text-[#062F26]">{property.gateClosingTime || '10:30 PM'}</p>
                  </div>
                </div>
                <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <Icon icon="lucide:users" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Visitors Allowed</p>
                    <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Visitors') ? 'No' : 'Yes'}</p>
                  </div>
                </div>
              </>
            )}
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:calendar-x" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Notice Period</p>
                <p className="text-sm font-bold text-[#062F26]">{property.noticePeriod || (propertyType === 'PG' ? '30 Days' : '2 Months')}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:cigarette-off" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Smoking</p>
                <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Smoking') ? 'Not Allowed' : 'Allowed'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:wine-off" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Drinking</p>
                <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Drinking') ? 'Not Allowed' : 'Allowed'}</p>
              </div>
            </div>
            <div className="group flex gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <Icon icon="lucide:dog" className="w-5 h-5 text-brand-teal mt-0.5 stroke-[2.5] group-hover:scale-110 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Pets</p>
                <p className="text-sm font-bold text-[#062F26]">{property.pgRules?.includes('No Pets') ? 'Not Allowed' : (propertyType === 'PG' ? 'Not Allowed' : 'Allowed')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Nearby Places' && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[#062F26] mb-8">Nearby Places</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(property.nearbyPlaces && property.nearbyPlaces.length > 0 ? property.nearbyPlaces.map(p => ({ icon: 'lucide:map-pin', name: p.place, dist: p.distance })) : [
              { icon: 'lucide:map-pin', name: 'Koramangala Police Station', dist: '1.2 km' },
              { icon: 'lucide:map-pin', name: 'Forum Mall Koramangala', dist: '1.8 km' },
              { icon: 'lucide:map-pin', name: 'St. John\'s Hospital', dist: '2.3 km' },
              { icon: 'lucide:map-pin', name: 'Ejipura Metro Station', dist: '3.1 km' },
              { icon: 'lucide:map-pin', name: 'HSR Layout', dist: '3.5 km' },
            ]).map((place, idx) => (
              <div key={idx} className="group flex items-start gap-4 p-3 -ml-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#EAF5F2] group-hover:bg-brand-teal flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Icon icon={place.icon} className="w-5 h-5 text-brand-teal group-hover:text-white stroke-[2.5] group-hover:scale-110 transition-all duration-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#062F26] leading-snug mb-1">{place.name}</p>
                  <p className="text-xs font-bold text-slate-500">{place.dist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyTabContent;
