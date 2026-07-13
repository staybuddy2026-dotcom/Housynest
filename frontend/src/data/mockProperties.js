import home1 from '../assets/home1.png';
import home2 from '../assets/home2.png';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/hero3.png';
import heroImg from '../assets/hero_img.jpg';

export const MOCK_PROPERTIES = [
  { id: 1, title: 'Comfort Stay PG', location: 'Koramangala, Bangalore', price: '7,500', rating: '4.7', reviews: '210', image: home1, type: 'PG', amenities: ['Single Room', 'Wi-Fi', 'Food', 'AC'], badge: 'BEST MATCH', isVerified: true },
  { id: 2, title: 'Blue Nest PG', location: 'HSR Layout, Bangalore', price: '8,000', rating: '4.6', reviews: '180', image: home2, type: 'PG', amenities: ['Single Room', 'Wi-Fi', 'Food', 'Laundry'], badge: 'POPULAR', badgeColor: 'bg-orange-500', isVerified: true },
  { id: 3, title: 'Green Living PG', location: 'BTM Layout, Bangalore', price: '6,500', rating: '4.5', reviews: '98', image: hero1, type: 'PG', amenities: ['Sharing Room', 'Wi-Fi', 'Food'], isVerified: true },
  { id: 4, title: 'Happy Homes PG', location: 'Indiranagar, Bangalore', price: '9,000', rating: '4.8', reviews: '162', image: hero2, type: 'PG', amenities: ['Single Room', 'Wi-Fi', 'Food', 'AC'], badge: 'NEW', badgeColor: 'bg-blue-500', isVerified: true },
  { id: 5, title: 'Studio Apartment', location: 'Whitefield, Bangalore', price: '18,000', rating: '4.6', reviews: '120', image: hero3, type: 'Home', amenities: ['Fully Furnished', 'Wi-Fi', 'Kitchen', 'AC'], isVerified: true },
  { id: 6, title: '2BHK Apartment', location: 'Marathahalli, Bangalore', price: '26,000', rating: '4.7', reviews: '210', image: heroImg, type: 'Home', amenities: ['Semi-Furnished', 'Wi-Fi', 'Kitchen', 'Parking'], isVerified: true },
  { id: 7, title: 'Independent House', location: 'Jayanagar, Bangalore', price: '45,000', rating: '4.9', reviews: '156', image: home1, type: 'Home', amenities: ['Unfurnished', 'Garden', 'Parking', 'AC'], isVerified: true },
  { id: 8, title: 'Premium Stay PG', location: 'Electronic City, Bangalore', price: '8,500', rating: '4.6', reviews: '130', image: home2, type: 'PG', amenities: ['Single Room', 'Wi-Fi', 'Food', 'AC'], isVerified: true },
  { id: 9, title: 'Cozy Corner PG', location: 'Koramangala, Bangalore', price: '7,000', rating: '4.4', reviews: '85', image: hero1, type: 'PG', amenities: ['Sharing Room', 'Wi-Fi', 'Food'], isVerified: false },
  { id: 10, title: 'Luxury Villa', location: 'Bellandur, Bangalore', price: '65,000', rating: '4.9', reviews: '42', image: hero2, type: 'Home', amenities: ['Fully Furnished', 'Pool', 'Garden', 'Parking'], badge: 'PREMIUM', badgeColor: 'bg-purple-600', isVerified: true },
  { id: 11, title: 'Sunrise PG', location: 'HSR Layout, Bangalore', price: '8,200', rating: '4.5', reviews: '112', image: hero3, type: 'PG', amenities: ['Single Room', 'Wi-Fi', 'Food', 'Gym'], isVerified: true },
  { id: 12, title: '3BHK Penthouse', location: 'Indiranagar, Bangalore', price: '55,000', rating: '4.8', reviews: '88', image: heroImg, type: 'Home', amenities: ['Fully Furnished', 'Balcony', 'Kitchen', 'AC'], isVerified: true },
];
