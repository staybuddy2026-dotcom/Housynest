import { Outlet } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import ScrollToTop from '../components/ScrollToTop';

const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB] font-sans text-slate-900 selection:bg-brand-teal/20 selection:text-brand-teal">
      
      {/* Fixed Navbar */}
      <div className="shrink-0 z-50 bg-white border-b border-slate-100">
        <Navbar />
      </div>
      
      {/* Internal Scrolling Area */}
      <ReactLenis 
        className="flex-1 overflow-x-hidden overflow-y-auto"
        options={{ smoothTouch: true, orientation: 'vertical', gestureOrientation: 'vertical' }}
      >
        <ScrollToTop />
        <main className="grow flex flex-col min-h-max">
          <Outlet />
        </main>
        
        <Newsletter />
        <Footer />
      </ReactLenis>
    </div>
  );
};

export default MainLayout;
