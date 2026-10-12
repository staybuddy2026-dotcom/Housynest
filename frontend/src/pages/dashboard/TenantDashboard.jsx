import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { buildPayments, propertyNameOf, roomLabelOf } from '../../lib/rentPayments';
import { getBookingPricing } from '../../lib/rentPricing';

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

// A stay the tenant has (or is about to have), most settled first.
const STAY_ORDER = ['Active', 'Confirmed', 'Reserved', 'Pending Payment', 'Pending Request'];

const STAY_BADGE = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Reserved: 'bg-blue-50 text-blue-700 border-blue-200',
  'Pending Payment': 'bg-amber-50 text-amber-700 border-amber-200',
  'Pending Request': 'bg-amber-50 text-amber-700 border-amber-200',
};

const visitTitle = (property) =>
  property ? property.pgName || property.societyName || (property.bhkType ? `${property.bhkType} ${property.propertyCategory || ''}`.trim() : property.propertyCategory) || 'Property' : 'Deleted Property';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [visits, setVisits] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };
    const get = async (url) => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`${url} ${res.status}`);
      return res.json();
    };

    // Each section loads on its own, so one failing call doesn't empty the whole dashboard.
    const [profileRes, bookingsRes, invoicesRes, contractsRes, ticketsRes, visitsRes, leadsRes] = await Promise.allSettled([
      get('/api/users/profile'),
      get('/api/bookings/tenant'),
      get('/api/invoices/tenant'),
      get('/api/contracts/tenant'),
      get('/api/maintenance/tenant'),
      get('/api/visits/tenant'),
      get('/api/leads/tenant'),
    ]);

    const ok = (r) => (r.status === 'fulfilled' ? r.value : null);
    if (ok(profileRes)) setProfile(ok(profileRes));
    const tenantBookings = Array.isArray(ok(bookingsRes)) ? ok(bookingsRes) : [];
    setBookings(tenantBookings);
    if (Array.isArray(ok(invoicesRes))) setPayments(buildPayments(ok(invoicesRes), tenantBookings));
    if (Array.isArray(ok(contractsRes))) setContracts(ok(contractsRes));
    if (Array.isArray(ok(ticketsRes))) setTickets(ok(ticketsRes));
    if (Array.isArray(ok(visitsRes))) setVisits(ok(visitsRes));
    if (Array.isArray(ok(leadsRes))) setUnreadMessages(ok(leadsRes).reduce((sum, l) => sum + (l.unreadCount || 0), 0));

    if ([profileRes, bookingsRes, invoicesRes].some((r) => r.status === 'rejected')) {
      toast.error('Some dashboard details could not be loaded');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, [fetchDashboard]);

  // ---------- Derived figures ----------

  const currentStay = [...bookings]
    .filter((b) => STAY_ORDER.includes(b.status))
    .sort((a, b) => STAY_ORDER.indexOf(a.status) - STAY_ORDER.indexOf(b.status))[0] || null;

  // The oldest unpaid amount is due first, as on the Rent Payments page.
  const nextDue = payments
    .filter((p) => p.status === 'Pending' || p.status === 'Overdue')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0] || null;
  const nextDueOverdue = Boolean(nextDue) && new Date(nextDue.dueDate) < new Date();

  const awaitingSignature = contracts.filter((c) => c.status === 'PENDING_TENANT_REVIEW');
  const openTickets = tickets.filter((t) => ['Pending', 'In-Progress'].includes(t.status));
  const today = new Date().toISOString().slice(0, 10);
  const upcomingVisits = visits
    .filter((v) => ['Pending', 'Accepted', 'Rescheduled'].includes(v.status) && (v.date || '') >= today)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const recentPayments = payments.filter((p) => p.status === 'Paid').slice(0, 3);

  // ---------- Required details ----------

  const p = profile || storedUser || {};
  const emergency = p.emergencyContact || {};
  const requiredDetails = [
    { label: 'Full Name', value: p.fullName, icon: 'lucide:user' },
    { label: 'Email', value: p.email, icon: 'lucide:mail' },
    { label: 'Phone', value: p.phone, icon: 'lucide:phone' },
    { label: 'Date of Birth', value: p.dob ? formatDate(p.dob) : '', icon: 'lucide:cake' },
    { label: 'Gender', value: p.gender, icon: 'lucide:users' },
    {
      label: 'Emergency Contact',
      value: emergency.phone ? `${emergency.name || 'Contact'}${emergency.relationship ? ` (${emergency.relationship})` : ''} · ${emergency.phone}` : '',
      icon: 'lucide:siren',
    },
  ];
  const filledCount = requiredDetails.filter((d) => d.value).length;
  const completion = Math.round((filledCount / requiredDetails.length) * 100);
  const missing = requiredDetails.filter((d) => !d.value).map((d) => d.label);

  const firstName = (p.fullName || 'Tenant').split(' ')[0];

  const alerts = [
    nextDue && {
      key: 'rent',
      tone: nextDueOverdue ? 'rose' : 'amber',
      icon: nextDueOverdue ? 'lucide:alert-triangle' : 'lucide:wallet',
      title: nextDueOverdue ? 'Rent payment overdue' : 'Rent payment due',
      text: `${formatCurrency(nextDue.amount)} for ${nextDue.title} · due ${formatDate(nextDue.dueDate)}`,
      action: 'Pay Now',
      onClick: () => navigate(`/tenant/bookings/${nextDue.bookingId}/pay-rent`),
    },
    awaitingSignature.length > 0 && {
      key: 'contract',
      tone: 'indigo',
      icon: 'lucide:pen-line',
      title: `${awaitingSignature.length} contract${awaitingSignature.length > 1 ? 's' : ''} awaiting your signature`,
      text: 'Review and sign your rental agreement to complete your booking.',
      action: 'Review',
      onClick: () => navigate('/tenant/contracts'),
    },
    missing.length > 0 && {
      key: 'profile',
      tone: 'slate',
      icon: 'lucide:user-round-pen',
      title: 'Complete your profile',
      text: `Missing: ${missing.join(', ')}. Owners need these details for your booking.`,
      action: 'Update',
      onClick: () => navigate('/tenant/profile'),
    },
  ].filter(Boolean);

  const toneClasses = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  const stats = [
    {
      title: 'Current Stay',
      value: currentStay ? currentStay.status : 'None',
      subtitle: currentStay ? propertyNameOf(currentStay.propertyId) : 'No active booking',
      icon: 'lucide:home',
      color: 'bg-brand-teal/10 text-brand-teal',
      path: '/tenant/bookings',
    },
    {
      title: nextDueOverdue ? 'Rent Overdue' : 'Next Rent Due',
      value: nextDue ? formatCurrency(nextDue.amount) : '₹0',
      subtitle: nextDue ? `Due ${formatDate(nextDue.dueDate)}` : 'All paid up',
      icon: 'lucide:wallet',
      color: nextDueOverdue ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500',
      path: '/tenant/transactions',
    },
    {
      title: 'Open Requests',
      value: String(openTickets.length),
      subtitle: 'Maintenance tickets',
      icon: 'lucide:wrench',
      color: 'bg-purple-500/10 text-purple-500',
      path: '/tenant/maintenance',
    },
    {
      title: 'Unread Messages',
      value: String(unreadMessages),
      subtitle: 'From property owners',
      icon: 'lucide:message-square',
      color: 'bg-blue-500/10 text-blue-500',
      path: '/tenant/messages',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  const stayPricing = currentStay ? getBookingPricing(currentStay) : null;
  const stayRent = stayPricing?.rent || currentStay?.paymentDetails?.rentAmount || 0;

  return (
    <div className="flex flex-col w-full pb-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#062F26] leading-tight flex items-center gap-2">
            Welcome back, {firstName}! <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Here's everything about your stay in one place.</p>
        </div>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-[#062F26] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-teal transition-colors shrink-0 shadow-sm"
        >
          <Icon icon="lucide:search" className="w-4 h-4" />
          Find a Home
        </Link>
      </div>

      {/* Needs attention */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {alerts.map((a) => (
            <div key={a.key} className={`flex flex-col sm:flex-row sm:items-center gap-3 border rounded-xl px-4 py-3 ${toneClasses[a.tone]}`}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Icon icon={a.icon} className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="text-xs font-medium opacity-90">{a.text}</p>
                </div>
              </div>
              <button
                onClick={a.onClick}
                className="shrink-0 px-4 py-2 rounded-lg bg-white/80 hover:bg-white border border-current/20 text-sm font-bold transition-colors"
              >
                {a.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <Link
            key={s.title}
            to={s.path}
            className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-brand-teal/30 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <Icon icon={s.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-bold text-[#062F26] leading-none mb-1 truncate">{s.value}</h3>
                <p className="text-sm font-medium text-slate-600">{s.title}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-3 truncate">{s.subtitle}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Current stay */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#062F26]">My Current Stay</h3>
              <Link to="/tenant/bookings" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
                All Bookings <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
              </Link>
            </div>
            {currentStay ? (
              <div className="p-5 flex flex-col sm:flex-row gap-4">
                <img
                  src={currentStay.propertyId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop'}
                  alt={propertyNameOf(currentStay.propertyId)}
                  className="w-full sm:w-44 h-32 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-[#062F26] truncate">{propertyNameOf(currentStay.propertyId)}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STAY_BADGE[currentStay.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {currentStay.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-3">
                    <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {[currentStay.propertyId?.address, currentStay.propertyId?.locality, currentStay.propertyId?.city].filter(Boolean).join(', ') || 'Address not available'}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      ['Room / Unit', roomLabelOf(currentStay)],
                      ['Move-in Date', formatDate(currentStay.moveInDate)],
                      ['Monthly Rent', stayRent ? formatCurrency(stayRent) : 'N/A'],
                      ['Booking ID', currentStay.bookingId || String(currentStay._id).slice(-8).toUpperCase()],
                      ['Move-out Date', formatDate(currentStay.expectedMoveOutDate)],
                      ['Payment', currentStay.paymentDetails?.status || 'N/A'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-bold text-[#062F26] truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Icon icon="lucide:home" className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">You don't have an active stay yet</p>
                <p className="text-xs text-slate-400 mb-4">Find a PG or rental home and book it online.</p>
                <Link to="/" className="inline-flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-bold">
                  <Icon icon="lucide:search" className="w-4 h-4" /> Explore Properties
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming visits */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#062F26]">Upcoming Visits</h3>
              <Link to="/tenant/bookings" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
                View All <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
              </Link>
            </div>
            {upcomingVisits.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400 font-medium">No upcoming property visits.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {upcomingVisits.slice(0, 3).map((v) => (
                  <div key={v._id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:calendar-days" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#062F26] truncate">{visitTitle(v.property)}</p>
                      <p className="text-xs text-slate-500 font-medium capitalize">
                        {formatDate(v.date)} · {v.suggestedTime || v.time}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent payments */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#062F26]">Recent Payments</h3>
              <Link to="/tenant/transactions" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
                All Payments <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400 font-medium">No payments yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentPayments.map((pay) => (
                  <div key={pay.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:check-circle-2" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#062F26] truncate">{pay.title}</p>
                      <p className="text-xs text-slate-500 font-medium">Paid {formatDate(pay.paidAt || pay.dueDate)}</p>
                    </div>
                    <span className="text-sm font-bold text-[#062F26]">{formatCurrency(pay.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Required details */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#062F26]">My Details</h3>
              <Link to="/tenant/profile" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
                Edit <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Profile completeness</span>
                <span className={`text-xs font-bold ${completion === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{completion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all ${completion === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  style={{ width: `${completion}%` }}
                />
              </div>
              <div className="flex flex-col gap-3">
                {requiredDetails.map((d) => (
                  <div key={d.label} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${d.value ? 'bg-brand-teal/10 text-brand-teal' : 'bg-rose-50 text-rose-500'}`}>
                      <Icon icon={d.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.label}</p>
                      <p className={`text-sm font-bold truncate ${d.value ? 'text-[#062F26]' : 'text-rose-500'}`}>
                        {d.value || 'Not provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#062F26]">Maintenance Requests</h3>
              <Link to="/tenant/maintenance" className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
                View All <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
              </Link>
            </div>
            {openTickets.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400 font-medium">No open maintenance requests.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {openTickets.slice(0, 3).map((t) => (
                  <div key={t._id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#062F26] truncate">{t.title}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {t.ticketId || 'Ticket'} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="p-5">
              <h3 className="text-[15px] font-bold text-[#062F26]">Quick Actions</h3>
            </div>
            <div className="flex flex-col px-4 pb-4 gap-2">
              {[
                { name: 'Pay Rent', icon: 'lucide:credit-card', path: '/tenant/transactions', color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
                { name: 'Raise Maintenance Request', icon: 'lucide:wrench', path: '/tenant/maintenance', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { name: 'View Contracts', icon: 'lucide:file-text', path: '/tenant/contracts', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                { name: 'Saved Properties', icon: 'lucide:heart', path: '/tenant/saved-properties', color: 'text-rose-500', bg: 'bg-rose-500/10' },
              ].map((a) => (
                <Link
                  key={a.name}
                  to={a.path}
                  className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-brand-teal/30 hover:shadow-sm transition-all group bg-white"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.bg}`}>
                    <Icon icon={a.icon} className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-bold text-[#062F26]">{a.name}</span>
                  <Icon icon="lucide:chevron-right" className="w-4 h-4 text-slate-400 group-hover:text-brand-teal transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
