import { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import ReactApexChart from 'react-apexcharts';

import CustomDropdown from '../../components/list-property/CustomDropdown';

const getVerificationBadge = (isVerified) => {
  if (isVerified === true || isVerified === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Icon icon="lucide:check-circle-2" className="w-3 h-3 text-emerald-600" /> Verified
      </span>
    );
  } else if (isVerified === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <Icon icon="lucide:x-circle" className="w-3 h-3 text-rose-600" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <Icon icon="lucide:clock" className="w-3 h-3 text-amber-600" /> Pending
    </span>
  );
};

const getAccountStatusBadge = (isBlocked) => {
  if (isBlocked) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span> Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
    </span>
  );
};

const getInitialsBg = (name) => {
  const colors = [
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-rose-100 text-rose-800 border-rose-200'
  ];
  let charCode = 0;
  for (let i = 0; i < (name || '').length; i++) {
    charCode += name.charCodeAt(i);
  }
  return colors[charCode % colors.length];
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tenants'); // 'Tenants' | 'Owners'

  // Tenant Filters & Search
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantPropertyFilter, setTenantPropertyFilter] = useState('All');
  const [tenantVerificationFilter, setTenantVerificationFilter] = useState('All');
  const [tenantStatusFilter, setTenantStatusFilter] = useState('All');
  const [tenantPage, setTenantPage] = useState(1);

  // Owner Filters & Search
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerPropertyFilter, setOwnerPropertyFilter] = useState('All');
  const [ownerVerificationFilter, setOwnerVerificationFilter] = useState('All');
  const [ownerStatusFilter, setOwnerStatusFilter] = useState('All');
  const [ownerPage, setOwnerPage] = useState(1);

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null); // For View Details Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState('tenant');
  const [newUserData, setNewUserData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  const pageSize = 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch('/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Failed to fetch admin users', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Separate tenants & owners
  const tenantsList = useMemo(() => {
    return users.filter(u => u.role === 'tenant' || u.role === 'renter');
  }, [users]);

  const ownersList = useMemo(() => {
    return users.filter(u => u.role === 'owner' || u.role === 'landlord');
  }, [users]);

  // Filtered Tenants
  const filteredTenants = useMemo(() => {
    return tenantsList.filter(t => {
      const searchLower = tenantSearch.toLowerCase();
      const matchesSearch =
        (t.fullName || '').toLowerCase().includes(searchLower) ||
        (t.email || '').toLowerCase().includes(searchLower) ||
        (t.phone || '').includes(searchLower) ||
        (t.assignedProperty || '').toLowerCase().includes(searchLower);

      let matchesProp = true;
      if (tenantPropertyFilter !== 'All') {
        matchesProp = t.assignedProperty === tenantPropertyFilter;
      }

      let matchesVerif = true;
      if (tenantVerificationFilter === 'Verified') matchesVerif = t.isVerified === true;
      if (tenantVerificationFilter === 'Pending') matchesVerif = !t.isVerified || t.isVerified === 'Pending';
      if (tenantVerificationFilter === 'Rejected') matchesVerif = t.isVerified === 'Rejected';

      let matchesStatus = true;
      if (tenantStatusFilter === 'Active') matchesStatus = !t.isBlocked;
      if (tenantStatusFilter === 'Inactive' || tenantStatusFilter === 'Blocked') matchesStatus = t.isBlocked;

      return matchesSearch && matchesProp && matchesVerif && matchesStatus;
    });
  }, [tenantsList, tenantSearch, tenantPropertyFilter, tenantVerificationFilter, tenantStatusFilter]);

  // Filtered Owners
  const filteredOwners = useMemo(() => {
    return ownersList.filter(o => {
      const searchLower = ownerSearch.toLowerCase();
      const matchesSearch =
        (o.fullName || '').toLowerCase().includes(searchLower) ||
        (o.email || '').toLowerCase().includes(searchLower) ||
        (o.phone || '').includes(searchLower);

      let matchesVerif = true;
      if (ownerVerificationFilter === 'Verified') matchesVerif = o.isVerified === true;
      if (ownerVerificationFilter === 'Pending') matchesVerif = !o.isVerified || o.isVerified === 'Pending';
      if (ownerVerificationFilter === 'Rejected') matchesVerif = o.isVerified === 'Rejected';

      let matchesStatus = true;
      if (ownerStatusFilter === 'Active') matchesStatus = !o.isBlocked;
      if (ownerStatusFilter === 'Inactive' || ownerStatusFilter === 'Blocked') matchesStatus = o.isBlocked;

      return matchesSearch && matchesVerif && matchesStatus;
    });
  }, [ownersList, ownerSearch, ownerVerificationFilter, ownerStatusFilter]);

  // Paginated Data
  const paginatedTenants = useMemo(() => {
    const start = (tenantPage - 1) * pageSize;
    return filteredTenants.slice(start, start + pageSize);
  }, [filteredTenants, tenantPage]);

  const totalTenantPages = Math.ceil(filteredTenants.length / pageSize) || 1;

  const paginatedOwners = useMemo(() => {
    const start = (ownerPage - 1) * pageSize;
    return filteredOwners.slice(start, start + pageSize);
  }, [filteredOwners, ownerPage]);

  const totalOwnerPages = Math.ceil(filteredOwners.length / pageSize) || 1;

  // Dynamic Stats Metrics for Active Tab
  const currentStats = useMemo(() => {
    const list = activeTab === 'Tenants' ? tenantsList : ownersList;
    const total = list.length;
    const active = list.filter(u => !u.isBlocked).length;
    const now = new Date();
    const newThisMonth = list.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const verifiedCount = list.filter(u => u.isVerified === true).length;
    const verifiedPct = total > 0 ? ((verifiedCount / total) * 100).toFixed(1) : '100';

    return { total, active, newThisMonth, verifiedPct };
  }, [activeTab, tenantsList, ownersList]);

  const tenantPropertyOptions = useMemo(() => {
    const props = new Set();
    tenantsList.forEach(t => {
      if (t.assignedProperty) props.add(t.assignedProperty);
    });
    return [
      { label: 'All Properties', value: 'All' },
      ...Array.from(props).map(p => ({ label: p, value: p }))
    ];
  }, [tenantsList]);

  const ownerPropertyOptions = useMemo(() => {
    return [
      { label: 'All Properties', value: 'All' }
    ];
  }, []);

  const verificationOptions = [
    { label: 'Verification Status', value: 'All' },
    { label: 'Verified', value: 'Verified' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  const statusOptions = [
    { label: 'Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive / Blocked', value: 'Inactive' }
  ];

  const sparklineOptions = {
    chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: true } },
    stroke: { width: 1.5, curve: 'smooth' },
    fill: {
      type: 'solid',
      opacity: 0.15
    },
    grid: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
    yaxis: {
      min: 0,
      max: 95,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: false },
      tooltip: { enabled: false }
    },
    tooltip: { enabled: false }
  };

  const sparklineData = [
    [57, 75, 85, 62, 80, 58, 65],
    [88, 70, 80, 62, 75, 60, 62],
    [75, 62, 75, 50, 76, 55, 80],
    [50, 90, 62, 75, 52, 62, 77]
  ];

  const getColorHex = (colorClass) => {
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('orange')) return '#f97316';
    if (colorClass.includes('teal')) return '#14b8a6';
    return '#10b981';
  };

  const getHoverBgClass = (colorClass) => {
    if (colorClass.includes('emerald')) return 'group-hover:bg-emerald-500';
    if (colorClass.includes('blue')) return 'group-hover:bg-blue-500';
    if (colorClass.includes('orange')) return 'group-hover:bg-orange-500';
    if (colorClass.includes('teal')) return 'group-hover:bg-teal-500';
    return 'group-hover:bg-emerald-500';
  };

  // Metric Cards Config
  const cardsConfig = useMemo(() => [
    {
      id: 'total',
      title: `Total ${activeTab}`,
      value: currentStats.total.toLocaleString(),
      subtitle: '▲ 12.5% vs last month',
      icon: 'lucide:users',
      color: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      filterAction: () => {
        if (activeTab === 'Tenants') {
          setTenantStatusFilter('All');
          setTenantVerificationFilter('All');
          setTenantPage(1);
        } else {
          setOwnerStatusFilter('All');
          setOwnerVerificationFilter('All');
          setOwnerPage(1);
        }
      }
    },
    {
      id: 'active',
      title: `Active ${activeTab}`,
      value: currentStats.active.toLocaleString(),
      subtitle: '▲ 8.2% vs last month',
      icon: 'lucide:user-check',
      color: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      filterAction: () => {
        if (activeTab === 'Tenants') {
          setTenantStatusFilter('Active');
          setTenantPage(1);
        } else {
          setOwnerStatusFilter('Active');
          setOwnerPage(1);
        }
      }
    },
    {
      id: 'new',
      title: `New ${activeTab}`,
      value: currentStats.newThisMonth.toLocaleString(),
      subtitle: '▲ 18.6% vs last month',
      icon: 'lucide:user-plus',
      color: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      filterAction: () => { }
    },
    {
      id: 'verified',
      title: `Verified ${activeTab}`,
      value: `${currentStats.verifiedPct}%`,
      subtitle: '▲ 2.4% vs last month',
      icon: 'lucide:shield-check',
      color: 'bg-teal-500/10',
      iconColor: 'text-teal-500',
      filterAction: () => {
        if (activeTab === 'Tenants') {
          setTenantVerificationFilter('Verified');
          setTenantPage(1);
        } else {
          setOwnerVerificationFilter('Verified');
          setOwnerPage(1);
        }
      }
    }
  ], [activeTab, currentStats]);

  // Handle Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserData.fullName || !newUserData.email || !newUserData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmittingAdd(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newUserData.fullName,
          email: newUserData.email,
          phone: newUserData.phone,
          password: newUserData.password,
          role: newUserRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`New ${newUserRole === 'owner' ? 'Owner' : 'Tenant'} added successfully!`);
        setIsAddUserModalOpen(false);
        setNewUserData({ fullName: '', email: '', phone: '', password: '' });
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to add user');
      }
    } catch {
      toast.error('Error connecting to server');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Block / Unblock Handlers
  const handleBlockUser = async () => {
    if (!blockReason.trim()) {
      toast.error('Please provide a reason for blocking');
      return;
    }
    setIsSubmittingBlock(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/users/admin/block-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserForBlock._id,
          isBlocked: true,
          blockReason
        })
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(resData.message || 'User suspended successfully');
        setIsBlockModalOpen(false);
        setSelectedUserForBlock(null);
        fetchUsers();
      } else {
        toast.error(resData.message || 'Failed to suspend user');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/users/admin/block-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          isBlocked: false
        })
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(resData.message || 'User activated successfully');
        fetchUsers();
      } else {
        toast.error(resData.message || 'Failed to activate user');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const exportCSV = () => {
    const dataToExport = activeTab === 'Tenants' ? filteredTenants : filteredOwners;
    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Name,Email,Phone,Role,Status,JoinedDate\n'];
    const rows = dataToExport.map(u => `"${u.fullName}","${u.email}","${u.phone || ''}","${u.role}","${u.isBlocked ? 'Blocked' : 'Active'}","${new Date(u.createdAt).toLocaleDateString('en-GB')}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_Export.csv`;
    a.click();
    toast.success(`${activeTab} data exported successfully`);
  };

  return (
    <div className="space-y-4 mx-auto pb-12 font-sans">
      {/* Top Header & Tab Selector Bar */}
      <div className="space-y-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <Icon icon="lucide:users" className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
              <p className="text-sm text-slate-500 font-medium">Manage and monitor all tenant and owner accounts across the platform.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-md shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Icon icon="lucide:download" className="w-4 h-4 text-slate-500" />
              Export
            </button>
            <button
              onClick={() => {
                setNewUserRole(activeTab === 'Tenants' ? 'tenant' : 'owner');
                setIsAddUserModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#062F26] hover:bg-[#04221c] text-white font-bold text-xs rounded-md shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Icon icon="lucide:plus" className="w-4 h-4" />
              Add New {activeTab === 'Tenants' ? 'Tenant' : 'Owner'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('Tenants')}
            className={`text-sm font-bold pb-2 relative transition-colors cursor-pointer ${activeTab === 'Tenants' ? 'text-[#062F26]' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Tenants
            {activeTab === 'Tenants' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#062F26] rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('Owners')}
            className={`text-sm font-bold pb-2 relative transition-colors cursor-pointer ${activeTab === 'Owners' ? 'text-[#062F26]' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Owners
            {activeTab === 'Owners' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#062F26] rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsConfig.map((card, idx) => (
          <div
            key={idx}
            onClick={card.filterAction}
            className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col relative group cursor-pointer hover:border-[#062F26]/20 hover:shadow-[0_8px_30px_rgba(6,47,38,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[125px]"
          >
            {/* Subtle hover background gradient flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#062F26]/5 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Background Sparkline Chart */}
            <div className="absolute -bottom-3 -left-4 -right-4 h-20 pointer-events-none z-0 opacity-70 group-hover:opacity-100 transition-opacity">
              <ReactApexChart
                options={{ ...sparklineOptions, colors: [getColorHex(card.iconColor)] }}
                series={[{ data: sparklineData[idx % 4] }]}
                type="area"
                height="100%"
                width="100%"
              />
            </div>

            <div className="flex items-start gap-4 mb-3 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out shadow-xs`}>
                <Icon icon={card.icon} className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-[#062F26] leading-none tracking-tight mb-1">{card.value}</h3>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 relative z-10">
              <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">{card.subtitle}</p>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getHoverBgClass(card.iconColor)} group-hover:text-white text-slate-400 transition-all duration-300 transform group-hover:translate-x-1`}>
                <Icon icon="lucide:arrow-right" className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tenants List Card */}
      {activeTab === 'Tenants' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          {/* Header & Filter Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-xl font-bold text-[#062F26]">Tenants List</h3>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Icon icon="lucide:search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={tenantSearch}
                  onChange={(e) => {
                    setTenantSearch(e.target.value);
                    setTenantPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:border-[#062F26]"
                />
              </div>

              <CustomDropdown containerClassName="w-[110px] sm:w-[130px]"
                icon="lucide:building"
                options={tenantPropertyOptions}
                value={tenantPropertyFilter}
                onChange={(val) => {
                  setTenantPropertyFilter(val);
                  setTenantPage(1);
                }}
              />

              <CustomDropdown containerClassName="w-[110px] sm:w-[130px]"
                icon="lucide:shield-check"
                options={verificationOptions}
                value={tenantVerificationFilter}
                onChange={(val) => {
                  setTenantVerificationFilter(val);
                  setTenantPage(1);
                }}
              />

              <CustomDropdown containerClassName="w-[110px] sm:w-[130px]"
                icon="lucide:activity"
                options={statusOptions}
                value={tenantStatusFilter}
                onChange={(val) => {
                  setTenantStatusFilter(val);
                  setTenantPage(1);
                }}
              />

              <button
                onClick={() => {
                  setTenantSearch('');
                  setTenantPropertyFilter('All');
                  setTenantVerificationFilter('All');
                  setTenantStatusFilter('All');
                  setTenantPage(1);
                }}
                className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Icon icon="lucide:rotate-ccw" className="w-3.5 h-3.5 text-slate-500" />
                Reset
              </button>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tenant</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Property</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Joined On</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Verification</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-[#062F26] mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Loading tenants data...</p>
                    </td>
                  </tr>
                ) : paginatedTenants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-xs">
                      No tenants found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Tenant Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {tenant.profilePic ? (
                            <img src={tenant.profilePic} alt={tenant.fullName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 border ${getInitialsBg(tenant.fullName)}`}>
                              {getInitials(tenant.fullName)}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-bold text-[#062F26] block leading-tight">{tenant.fullName}</span>
                            <span className="text-xs text-slate-400 font-medium block mt-0.5">{tenant.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6 text-xs font-bold text-slate-700">
                        {tenant.phone || '+91 98765 43210'}
                      </td>

                      {/* Property & Room */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-[#062F26] block">{tenant.assignedProperty || 'Dream PG House'}</span>
                        <span className="text-[11px] font-medium text-slate-400 block mt-0.5">{tenant.assignedRoom || 'Room 101'}</span>
                      </td>

                      {/* Joined On */}
                      <td className="py-4 px-6 text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {new Date(tenant.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Verification */}
                      <td className="py-4 px-6">
                        {getVerificationBadge(tenant.isVerified)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {getAccountStatusBadge(tenant.isBlocked)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setSelectedUser(tenant)}
                            title="View Tenant Details"
                            className="p-2 text-slate-500 hover:text-[#062F26] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Icon icon="lucide:eye" className="w-4 h-4" />
                          </button>

                          {tenant.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(tenant)}
                              title="Unblock Tenant"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Icon icon="lucide:check-circle-2" className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUserForBlock(tenant);
                                setBlockReason('');
                                setIsBlockModalOpen(true);
                              }}
                              title="Block Tenant"
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Icon icon="lucide:ban" className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tenants Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500 text-center sm:text-left">
              Showing {filteredTenants.length > 0 ? (tenantPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(tenantPage * pageSize, filteredTenants.length)} of {filteredTenants.length} tenants
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTenantPage(prev => Math.max(prev - 1, 1))}
                disabled={tenantPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>

              {Array.from({ length: totalTenantPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTenantPage(index + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${tenantPage === index + 1
                    ? 'bg-[#062F26] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setTenantPage(prev => Math.min(prev + 1, totalTenantPages))}
                disabled={tenantPage === totalTenantPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owners List Card */}
      {activeTab === 'Owners' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          {/* Header & Filter Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-xl font-bold text-[#062F26]">Owners List</h3>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Icon icon="lucide:search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search owners..."
                  value={ownerSearch}
                  onChange={(e) => {
                    setOwnerSearch(e.target.value);
                    setOwnerPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:border-[#062F26]"
                />
              </div>

              <CustomDropdown containerClassName="w-[110px] sm:w-[130px]"
                icon="lucide:building"
                options={ownerPropertyOptions}
                value={ownerPropertyFilter}
                onChange={(val) => {
                  setOwnerPropertyFilter(val);
                  setOwnerPage(1);
                }}
              />

              <CustomDropdown containerClassName="w-[110px] sm:w-[130px]"
                icon="lucide:shield-check"
                options={verificationOptions}
                value={ownerVerificationFilter}
                onChange={(val) => {
                  setOwnerVerificationFilter(val);
                  setOwnerPage(1);
                }}
              />

              <CustomDropdown containerClassName="w-[110px] sm:w-[130px]"
                icon="lucide:activity"
                options={statusOptions}
                value={ownerStatusFilter}
                onChange={(val) => {
                  setOwnerStatusFilter(val);
                  setOwnerPage(1);
                }}
              />

              <button
                onClick={() => {
                  setOwnerSearch('');
                  setOwnerPropertyFilter('All');
                  setOwnerVerificationFilter('All');
                  setOwnerStatusFilter('All');
                  setOwnerPage(1);
                }}
                className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Icon icon="lucide:rotate-ccw" className="w-3.5 h-3.5 text-slate-500" />
                Reset
              </button>
            </div>
          </div>

          {/* Owners Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Properties</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Joined On</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Verification</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto text-[#062F26] mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Loading owners data...</p>
                    </td>
                  </tr>
                ) : paginatedOwners.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-xs">
                      No owners found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOwners.map((owner) => (
                    <tr key={owner._id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Owner Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {owner.profilePic ? (
                            <img src={owner.profilePic} alt={owner.fullName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 border ${getInitialsBg(owner.fullName)}`}>
                              {getInitials(owner.fullName)}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-bold text-[#062F26] block leading-tight">{owner.fullName}</span>
                            <span className="text-xs text-slate-400 font-medium block mt-0.5">{owner.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6 text-xs font-bold text-slate-700">
                        {owner.phone || '+91 98222 33445'}
                      </td>

                      {/* Properties Count */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-[#062F26] block">{owner.propertiesCount || 1} Properties</span>
                        <button
                          onClick={() => setSelectedUser(owner)}
                          className="text-[11px] font-bold text-brand-teal hover:underline block mt-0.5 cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>

                      {/* Joined On */}
                      <td className="py-4 px-6 text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {new Date(owner.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Verification */}
                      <td className="py-4 px-6">
                        {getVerificationBadge(owner.isVerified)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {getAccountStatusBadge(owner.isBlocked)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setSelectedUser(owner)}
                            title="View Owner Details"
                            className="p-2 text-slate-500 hover:text-[#062F26] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Icon icon="lucide:eye" className="w-4 h-4" />
                          </button>

                          {owner.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(owner)}
                              title="Unblock Owner"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Icon icon="lucide:check-circle-2" className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUserForBlock(owner);
                                setBlockReason('');
                                setIsBlockModalOpen(true);
                              }}
                              title="Block Owner"
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Icon icon="lucide:ban" className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Owners Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500 text-center sm:text-left">
              Showing {filteredOwners.length > 0 ? (ownerPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(ownerPage * pageSize, filteredOwners.length)} of {filteredOwners.length} owners
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setOwnerPage(prev => Math.max(prev - 1, 1))}
                disabled={ownerPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>

              {Array.from({ length: totalOwnerPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setOwnerPage(index + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${ownerPage === index + 1
                    ? 'bg-[#062F26] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setOwnerPage(prev => Math.min(prev + 1, totalOwnerPages))}
                disabled={ownerPage === totalOwnerPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm border ${getInitialsBg(selectedUser.fullName)}`}>
                  {getInitials(selectedUser.fullName)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#062F26]">{selectedUser.fullName}</h3>
                  <p className="text-xs font-medium text-slate-500 capitalize">{selectedUser.role} Account</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-medium text-slate-600">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                  <p className="font-bold text-[#062F26] text-xs mt-0.5 truncate">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Phone Number</p>
                  <p className="font-bold text-[#062F26] text-xs mt-0.5">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Verification</p>
                  <div className="mt-1">{getVerificationBadge(selectedUser.isVerified)}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Account Status</p>
                  <div className="mt-1">{getAccountStatusBadge(selectedUser.isBlocked)}</div>
                </div>
              </div>

              {selectedUser.role === 'tenant' && (
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase text-emerald-800">Current Occupancy</p>
                  <p className="font-bold text-[#062F26] text-sm mt-1">{selectedUser.assignedProperty || 'No active booking'}</p>
                  {selectedUser.assignedRoom && (
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">{selectedUser.assignedRoom}</p>
                  )}
                </div>
              )}

              {selectedUser.role === 'owner' && (
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold uppercase text-blue-800">Listed Properties</p>
                  <p className="font-bold text-[#062F26] text-base mt-1">{selectedUser.propertiesCount || 0} Total Properties Listed</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-[#062F26] hover:bg-[#05261e] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-[#062F26]">Add New {newUserRole === 'owner' ? 'Owner' : 'Tenant'}</h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#062F26] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:border-[#062F26]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#062F26] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@gmail.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:border-[#062F26]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#062F26] block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:border-[#062F26]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#062F26] block mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:border-[#062F26]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2.5 bg-[#062F26] hover:bg-[#05261e] text-white text-xs font-bold rounded-md shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingAdd && <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {isBlockModalOpen && selectedUserForBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:ban" className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#062F26]">Suspend User Account</h3>
                  <p className="text-xs font-medium text-slate-500">{selectedUserForBlock.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBlockModalOpen(false);
                  setSelectedUserForBlock(null);
                }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl">
                <Icon icon="lucide:alert-triangle" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                  Suspending will restrict account access immediately and send an email notification to <strong className="font-bold">{selectedUserForBlock.email}</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#062F26]">
                  Reason for Suspension <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Violation of terms of service, suspicious activity..."
                  className="w-full h-28 p-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all resize-none placeholder:text-slate-400"
                  maxLength={500}
                ></textarea>
                <span className="text-[10px] font-semibold text-slate-400 text-right">{blockReason.length}/500</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsBlockModalOpen(false);
                  setSelectedUserForBlock(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={isSubmittingBlock}
                className={`flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer ${isSubmittingBlock ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmittingBlock ? (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon icon="lucide:ban" className="w-4 h-4" />
                )}
                <span>{isSubmittingBlock ? 'Processing...' : 'Confirm Suspension'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
