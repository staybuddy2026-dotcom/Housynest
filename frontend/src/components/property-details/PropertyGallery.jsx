import { Icon } from '@iconify/react';

const PropertyGallery = ({ property, galleryImages, currentImageIndex, setCurrentImageIndex }) => {
  return (
    <div id="gallery" className="w-full lg:w-[68%] scroll-mt-24">
      <div className="relative w-full h-[400px] lg:h-[480px] rounded-[24px] overflow-hidden mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div
          className="flex w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {galleryImages.map((image, idx) => (
            <img
              key={idx}
              src={image.img}
              alt={`${property.title} - ${image.name}`}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>

        {property.isVerified ? (
          <div className="absolute top-4 left-4 bg-[#062F26]/70 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10">
            <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-brand-yellow" />
            Verified Property
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10">
            <Icon icon="lucide:shield-alert" className="w-3.5 h-3.5 text-amber-500" />
            Not Verified
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-slate-900/60 backdrop-blur-md text-white text-xs font-bold tracking-widest px-3 py-1.5 rounded-full shadow-sm z-10">
          {currentImageIndex + 1} / {galleryImages.length}
        </div>

        {/* 360 View Button overlay */}
        <button className="absolute bottom-4 left-4 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 transition-colors z-10 border border-white/10">
          <Icon icon="mdi:rotate-360" className="w-4 h-4 text-brand-yellow" />
          360° View
        </button>

        <button
          onClick={() => setCurrentImageIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-800 hover:bg-white shadow-md transition-all hover:scale-105 z-10"
        >
          <Icon icon="lucide:chevron-left" className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentImageIndex(prev => prev === galleryImages.length - 1 ? 0 : prev + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-800 hover:bg-white shadow-md transition-all hover:scale-105 z-10"
        >
          <Icon icon="lucide:chevron-right" className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnails (Max 5 items) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {galleryImages.slice(0, 5).map((thumb, idx) => {
          const isLastVisible = idx === 4;
          const remainingCount = galleryImages.length - 5;
          const hasMore = isLastVisible && remainingCount > 0;

          return (
            <div
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`cursor-pointer group relative aspect-[4/3] sm:aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300 ${currentImageIndex === idx && !hasMore
                  ? 'ring-2 ring-[#04473a] ring-offset-2 ring-offset-[#FAF6F0]'
                  : 'hover:opacity-90'
                }`}
            >
              <img
                src={thumb.img}
                alt={thumb.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${hasMore ? '' : 'group-hover:scale-110'}`}
              />

              {hasMore ? (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white text-lg sm:text-2xl font-bold tracking-wider">
                    +{remainingCount}
                  </span>
                </div>
              ) : (
                <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${currentImageIndex === idx ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyGallery;
