import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const PropertyReviews = ({ property, reviews = [], setIsReviewModalOpen, setIsScheduleModalOpen }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isTenantOrGuest = !user || user.role === 'tenant';
  const owner = property?.owner || {
    fullName: 'Rakesh Kumar',
    email: 'rakesh@greennestpg.com',
    phone: '+91 98765 43210',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rakesh'
  };

  const ownerAvatar = property?.owner?.profilePic || owner.profilePic;

  return (
    <>
      {/* Reviews & Ratings */}
      <div className="w-full bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 p-6 lg:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-[#062F26] mb-1">Guest Reviews</h3>
            <p className="text-sm font-medium text-slate-500">Real feedback from verified residents</p>
          </div>
          {isTenantOrGuest && (
            <button onClick={() => setIsReviewModalOpen(true)} className="w-full sm:w-auto bg-[#062F26] cursor-pointer hover:bg-brand-teal text-white text-sm font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md group">
              <Icon icon="lucide:pen-line" className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Write a Review
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Rating Summary */}
          <div className="w-full lg:w-[35%] shrink-0">
            <div className="bg-[#FAF6F0] rounded-2xl p-6 border border-slate-100/50">
              <div className="flex items-end gap-4 mb-6">
                <h4 className="text-[48px] font-bold text-[#062F26] leading-none tracking-tight">
                  {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                </h4>
                <div className="mb-1.5">
                  <div className="flex items-center gap-1 text-brand-yellow mb-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        icon={star <= (reviews.length > 0 ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0) ? "mdi:star" : "mdi:star-outline"}
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-500">Based on {reviews.length} reviews</p>
                </div>
              </div>

              {/* Rating Bars */}
              <div className="flex flex-col gap-3">
                {[
                  { stars: 5, percent: 80, count: 98 },
                  { stars: 4, percent: 15, count: 18 },
                  { stars: 3, percent: 3, count: 4 },
                  { stars: 2, percent: 1, count: 2 },
                  { stars: 1, percent: 1, count: 2 }
                ].map((row) => (
                  <div key={row.stars} className="flex items-center gap-3 group/bar cursor-pointer">
                    <div className="flex items-center gap-1 w-10 shrink-0">
                      <span className="text-xs font-bold text-slate-600 group-hover/bar:text-[#062F26] transition-colors">{row.stars}</span>
                      <Icon icon="mdi:star" className="w-3 h-3 text-slate-300 group-hover/bar:text-brand-yellow transition-colors" />
                    </div>
                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-yellow rounded-full transition-all duration-1000 ease-out" style={{ width: `${row.percent}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-6 text-right">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Review List */}
          <div className="flex-1 flex flex-col gap-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl">
                <p className="text-slate-500 font-medium text-sm">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className="group p-6 rounded-2xl bg-white border border-slate-100 hover:border-brand-teal/30 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <img src={review.tenant?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.tenant?.fullName || 'User'}`} alt="Reviewer" className="w-11 h-11 rounded-full bg-[#EAF5F2] border border-brand-teal/20 object-cover" />
                      <div>
                        <h5 className="text-sm font-bold text-[#062F26] mb-0.5">{review.tenant?.fullName || 'Guest User'}</h5>
                        <p className="text-xs font-bold text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-brand-yellow bg-[#FFF8E7] px-2.5 py-1.5 rounded-lg border border-[#FFE8A1]/50">
                      <Icon icon="mdi:star" className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold text-[#A67C00] leading-none">{review.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-[13.5px] text-slate-600 leading-[1.6] font-medium group-hover:text-slate-800 transition-colors">
                    "{review.comment}"
                  </p>
                </div>
              ))
            )}

            {reviews.length > 3 && (
              <button className="mt-2 w-full cursor-pointer py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#062F26] hover:border-slate-300 transition-all flex items-center justify-center gap-2 group/btn">
                Load More Reviews
                <Icon icon="lucide:chevron-down" className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owner Profile & CTA */}
      <div id="contact" className="w-full bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between mb-8 scroll-mt-24">

        {/* Avatar & Details */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center w-full lg:w-auto flex-1 justify-between pr-0 lg:pr-8">

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {ownerAvatar ? (
              <img src={ownerAvatar} alt="Owner Avatar" className="w-21 h-21 rounded-full bg-[#EAF5F2] object-cover border border-brand-teal/20" />
            ) : (
              <div className="w-21 h-21 rounded-full bg-linear-to-tr from-[#062F26] to-brand-teal text-white flex items-center justify-center font-bold text-3xl border border-brand-teal/20">
                {owner.fullName ? owner.fullName.charAt(0).toUpperCase() : 'O'}
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-xs font-bold text-brand-teal mb-0.5">Owner / Manager</p>
              <h4 className="text-lg font-bold text-[#062F26] mb-2.5">{owner.fullName}</h4>

              <div className="flex flex-col gap-1.5 text-sm font-semibold text-slate-600 mb-3">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:phone" className="w-4 h-4 text-brand-teal stroke-[2.5]" />
                  {owner.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:mail" className="w-4 h-4 text-brand-teal stroke-[2.5]" />
                  {owner.email}
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF5F2] text-brand-teal text-xs font-bold mt-1 w-max">
                <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 stroke-[2.5]" />
                Verified Owner
              </div>
            </div>
          </div>

          {/* Vertical Divider & Stats */}
          <div className="hidden lg:flex flex-col gap-6 border-l border-slate-100 pl-12 py-4">
            <div>
              <p className="text-xs flex items-center gap-2 font-medium text-slate-600 mb-1.5">
                <Icon icon="lucide:history" className="w-4.5 h-4.5 text-brand-teal stroke-[2.5]" /> Response Time
              </p>
              <p className="text-sm font-bold text-[#062F26] pl-6 leading-relaxed">Usually replies within<br />30 minutes</p>
            </div>
            <div>
              <p className="text-xs flex items-center gap-2 font-medium text-slate-600 mb-1.5">
                <Icon icon="lucide:languages" className="w-4.5 h-4.5 text-brand-teal stroke-[2.5]" /> Languages Known
              </p>
              <p className="text-sm font-bold text-[#062F26] pl-6">English, Hindi, Kannada</p>
            </div>
          </div>

        </div>

        <div className="hidden lg:block w-px h-35 bg-slate-100 mx-8"></div>

        {/* CTA Box */}
        {isTenantOrGuest && (
          <div className="bg-[#F4F9F8] rounded-2xl p-6 lg:p-7 w-full lg:w-105 shrink-0 mt-8 lg:mt-0">
            <h4 className="font-bold text-[#062F26] text-base mb-2">Interested in this property?</h4>
            <p className="text-sm font-medium text-slate-600 mb-6">Contact the owner now or schedule a visit.</p>
            <div className="group flex flex-col sm:flex-row gap-3 sm:gap-4 p-0 sm:p-3 sm:-ml-3 rounded-xl hover:bg-slate-50 transition-colors">
              <a
                href={property?.owner?.phone ? `tel:${property.owner.phone}` : '#'}
                onClick={(e) => {
                  if (!property?.owner?.phone) {
                    e.preventDefault();
                    toast.error('Owner phone number not available');
                  }
                }}
                className="flex-1 w-full sm:w-auto cursor-pointer bg-[#062F26] hover:bg-[#0a473a] text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 shadow-[0_4px_15px_rgba(6,47,38,0.15)]"
              >
                <Icon icon="lucide:phone" className="w-4 h-4" />
                Contact Owner
              </a>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="flex-1 w-full sm:w-auto bg-transparent hover:bg-[#062F26]/5 text-[#062F26] border border-[#062F26] py-3.5 rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2"
              >
                <Icon icon="lucide:calendar-check" className="w-4 h-4" />
                Schedule Visit
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default PropertyReviews;
