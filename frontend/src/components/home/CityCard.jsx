import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const CityCard = ({ name, properties, image }) => {
  const isComingSoon = parseInt(properties, 10) === 0;

  const CardContent = (
    <>
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-linear-to-t from-[#062F26] via-[#062F26]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

      {isComingSoon && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#04473a]/20">
          <div className="bg-[#04473a] text-brand-yellow border border-brand-yellow/30 px-5 py-2 md:px-6 md:py-2.5 rounded-full shadow-xl flex items-center gap-2 transform -translate-y-4">
            <Icon icon="lucide:clock" width="16" className="text-brand-yellow" />
            <span className="font-bold text-xs md:text-sm tracking-widest uppercase">
              Coming Soon
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-md">{name}</h3>
          <p className="text-[#a1b8b2] text-xs md:text-xs font-semibold">{properties} Properties</p>
        </div>
        {!isComingSoon && (
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-slate-900 transition-colors shadow-lg">
            <Icon icon="lucide:arrow-right" width="16" className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>
    </>
  );

  const cardClasses = `group relative rounded-xl overflow-hidden h-[300px] md:h-[340px] w-full flex-shrink-0 shadow-sm block ${isComingSoon
    ? 'cursor-not-allowed border border-transparent'
    : 'cursor-pointer hover:shadow-[0_10px_30px_rgba(4,71,58,0.2)] transition-all duration-300 transform hover:-translate-y-1.5 border border-transparent hover:border-brand-yellow/30'
    }`;

  if (isComingSoon) {
    return (
      <div className={cardClasses}>
        {CardContent}
      </div>
    );
  }

  return (
    <Link to={`/properties?location=${encodeURIComponent(name)}`} className={cardClasses}>
      {CardContent}
    </Link>
  );
};

export default CityCard;
