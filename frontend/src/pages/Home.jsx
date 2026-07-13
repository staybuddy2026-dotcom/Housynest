import HeroSection from '../components/home/HeroSection';
import FilterSection from '../components/home/FilterSection';
import PopularCities from '../components/home/PopularCities';
import FeaturedProperties from '../components/home/FeaturedProperties';
import FeaturesBanner from '../components/home/FeaturesBanner';
import HowItWorks from '../components/home/HowItWorks';
import PropertyOwnerCTA from '../components/home/PropertyOwnerCTA';
import Testimonials from '../components/home/Testimonials';

const Home = () => {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <FilterSection />
      <PopularCities />
      <FeaturedProperties />
      <FeaturesBanner />
      <HowItWorks />
      <PropertyOwnerCTA />
      <Testimonials />
    </div>
  );
};

export default Home;
