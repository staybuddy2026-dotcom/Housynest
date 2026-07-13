import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminDashboardLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8F9FA] font-sans overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on large screens */}
      <div className="hidden lg:block h-full">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <AdminHeader />

        {/* Page Content - Add bottom padding on mobile for the fixed nav */}
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 lg:pb-4">
          <Outlet />
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <AdminSidebar isMobile={true} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
