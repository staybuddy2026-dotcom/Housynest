import { Outlet, useLocation, Link } from 'react-router-dom';
import LawyerSidebar from '../components/dashboard/LawyerSidebar';
import { Icon } from '@iconify/react';
import { ReactLenis } from 'lenis/react';

const LawyerDashboardLayout = () => {
  const location = useLocation();
  const isMessagesRoute = location.pathname.includes('/messages');

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8F9FA] font-sans overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on large screens */}
      <div className="hidden lg:block h-full w-65 shrink-0">
        <LawyerSidebar onClose={() => { }} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Fixed Height) */}
        <header className="h-16.25 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4 lg:hidden">
            {/* Logo in Header for Mobile */}
            <Link to="/">
              <img src="/src/assets/logo.png" alt="Housynest" className="h-7 object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-4 md:gap-6 ml-auto">
            {/* Notification Bell */}
            <div className="relative cursor-pointer hover:text-brand-teal transition-colors">
              <Icon icon="lucide:bell" className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                5
              </span>
            </div>

            {/* Back to Home Button */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 bg-[#EAF5F2] hover:bg-[#062F26] text-[#062F26] hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              <Icon icon="lucide:home" className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Main Area OR Fixed Area for Messages */}
        {isMessagesRoute ? (
          <main className="flex-1 flex flex-col overflow-hidden p-0 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        ) : (
          <ReactLenis
            className="flex-1 overflow-x-hidden overflow-y-auto pb-24 lg:pb-0"
            options={{
              smoothTouch: true,
              orientation: 'vertical',
              gestureOrientation: 'vertical'
            }}
          >
            <main className="p-4 min-h-max">
              <Outlet />
            </main>
          </ReactLenis>
        )}

        {/* Bottom Navigation for Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <LawyerSidebar isMobile={true} onClose={() => { }} />
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboardLayout;
