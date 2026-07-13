import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { toast } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import heroImg from '../assets/hero_img.jpg';
import home1 from '../assets/home1.png';
import home2 from '../assets/home2.png';
import hero1 from '../assets/hero1.png';
import PropertyListingCard from '../components/properties/PropertyListingCard';
import ScheduleVisitModal from '../components/properties/ScheduleVisitModal';
import ShareModal from '../components/properties/ShareModal';
import ReportListingModal from '../components/properties/ReportListingModal';
import InquiryModal from '../components/properties/InquiryModal';
import { MOCK_PROPERTIES } from '../data/mockProperties';

// Refactored Modular Components
import PropertyGallery from '../components/property-details/PropertyGallery';
import PropertySidebarCard from '../components/property-details/PropertySidebarCard';
import PropertyQuickStats from '../components/property-details/PropertyQuickStats';
import PropertyTabsSidebar from '../components/property-details/PropertyTabsSidebar';
import PropertyTabContent from '../components/property-details/PropertyTabContent';
import PropertyReviews from '../components/property-details/PropertyReviews';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lenis = useLenis();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (id && id.length === 24) { // Check if valid MongoDB ID
          const res = await fetch(`/api/properties/${id}`);
          if (res.ok) {
            const data = await res.json();
            const mappedProperty = {
              ...data,
              id: data._id,
              title: data.pgName || (data.bhkType ? `${data.bhkType} ${data.propertyCategory}` : data.propertyCategory) || 'Property',
              type: data.propertyType,
              category: data.propertyCategory,
              societyName: data.societyName,
              location: `${data.locality || ''}, ${data.city || ''}`.replace(/^, | , $/g, ''),
              price: (data.monthlyRent || '0').toString(),
              gender: data.preferredGender || 'Anyone',
              roomType: data.rooms && data.rooms.length > 0 ? data.rooms[0].sharingType : '',
              rating: data.rating || '4.5',
              reviews: data.views || 0,
              image: data.images && data.images.length > 0 ? data.images[0].url : home1,
              images: data.images && data.images.length > 0 ? data.images.map(img => img.url) : [home1, home2, hero1, heroImg],
              amenities: [
                ...(data.societyAmenities || []),
                ...(data.commonAmenities || []),
                ...(data.services || [])
              ],
              isVerified: data.isVerified || false,
              description: data.description,
              uspText: data.uspText,
              tenantPreference: data.tenantPreference || (data.preferredTenants ? data.preferredTenants.join(', ') : null),
              localityDescription: data.localityDescription,

              // PG Details
              pgPresentIn: data.pgPresentIn,
              operationalSince: data.operationalSince,
              foodProvided: data.foodProvided,
              vegNonVeg: data.vegNonVeg,
              meals: data.meals,
              foodCharges: data.foodCharges,
              parking: data.parking,
              gateClosingTime: data.gateClosingTime,
              noticePeriod: data.noticePeriod,
              pgRules: data.pgRules || [],

              // Tenant Details
              bhkType: data.bhkType,
              bathrooms: data.bathrooms,
              balconies: data.balconies,
              furnishingStatus: data.furnishingStatus,
              facing: data.facing,
              maintenanceCharges: data.maintenanceCharges,
              builtUpArea: data.builtUpArea,
              carpetArea: data.carpetArea,
              totalFloors: data.totalFloors,
              propertyOnFloor: data.propertyOnFloor,
              ageOfProperty: data.ageOfProperty,
              securityAmount: data.securityAmount,
              maxPeople: data.maxPeople,
              additionalRooms: data.additionalRooms,
              overlooking: data.overlooking,

              // Nearby
              nearbyPlaces: data.nearbyPlaces || [],

              // Owner
              owner: data.owner ? {
                _id: data.owner._id,
                fullName: data.owner.fullName || 'Owner',
                email: data.owner.email || '',
                phone: data.owner.phone || '+91 00000 00000',
                profilePic: data.owner.profilePic,
                avatar: data.owner.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.owner.fullName || 'Owner'}`
              } : null,
            };
            setProperty(mappedProperty);
          } else {
            setProperty(MOCK_PROPERTIES.find(p => p.id === parseInt(id)) || MOCK_PROPERTIES[0]);
          }
        } else {
          setProperty(MOCK_PROPERTIES.find(p => p.id === parseInt(id)) || MOCK_PROPERTIES[0]);
        }
      } catch (err) {
        setProperty(MOCK_PROPERTIES.find(p => p.id === parseInt(id)) || MOCK_PROPERTIES[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();

    const fetchSimilarProperties = async () => {
      try {
        if (id && id.length === 24) {
          const res = await fetch(`/api/properties/${id}/similar`);
          if (res.ok) {
            const data = await res.json();
            const mappedSimilar = data.map(p => ({
              ...p,
              id: p._id,
              title: p.pgName || (p.bhkType ? `${p.bhkType} ${p.propertyCategory}` : p.propertyCategory) || 'Property',
              type: p.propertyType,
              category: p.propertyCategory,
              bhkType: p.bhkType,
              societyName: p.societyName,
              location: `${p.locality || ''}, ${p.city || ''}`.replace(/^, | , $/g, ''),
              price: (p.monthlyRent || '0').toString(),
              rating: p.rating || '4.5',
              reviews: p.views || 0,
              image: p.images && p.images.length > 0 ? p.images[0].url : home1,
              images: p.images && p.images.length > 0 ? p.images.map(img => img.url) : [home1, home2, hero1, heroImg],
              amenities: [
                ...(p.societyAmenities || []),
                ...(p.commonAmenities || []),
                ...(p.services || [])
              ],
              rooms: p.rooms || [],
              isVerified: p.isVerified || false
            }));
            setSimilarProperties(mappedSimilar);
          }
        }
      } catch (err) {
        console.error('Failed to fetch similar properties', err);
      }
    };
    fetchSimilarProperties();

    const fetchReviews = async () => {
      try {
        if (id && id.length === 24) {
          const res = await fetch(`/api/properties/${id}/reviews`);
          if (res.ok) {
            const data = await res.json();
            setReviews(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [id, lenis]);

  const [activeTab, setActiveTab] = useState('Overview');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });

  const [isFavorite, setIsFavorite] = useState(() => {
    return currentUser ? (currentUser.savedProperties || []).includes(String(id)) : false;
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsFavorite((user.savedProperties || []).includes(String(id)));
        } else {
          setCurrentUser(null);
          setIsFavorite(false);
        }
      } catch (e) { }
    };

    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, [id]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!property) return <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">Property not found</div>;

  const propertyType = property.type;

  const basePrice = property.price ? parseInt(property.price.replace(/,/g, ''), 10) || 12000 : 12000;

  const pgRooms = property.rooms && property.rooms.length > 0
    ? property.rooms.map((r, idx) => ({
      title: r.sharingType || `Room ${idx + 1}`,
      available: r.availableBeds || 0,
      totalBeds: r.totalBeds || 1,
      maxPeople: parseInt(r.totalBeds, 10) || 1,
      rent: Number(r.rentPerBed || basePrice).toLocaleString('en-IN'),
      deposit: Number(r.depositPerBed || basePrice * 2).toLocaleString('en-IN'),
      amenities: r.facilities || []
    }))
    : [
      {
        title: 'Double Sharing',
        available: 10,
        totalBeds: 20,
        maxPeople: 2,
        rent: Math.floor(basePrice * 0.8).toLocaleString('en-IN'),
        deposit: Math.floor(basePrice * 1.6).toLocaleString('en-IN'),
        amenities: ['Bed', 'Mattress', 'Table', 'Wifi', 'Cupboard', 'Washroom', 'Aircooler']
      },
      {
        title: 'Single Sharing',
        available: 11,
        totalBeds: 15,
        maxPeople: 1,
        rent: basePrice.toLocaleString('en-IN'),
        deposit: Math.floor(basePrice * 2).toLocaleString('en-IN'),
        amenities: ['Bed', 'Washroom', 'Aircooler', 'Table', 'Cupboard', 'Mattress', 'Wifi']
      }
    ];

  const galleryImages = property.images && property.images.length > 0
    ? property.images.map((img, i) => ({ name: `Image ${i + 1}`, img: img }))
    : [
      { name: 'Front View', img: property.image || home1 },
      { name: 'Rooms (8)', img: home1 },
      { name: 'Kitchen (3)', img: home2 },
      { name: 'Washroom (4)', img: hero1 },
      { name: 'Common Area (6)', img: heroImg },
    ];

  const relatedProperties = similarProperties.length > 0 ? similarProperties : [
    {
      id: 1,
      image: home1,
      images: [home1, home2, hero1, heroImg],
      title: 'Modern Single Room PG',
      type: 'PG',
      amenities: ['Wi-Fi', 'AC', 'Food Included'],
      isVerified: true,
      location: 'Koramangala 4th Block, Bengaluru',
      price: '12,500',
      rating: '4.8',
      reviews: '124'
    },
    {
      id: 2,
      image: home2,
      images: [home2, heroImg, home1, hero1],
      title: 'Cozy Co-Living Space',
      type: 'Co-Living',
      amenities: ['Gym', 'Laundry', 'Cleaning'],
      isVerified: true,
      location: 'HSR Layout Sector 2, Bengaluru',
      price: '14,000',
      rating: '4.9',
      reviews: '89'
    },
    {
      id: 3,
      image: hero1,
      images: [hero1, home1, heroImg, home2],
      title: 'Premium Studio Apartment',
      type: 'Apartment',
      amenities: ['Pool', 'Parking', 'Security'],
      isVerified: false,
      location: 'Indiranagar 100ft Road, Bengaluru',
      price: '22,000',
      rating: '4.6',
      reviews: '45'
    },
    {
      id: 4,
      image: heroImg,
      images: [heroImg, hero1, home2, home1],
      title: 'Luxury Boys PG',
      type: 'PG',
      amenities: ['Meals', 'Housekeeping', 'Lounge'],
      isVerified: true,
      location: 'BTM Layout 2nd Stage, Bengaluru',
      price: '11,000',
      rating: '4.7',
      reviews: '156'
    }
  ];

  const tabs = propertyType === 'PG'
    ? ['Overview', 'Property Details', 'Room Details', 'Amenities & Services', 'Food Details', 'Rules & Policies', 'Nearby Places']
    : ['Overview', 'Property Details', 'Amenities & Services', 'Nearby Places'];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveTab(sectionId);
    }
  };


  return (
    <div className="bg-[#FAF6F0] min-h-screen font-sans text-slate-800 relative">
      <div className="max-w-[1360px] mx-auto pt-6 px-4 sm:px-6 xl:px-0">

        {/* Breadcrumb */}
        <div className="flex items-center text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-brand-teal transition-colors">Home</Link>
          <Icon icon="lucide:chevron-right" className="mx-2 w-3 h-3" />
          <Link to="/properties" className="hover:text-brand-teal transition-colors">Properties</Link>
          <Icon icon="lucide:chevron-right" className="mx-2 w-3 h-3" />
          <span className="text-[#062F26]">Property Details</span>
        </div>

        {/* Top Grid: Gallery & Right Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
          <PropertyGallery
            property={property}
            galleryImages={galleryImages}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
          />
          <PropertySidebarCard
            property={property}
            propertyType={propertyType}
            pgRooms={pgRooms}
            selectedRoomIndex={selectedRoomIndex}
            setSelectedRoomIndex={setSelectedRoomIndex}
            basePrice={basePrice}
            isFavorite={isFavorite}
            setIsFavorite={setIsFavorite}
            setIsShareModalOpen={setIsShareModalOpen}
            setIsScheduleModalOpen={setIsScheduleModalOpen}
            setIsReportModalOpen={setIsReportModalOpen}
            setIsInquiryModalOpen={setIsInquiryModalOpen}
            toast={toast}
          />
        </div>

        {/* Full-Width Quick Stats Bar */}
        <PropertyQuickStats property={property} propertyType={propertyType} />

        {/* Lower Main Grid: Tabs Sidebar & Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
          <PropertyTabsSidebar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <PropertyTabContent
            activeTab={activeTab}
            property={property}
            propertyType={propertyType}
            pgRooms={pgRooms}
            selectedRoomIndex={selectedRoomIndex}
            setSelectedRoomIndex={setSelectedRoomIndex}
          />
        </div>

        {/* Reviews & Owner Profile */}
        <PropertyReviews
          property={property}
          reviews={reviews}
          setIsReviewModalOpen={setIsReviewModalOpen}
          setIsScheduleModalOpen={setIsScheduleModalOpen}
        />

      </div>

      {/* Related Properties */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 xl:px-0 mt-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#062F26] mb-1">Similar Properties</h3>
            <p className="text-sm font-medium text-slate-500">Properties you might also like in this area</p>
          </div>
          <Link to="/properties" className="text-brand-teal text-sm font-bold hover:underline hidden sm:block">View All</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProperties.map((property) => (
            <PropertyListingCard key={property.id} property={property} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/properties" className="text-brand-teal text-sm font-bold hover:underline inline-block">View All Properties</Link>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl p-6 lg:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#062F26]">Write a Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm font-bold text-[#062F26] mb-3">Rate your experience</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className={`transition-all hover:scale-110 cursor-pointer ${star <= (hoverRating || rating) ? 'text-brand-yellow' : 'text-slate-200'}`}
                  >
                    <Icon icon="mdi:star" className="w-8 h-8" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-[#062F26] mb-2">Your Review</label>
              <textarea
                rows="4"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us what you loved about this property..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 outline-none transition-all text-sm font-medium text-slate-700 resize-none placeholder:text-slate-400 bg-slate-50 focus:bg-white"
              ></textarea>
            </div>

            <button
              disabled={isSubmittingReview}
              onClick={async () => {
                if (rating === 0) {
                  toast.error("Please select a rating");
                  return;
                }
                if (!reviewComment.trim()) {
                  toast.error("Please enter a review comment");
                  return;
                }
                setIsSubmittingReview(true);
                try {
                  const token = localStorage.getItem('accessToken');
                  const res = await fetch(`/api/properties/${id}/reviews`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ rating, comment: reviewComment })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success("Review submitted successfully!");
                    setIsReviewModalOpen(false);
                    setRating(0);
                    setReviewComment('');
                    // Refresh reviews list locally
                    setReviews(prev => [data.review, ...prev]);
                  } else {
                    toast.error(data.message || "Failed to submit review");
                  }
                } catch (err) {
                  toast.error("Something went wrong");
                } finally {
                  setIsSubmittingReview(false);
                }
              }}
              className="w-full bg-brand-teal cursor-pointer hover:bg-[#0aa87d] text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-[0_4px_15px_rgba(10,168,125,0.2)] active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      <ScheduleVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        property={property}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        property={property}
      />

      {/* Report Modal */}
      <ReportListingModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        propertyId={property?.id}
      />

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        property={property}
      />

      {/* WhatsApp Sticky Button */}
      {currentUser?.role !== 'owner' && (
        <div className="absolute inset-0 pointer-events-none z-40">
          <div className="sticky top-[calc(100vh-145px)] w-full max-w-[1500px] mx-auto px-4 sm:px-6 xl:px-0 flex justify-end pb-6 pointer-events-none">
            <div className="animate-slow-bounce pointer-events-auto">
              <a
                href={currentUser ? `https://wa.me/${property.owner?.phone?.replace(/\D/g, '') || ''}` : '#'}
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    toast.error('You are required to login to contact the owner');
                    navigate('/login');
                  }
                }}
                target={currentUser ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="relative group flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.35)] hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 cursor-pointer"
              >
                <Icon icon="mdi:whatsapp" className="w-8 h-8" />

                {/* Tooltip */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 invisible translate-x-2 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-500 ease-out pointer-events-none z-[100]">
                  <div className="bg-[#062F26] border border-[#13463a] text-brand-yellow text-sm font-bold px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(6,47,38,0.25)] whitespace-nowrap flex items-center">
                    Chat on WhatsApp with owner
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-0 h-0 border-y-[5px] border-y-transparent border-l-[5px] border-l-[#13463a]"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[4px] w-0 h-0 border-y-[4px] border-y-transparent border-l-[4px] border-l-[#062F26]"></div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fade Transition to Newsletter */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-b from-transparent to-[#F9FAFB] pointer-events-none z-0"></div>
    </div>
  );
};

export default PropertyDetails;
