import SEO from '../components/SEO';
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
      <SEO 
        title="Housynest - The modern way to rent and manage properties" 
        description="Find your perfect home or manage your properties seamlessly with Housynest. Trusted by thousands of tenants and property owners."
      />
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
