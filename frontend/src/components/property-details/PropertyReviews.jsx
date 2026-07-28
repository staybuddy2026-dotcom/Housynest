import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const PropertyReviews = ({ property, reviews = [], setIsReviewModalOpen, setIsScheduleModalOpen }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isTenantOrGuest = !user || user.role === 'tenant';
  const userReviewCount = user ? reviews.filter(r => r.tenant?._id === user._id || r.tenant?.id === user._id || r.tenant === user._id).length : 0;
  const canWriteReview = isTenantOrGuest && userReviewCount < 3;

  const owner = property?.owner || {
    fullName: 'Rakesh Kumar',
    email: 'rakesh@greennestpg.com',
    phone: '+91 98765 43210',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rakesh'
  };

  const ownerAvatar = property?.owner?.profilePic || owner.profilePic;

  return (
    <div className="flex flex-col xl:flex-row gap-8 mb-8">
      {/* Reviews & Ratings (75%) */}
      <div className="w-full xl:w-[75%] bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 p-6 lg:p-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-[#062F26] mb-1">Guest Reviews</h3>
            <p className="text-sm font-medium text-slate-500">Real feedback from verified residents</p>
          </div>
          {canWriteReview && (
            <button onClick={() => setIsReviewModalOpen(true)} className="w-full sm:w-auto bg-[#062F26] cursor-pointer hover:bg-brand-teal text-white text-sm font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md group shrink-0">
              <Icon icon="lucide:pen-line" className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Write a Review
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Rating Summary */}
          <div className="w-full lg:w-[40%] shrink-0">
            <div className="bg-white rounded-xl p-7 lg:p-8 shadow-sm border border-slate-100 relative overflow-hidden h-full hover:shadow-md transition-shadow">
              {/* Decorative background element */}
              <Icon icon="mdi:star-circle" className="absolute -right-12 -bottom-12 w-64 h-64 text-brand-teal opacity-[0.03] pointer-events-none" />

              <div className="flex items-end gap-5 mb-10 relative z-10">
                <h4 className="text-[64px] font-extrabold text-[#062F26] leading-none tracking-tighter">
                  {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                </h4>
                <div className="mb-2.5">
                  <div className="flex items-center gap-1 text-brand-yellow mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        icon={star <= (reviews.length > 0 ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0) ? "mdi:star" : "mdi:star-outline"}
                        className="w-5 h-5 drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]"
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Based on {reviews.length} reviews</p>
                </div>
              </div>

              {/* Rating Bars */}
              <div className="flex flex-col gap-4 relative z-10">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.length > 0 ? reviews.filter(r => Math.round(r.rating) === stars).length : 0;
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-4 group/bar cursor-pointer">
                      <div className="flex items-center gap-1.5 w-10 shrink-0">
                        <span className="text-[12px] font-bold text-slate-600 group-hover/bar:text-[#062F26] transition-colors">{stars}</span>
                        <Icon icon="mdi:star" className="w-4 h-4 text-slate-300 group-hover/bar:text-brand-yellow transition-colors" />
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-yellow rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="text-[12px] font-bold text-slate-400 w-8 text-right group-hover/bar:text-slate-600 transition-colors">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Review List */}
          <div className="flex-1 flex flex-col gap-6">
            {reviews.length === 0 ? (
              <div className="bg-[#F4F9F8] border border-brand-teal/10 rounded-3xl h-full flex flex-col items-center justify-center min-h-[350px] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(10,168,125,0.05)_0%,transparent_70%)] pointer-events-none"></div>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(10,168,125,0.12)] mb-6 relative z-10">
                  <Icon icon="lucide:message-square-dashed" className="w-10 h-10 text-brand-teal" />
                </div>
                <h4 className="text-[20px] font-extrabold text-[#062F26] mb-2 relative z-10">No reviews yet</h4>
                <p className="text-slate-500 font-bold text-[13.5px] mb-8 max-w-[280px] text-center relative z-10">Be the first to share your experience living in this property!</p>
                {canWriteReview && (
                  <button onClick={() => setIsReviewModalOpen(true)} className="bg-[#062F26] text-white hover:bg-[#0a473a] transition-colors font-bold text-sm px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(6,47,38,0.15)] flex items-center gap-2 relative z-10 hover:-translate-y-0.5">
                    <Icon icon="lucide:pen-line" className="w-4 h-4" />
                    Write a Review
                  </button>
                )}
              </div>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className="group p-6 rounded-xl bg-white border border-slate-100 hover:border-brand-teal/30 hover:shadow-[0_8px_30px_rgba(10,168,125,0.06)] transition-all duration-300">
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

      {/* Owner Profile & CTA (25%) */}
      <div id="contact" className="w-full xl:w-[25%] bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col scroll-mt-24 overflow-hidden relative">

        {/* Top Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-[#062F26] z-0"></div>

        {/* Avatar & Details */}
        <div className="flex flex-col items-center text-center w-full z-10 pt-16 px-5 sm:px-6">
          {ownerAvatar ? (
            <img src={ownerAvatar} alt="Owner Avatar" className="w-24 h-24 rounded-full bg-[#EAF5F2] object-cover border-[4px] border-white shadow-xl mb-3 relative z-10" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-tr from-[#0AA87D] to-teal-400 text-white flex items-center justify-center font-bold text-4xl border-[4px] border-white shadow-xl mb-3 relative z-10">
              {owner.fullName ? owner.fullName.charAt(0).toUpperCase() : 'O'}
            </div>
          )}
          <h4 className="text-[24px] font-extrabold text-[#062F26] mb-0.5">{owner.fullName}</h4>
          <p className="text-[12px] font-extrabold text-brand-teal mb-5 tracking-widest uppercase">Property Owner</p>

          <div className="flex flex-col gap-0 w-full mb-6">
            <div className="flex items-center gap-3 border-b border-slate-100 py-3 group">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-[#EAF5F2] group-hover:text-brand-teal transition-colors">
                <Icon icon="lucide:phone" className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone Number</span>
                <span className="text-[15px] font-extrabold text-[#062F26] group-hover:text-brand-teal transition-colors">{owner.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-slate-100 py-3 group w-full overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-[#EAF5F2] group-hover:text-brand-teal transition-colors">
                <Icon icon="lucide:mail" className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</span>
                <span className="text-[15px] font-extrabold text-[#062F26] truncate w-full group-hover:text-brand-teal transition-colors">{owner.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-full bg-[#EAF5F2] flex items-center justify-center text-brand-teal shrink-0">
                <Icon icon="lucide:shield-check" className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</span>
                <span className="text-[15px] font-extrabold text-brand-teal">Verified Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Box */}
        {isTenantOrGuest && (
          <div className="p-6 sm:p-8 pt-0 w-full flex flex-col gap-3 mt-auto relative z-10">
            <a
              href={property?.owner?.phone ? `tel:${property.owner.phone}` : '#'}
              onClick={(e) => {
                if (!property?.owner?.phone) {
                  e.preventDefault();
                  toast.error('Owner phone number not available');
                }
              }}
              className="w-full cursor-pointer bg-[#062F26] hover:bg-[#0a473a] text-white py-3.5 rounded-xl font-bold text-[13.5px] transition-all flex justify-center items-center gap-2 shadow-[0_4px_15px_rgba(6,47,38,0.15)] hover:shadow-[0_6px_20px_rgba(6,47,38,0.2)] hover:-translate-y-0.5"
            >
              <Icon icon="lucide:phone" className="w-4 h-4" />
              Contact Owner
            </a>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="w-full bg-white hover:bg-slate-50 text-[#062F26] border border-slate-200 py-3.5 rounded-xl font-bold text-[13.5px] transition-all flex justify-center items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Icon icon="lucide:calendar-check" className="w-4 h-4" />
              Schedule Visit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyReviews;
