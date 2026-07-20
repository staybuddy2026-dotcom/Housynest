import StatCards from '../../components/dashboard/StatCards';
import MyListingsWidget from '../../components/dashboard/MyListingsWidget';
import InquiriesChartWidget from '../../components/dashboard/InquiriesChartWidget';
import RecentMessagesWidget from '../../components/dashboard/RecentMessagesWidget';
import QuickActionsWidget from '../../components/dashboard/QuickActionsWidget';
import RecentInquiriesTable from '../../components/dashboard/RecentInquiriesTable';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const OwnerDashboard = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.fullName || 'Owner';

  return (
    <div className="flex flex-col max-w-350 3xl:max-w-[1600px] mx-auto w-full pb-10">

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#062F26] leading-tight flex items-center gap-2">
            Welcome back, {userName}!
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Here's what's happening with your properties today.</p>
        </div>

        <Link
          to="/list-property"
          className="flex items-center gap-2 bg-[#062F26] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-teal transition-colors shrink-0 shadow-sm"
        >
          <Icon icon="lucide:plus" className="w-4.5 h-4.5" />
          Add New Property
        </Link>
      </div>

      {/* Top Stats */}
      <StatCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left Column (Listings & Table) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <MyListingsWidget />
          <RecentInquiriesTable />
        </div>

        {/* Right Column (Widgets) */}
        <div className="flex flex-col gap-4">
          <InquiriesChartWidget />
          <RecentMessagesWidget />
          <QuickActionsWidget />
        </div>

      </div>

    </div>
  );
};

export default OwnerDashboard;
