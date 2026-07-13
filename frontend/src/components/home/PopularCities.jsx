import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import CityCard from './CityCard';

import ahmedabad from '../../assets/ahmedabad.png';
import gandhinagar from '../../assets/gandhinagar.png';
import rajkot from '../../assets/rajkot.png';
import surat from '../../assets/surat.jpeg';
import vadodara from '../../assets/vadodara.png';
import mumbai from '../../assets/hero1.png';

const imageMap = {
  'Ahmedabad': ahmedabad,
  'Gandhinagar': gandhinagar,
  'Rajkot': rajkot,
  'Surat': surat,
  'Vadodara': vadodara,
  'Mumbai': mumbai,
};

const PopularCities = () => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchPopularCities = async () => {
      try {
        const res = await fetch('/api/properties/popular-cities');
        if (res.ok) {
          const data = await res.json();
          let mappedCities = data.map((city, idx) => ({
            id: idx + 1,
            name: city.name,
            properties: city.properties.toLocaleString() + '+',
            image: imageMap[city.name] || mumbai // fallback image
          }));

          // Ensure exactly 5 cities are shown
          if (mappedCities.length < 5) {
            const fallbackCities = [
              { name: 'Ahmedabad', properties: '0' },
              { name: 'Mumbai', properties: '0' },
              { name: 'Surat', properties: '0' },
              { name: 'Vadodara', properties: '0' },
              { name: 'Rajkot', properties: '0' },
            ];

            const needed = 5 - mappedCities.length;
            const existingNames = new Set(mappedCities.map(c => c.name));
            const additionalCities = fallbackCities
              .filter(c => !existingNames.has(c.name))
              .slice(0, needed)
              .map((city, idx) => ({
                id: `fallback-${idx}`,
                name: city.name,
                properties: city.properties,
                image: imageMap[city.name] || mumbai
              }));

            mappedCities = [...mappedCities, ...additionalCities];
          }

          setCities(mappedCities);
        }
      } catch (err) {
        console.error('Failed to fetch popular cities', err);
      }
    };
    fetchPopularCities();
  }, []);

  return (
    <section className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 xl:px-0">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex flex-col">
          <h2 className="text-[22px] sm:text-2xl font-serif md:text-3xl font-bold text-[#04473a] flex items-center gap-2 sm:gap-3">
            Popular Cities
            <Icon icon="lucide:sparkles" className="text-brand-yellow w-6 h-6 sm:w-7 sm:h-7" />
          </h2>
          <div className="relative mt-3 w-28 flex items-center">
            <div className="w-full h-[3px] bg-[#04473a] rounded-full"></div>
            <div className="absolute left-0 w-[60%] h-[3px] bg-[#04473a] rounded-full"></div>
            <div className="absolute left-[50%] w-2.5 h-2.5 rounded-full ring-[3px] ring-[#04473a] bg-brand-yellow shadow-sm"></div>
          </div>
        </div>
        <button className="group relative overflow-hidden hidden sm:flex items-center justify-center cursor-pointer px-6 py-2.5 rounded-md border border-gray-200 text-slate-600 font-bold text-sm hover:border-[#04473a] hover:text-[#04473a] hover:bg-teal-50 transition-all shadow-sm">
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="absolute left-4 -translate-x-[150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out"
          />
          <span className="transform group-hover:translate-x-5 transition-transform duration-500 ease-out">
            View All Cities
          </span>
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="ml-2 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out"
          />
        </button>
      </div>

      {/* Card Container - Scrollable below 1024px, flex on desktop */}
      <div className="flex overflow-x-auto pt-4 pb-6 sm:pb-10 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 gap-3 sm:gap-5 hide-scrollbar snap-x snap-mandatory">
        {cities.map((city) => (
          <div key={city.id} className="snap-center sm:snap-align-none shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-auto lg:flex-1">
            <CityCard {...city} />
          </div>
        ))}
      </div>

      {/* Mobile only View All button */}
      <div className="mt-0 sm:mt-2 flex sm:hidden justify-center pb-2">
        <button className="group relative overflow-hidden flex items-center justify-center cursor-pointer px-6 py-3 rounded-md border border-gray-200 text-slate-600 font-bold text-sm hover:border-[#04473a] hover:text-[#04473a] hover:bg-teal-50 transition-all w-full shadow-sm">
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="absolute left-[30%] -translate-x-[150%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out"
          />
          <span className="transform group-hover:translate-x-3 transition-transform duration-500 ease-out">
            View All Cities
          </span>
          <Icon
            icon="lucide:arrow-right"
            width="16"
            className="ml-2 transform group-hover:translate-x-[150%] group-hover:opacity-0 transition-all duration-500 ease-out"
          />
        </button>
      </div>
    </section>
  );
};

export default PopularCities;
