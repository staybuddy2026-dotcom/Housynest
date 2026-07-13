import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import { io } from 'socket.io-client';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import ListProperty from './pages/ListProperty';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DashboardLayout from './layouts/DashboardLayout';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import OwnerListings from './pages/dashboard/OwnerListings';
import OwnerVisits from './pages/dashboard/OwnerVisits';
import OwnerInquiries from './pages/dashboard/OwnerInquiries';
import OwnerMessages from './pages/dashboard/OwnerMessages';
import OwnerLawyerRequests from './pages/dashboard/OwnerLawyerRequests';
import OwnerContracts from './pages/dashboard/OwnerContracts';
import OwnerProfile from './pages/dashboard/OwnerProfile';
import TenantDashboardLayout from './layouts/TenantDashboardLayout';
import TenantSavedProperties from './pages/dashboard/TenantSavedProperties';
import TenantRequests from './pages/dashboard/TenantRequests';
import TenantVisits from './pages/dashboard/TenantVisits';
import TenantMessages from './pages/dashboard/TenantMessages';
import TenantContracts from './pages/dashboard/TenantContracts';
import TenantProfile from './pages/dashboard/TenantProfile';
import LawyerDashboardLayout from './layouts/LawyerDashboardLayout';
import LawyerOverview from './pages/dashboard/LawyerOverview';
import LawyerOwners from './pages/dashboard/LawyerOwners';
import LawyerOwnerProperties from './pages/dashboard/LawyerOwnerProperties';
import LawyerContracts from './pages/dashboard/LawyerContracts';
import LawyerContractDetails from './pages/dashboard/LawyerContractDetails';
import LawyerContractDraft from './pages/dashboard/LawyerContractDraft';
import LawyerProfile from './pages/dashboard/LawyerProfile';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminListings from './pages/admin/AdminListings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPropertyRequests from './pages/admin/AdminPropertyRequests';
import AdminLawyerRequests from './pages/admin/AdminLawyerRequests';
import AdminWhatsAppOutreach from './pages/admin/AdminWhatsAppOutreach';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';
import NotFound from './pages/NotFound';
import { Toaster, toast } from 'react-hot-toast';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const socket = io('http://localhost:5000');

    socket.emit('joinUserRoom', user.id || user._id);

    socket.on('newNotification', (data) => {
      toast.success(`New Message: ${data.message.text}`, {
        duration: 3000,
      });

      // 2. Dispatch custom event for unread count logic
      window.dispatchEvent(new CustomEvent('globalNewNotification', { detail: data }));
    });

    socket.on('newLawyerRequest', (data) => {
      toast.success(`New Lawyer Request from ${data.lawyer?.fullName || 'a lawyer'}!`, {
        duration: 3000,
      });
      window.dispatchEvent(new CustomEvent('globalNewLawyerRequest', { detail: data }));
    });

    socket.on('lawyerRequestUpdated', (data) => {
      toast.success(`Request ${data.status} by property owner`, {
        duration: 3000,
      });
      window.dispatchEvent(new CustomEvent('globalLawyerRequestUpdated', { detail: data }));
    });

    socket.on('newOwnerContract', (contract) => {
      toast.success(`You have a new contract from your lawyer to sign!`, {
        duration: 3000,
      });
      window.dispatchEvent(new CustomEvent('newOwnerContract', { detail: contract }));
    });

    socket.on('newTenantContract', (contract) => {
      toast.success(`You have a new lease contract to sign!`, {
        duration: 3000,
      });
      window.dispatchEvent(new CustomEvent('newTenantContract', { detail: contract }));
    });

    socket.on('ownerSignedContract', (contract) => {
      toast.success(`Owner has signed the contract!`, {
        duration: 3000,
      });
      window.dispatchEvent(new CustomEvent('globalOwnerSignedContract', { detail: contract }));
    });

    socket.on('tenantSignedContract', (contract) => {
      toast.success(`Tenant has signed the contract!`, {
        duration: 3000,
      });
      window.dispatchEvent(new CustomEvent('globalTenantSignedContract', { detail: contract }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          duration: 3000,
          className: 'toast-with-progress',
          style: {
            background: '#04473a',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            fontWeight: '600',
            fontSize: '14px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#fbbf24',
              secondary: '#04473a',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/signup" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public Routes with internal smooth scroll */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/list-property" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <ListProperty />
              </ProtectedRoute>
            } />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Dashboard Routes (Custom internal smooth scroll) */}
          <Route path="/owner" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="listings" element={<OwnerListings />} />
            <Route path="visits" element={<OwnerVisits />} />
            <Route path="inquiries" element={<OwnerInquiries />} />
            <Route path="messages" element={<OwnerMessages />} />
            <Route path="lawyer-requests" element={<OwnerLawyerRequests />} />
            <Route path="contracts" element={<OwnerContracts />} />
            <Route path="profile" element={<OwnerProfile />} />
            {/* Additional owner routes can go here */}
          </Route>

          {/* Tenant Dashboard Routes */}
          <Route path="/tenant" element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<TenantSavedProperties />} />
            <Route path="visits" element={<TenantVisits />} />
            <Route path="requests" element={<TenantRequests />} />
            <Route path="messages" element={<TenantMessages />} />
            <Route path="contracts" element={<TenantContracts />} />
            <Route path="profile" element={<TenantProfile />} />
            {/* Additional tenant routes can go here */}
          </Route>

          {/* Lawyer Dashboard Routes */}
          <Route path="/lawyer" element={
            <ProtectedRoute allowedRoles={['lawyer']}>
              <LawyerDashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<LawyerOverview />} />
            <Route path="owners" element={<LawyerOwners />} />
            <Route path="owners/:ownerId" element={<LawyerOwnerProperties />} />
            <Route path="contracts" element={<LawyerContracts />} />
            <Route path="contracts/draft/:id" element={<LawyerContractDraft />} />
            <Route path="contracts/:id" element={<LawyerContractDetails />} />
            <Route path="profile" element={<LawyerProfile />} />
            {/* Additional lawyer routes can go here */}
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']} redirectPath="/control/login">
              <AdminDashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="property-requests" element={<AdminPropertyRequests />} />
            <Route path="lawyer-requests" element={<AdminLawyerRequests />} />
            <Route path="wa-outreach" element={<AdminWhatsAppOutreach />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            {/* Additional admin routes can go here */}
          </Route>

          {/* Admin Login Route */}
          <Route path="/control/login" element={<AdminLogin />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
