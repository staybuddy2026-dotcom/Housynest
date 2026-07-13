import PropertyListingCard from './PropertyListingCard';

const PropertiesGrid = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {properties.map((property, idx) => (
        <div 
          key={property.id} 
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <PropertyListingCard property={property} />
        </div>
      ))}
    </div>
  );
};

export default PropertiesGrid;
