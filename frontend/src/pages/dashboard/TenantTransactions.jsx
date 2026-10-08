import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getBookingPricing, STAMP_FEES } from '../../lib/rentPricing';
import { buildPayments } from '../../lib/rentPayments';

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

// Same filters as the mobile app's Rent Payments page.
const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'rent', label: 'Rent' },
  { key: 'deposit', label: 'Deposit' },
  { key: 'token', label: 'Token' }
];

const TenantTransactions = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [invRes, bookRes] = await Promise.all([
        fetch('/api/invoices/tenant', { headers }),
        fetch('/api/bookings/tenant', { headers })
      ]);
      if (invRes.ok && bookRes.ok) {
        setPayments(buildPayments(await invRes.json(), await bookRes.json()));
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching transactions');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions();
  };

  const today = new Date(now).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();

  // The oldest unpaid amount is due first (same as the app and the Pay Rent page).
  const duePayments = payments
    .filter(p => p.status === 'Pending' || p.status === 'Overdue')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextDue = duePayments[0] || null;
  // "Due In" / "Overdue By" in days, hours and minutes, like the app and the Pay Rent page.
  const dueDiffMs = nextDue ? new Date(nextDue.dueDate).getTime() - now : 0;
  const nextDueOverdue = Boolean(nextDue) && dueDiffMs < 0;
  const dueLeftMs = Math.abs(dueDiffMs);
  const countdown = [
    { value: Math.floor(dueLeftMs / (1000 * 60 * 60 * 24)), unit: 'Days' },
    { value: Math.floor((dueLeftMs / (1000 * 60 * 60)) % 24), unit: 'Hours' },
    { value: Math.floor((dueLeftMs / (1000 * 60)) % 60), unit: 'Mins' }
  ];

  const currentYear = new Date(now).getFullYear();
  const totalPaidYTD = payments
    .filter(p => p.status === 'Paid' && new Date(p.paidAt || p.dueDate).getFullYear() === currentYear)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const filtered = payments.filter(p => categoryFilter === 'all' || p.category === categoryFilter);
  const countFor = (key) => payments.filter(p => key === 'all' || p.category === key).length;

  const summaryData = [
    {
      id: 1,
      title: nextDue ? formatCurrency(nextDue.amount) : '₹0',
      subtitle: 'Next Rent Due',
      icon: 'lucide:calendar-clock',
      progress: nextDue ? 'w-[40%]' : 'w-[0%]',
      progressBg: 'bg-brand-teal',
      gradientBottom: 'from-brand-teal/20',
      hoverBg: 'hover:shadow-[0_8px_30px_rgba(10,168,125,0.15)] hover:border-brand-teal/30',
      iconColorHover: 'group-hover:bg-brand-teal group-hover:text-white',
      bgIconColor: 'text-brand-teal'
    },
    {
      id: 2,
      title: nextDue ? new Date(nextDue.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A',
      subtitle: 'Due Date',
      icon: 'lucide:calendar',
      progress: nextDue ? 'w-[100%]' : 'w-[0%]',
      progressBg: 'bg-indigo-500',
      gradientBottom: 'from-indigo-500/20',
      hoverBg: 'hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/30',
      iconColorHover: 'group-hover:bg-indigo-500 group-hover:text-white',
      bgIconColor: 'text-indigo-500'
    },
    {
      id: 3,
      title: '₹0',
      subtitle: 'Late Fees',
      icon: 'lucide:alert-circle',
      progress: 'w-[0%]',
      progressBg: 'bg-amber-500',
      gradientBottom: 'from-amber-500/20',
      hoverBg: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:border-amber-500/30',
      iconColorHover: 'group-hover:bg-amber-500 group-hover:text-white',
      bgIconColor: 'text-amber-500'
    },
    {
      id: 4,
      title: formatCurrency(totalPaidYTD),
      subtitle: 'Total Paid (YTD)',
      icon: 'lucide:check-circle',
      progress: totalPaidYTD > 0 ? 'w-[75%]' : 'w-[0%]',
      progressBg: 'bg-emerald-500',
      gradientBottom: 'from-emerald-500/20',
      hoverBg: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30',
      iconColorHover: 'group-hover:bg-emerald-500 group-hover:text-white',
      bgIconColor: 'text-emerald-500'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
          </div>
        );
      case 'Pending':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl shadow-sm">
            <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Due</span>
          </div>
        );
      case 'Overdue':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl shadow-sm">
            <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider">{status || 'UNKNOWN'}</span>
          </div>
        );
    }
  };

  const categoryLabel = (p) => {
    if (p.kind === 'initial') return 'Booking Payment';
    if (p.kind === 'balance') return 'Remaining Balance';
    return p.category === 'token' ? 'Booking Token' : 'Monthly Rent';
  };

  // Payments are made on the booking's Pay Rent page (same flow as before, with the full summary).
  const handlePay = (p) => navigate(`/tenant/bookings/${p.bookingId}/pay-rent`);

  const handleDownloadReceipt = async (p) => {
    const tx = p.invoice;
    toast.loading('Generating receipt...', { id: 'receipt' });
    try {
      const doc = new jsPDF();

      // Helper to get image base64
      const getLogoBase64 = async () => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = '/src/assets/logo.png';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => resolve(null);
        });
      };

      const logoBase64 = await getLogoBase64();

      // Header
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 12, 40, 12);
      } else {
        doc.setFontSize(22);
        doc.setTextColor(10, 168, 125);
        doc.setFont("helvetica", "bold");
        doc.text("Housynest", 14, 20);
      }

      // Centered Payment Receipt Title
      doc.setFontSize(16);
      doc.setTextColor(10, 168, 125);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT RECEIPT", 105, 22, { align: 'center' });
      doc.setFont("helvetica", "normal");

      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`Receipt #${tx._id?.substring(0, 8).toUpperCase()}`, 196, 20, { align: 'right' });
      doc.setFontSize(10);
      doc.text(`Date: ${formatDate(tx.paidAt || tx.updatedAt || Date.now())}`, 196, 26, { align: 'right' });

      doc.setDrawColor(230, 230, 230);
      doc.line(14, 32, 196, 32);

      // Billed To / Paid To
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("PAID TO", 14, 42);
      doc.text("BILLED TO", 196, 42, { align: 'right' });

      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "bold");
      const property = p.booking?.propertyId || tx.propertyId;
      doc.text(property?.pgName || property?.societyName || property?.propertyCategory || 'Property Owner', 14, 48);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      doc.text(user.fullName || 'Tenant', 196, 48, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(property?.address || 'N/A', 14, 54);

      // "Room 203, Bed 2" (the room name already includes "Room").
      doc.text(p.room.replace(' • ', ', '), 196, 54, { align: 'right' });
      doc.text(`Booking ID: ${tx.bookingId?.bookingId || p.booking?.bookingId || String(p.bookingId).substring(0, 8).toUpperCase()}`, 196, 60, { align: 'right' });

      // Table Header
      const startY = 70;
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY, 182, 10, 'F');
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("Description", 20, startY + 7);
      doc.text("Amount", 188, startY + 7, { align: 'right' });

      // Table Content
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");

      let currentY = startY + 10;
      const periodStr = tx.billingPeriodStart && tx.billingPeriodEnd ? ` (${formatDate(tx.billingPeriodStart)} - ${formatDate(tx.billingPeriodEnd)})` : '';

      // A move-in payment is itemised from the booking's real prices (rent, maintenance, fees, rest = deposit).
      const pricing = p.booking ? getBookingPricing(p.booking) : null;
      const isMoveIn = p.isBookingPayment && pricing && pricing.rent > 0 && tx.amount > pricing.rent + 500;

      if (isMoveIn) {
        const items = [
          { label: `Rent${periodStr}`, amount: pricing.rent },
          { label: 'Security Deposit', amount: tx.amount - pricing.rent - pricing.maintenance - STAMP_FEES }
        ];
        if (pricing.maintenance > 0) items.push({ label: 'Maintenance Charges', amount: pricing.maintenance });
        items.push({ label: 'Extra Charges (Stamp & Agreement)', amount: STAMP_FEES });

        items.forEach(item => {
          doc.rect(14, currentY, 182, 12);
          doc.text(item.label, 20, currentY + 8);
          doc.text(`Rs. ${item.amount.toLocaleString('en-IN')}`, 188, currentY + 8, { align: 'right' });
          currentY += 12;
        });
      } else {
        doc.rect(14, currentY, 182, 16);
        doc.text(`Rent${periodStr}`, 20, currentY + 7);
        doc.text(`Rs. ${tx.amount.toLocaleString('en-IN')}`, 188, currentY + 7, { align: 'right' });
        currentY += 16;
      }

      const finalY = currentY + 6;

      // Total Summary
      doc.setFillColor(248, 250, 252);
      doc.rect(14, finalY, 182, 16, 'F');
      doc.rect(14, finalY, 182, 16);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Total Paid:", 20, finalY + 11);
      doc.setTextColor(10, 168, 125);
      doc.text(`Rs. ${tx.amount.toLocaleString('en-IN')}`, 188, finalY + 11, { align: 'right' });

      // Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text("This payment was successfully processed.", 105, 275, { align: "center" });
      doc.text("Thank you for using Housynest!", 105, 282, { align: "center" });

      // Add Watermark (center) over everything so it's not clipped
      if (logoBase64) {
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        doc.addImage(logoBase64, 'PNG', 45, 130, 120, 36);
        doc.setGState(new doc.GState({ opacity: 1.0 }));
      }

      doc.save(`Receipt_${tx._id.substring(tx._id.length - 8).toUpperCase()}.pdf`);
      toast.success('Receipt downloaded successfully!', { id: 'receipt' });
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error('Failed to generate receipt.', { id: 'receipt' });
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm group cursor-pointer hover:bg-emerald-100 transition-colors">
            <Icon icon="lucide:receipt" className="w-5 h-5 text-emerald-600 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">Rent Payments & Receipts</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase flex-wrap mt-0.5">
              <span>{today}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span>Payment History & Invoices</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            className="w-9 h-9 sm:w-10 sm:h-10 cursor-pointer rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all"
          >
            <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-teal' : ''}`} />
          </button>
        </div>
      </div>

      {/* Next payment due (as in the app) */}
      {!loading && nextDue && (
        <div className="mb-4 rounded-xl p-5 bg-gradient-to-br from-[#062F26] to-[#0AA87D] text-white shadow-[0_8px_30px_rgba(6,47,38,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-300 text-[#062F26] text-[10px] font-black uppercase tracking-wider">
                {nextDue.kind === 'initial' ? 'Booking Payment Due' : nextDue.kind === 'balance' ? 'Remaining Balance Due' : nextDueOverdue ? 'Rent Overdue' : 'Upcoming Rent Due'}
              </span>
              <span className="text-xs font-semibold text-white/75">Due: {formatDate(nextDue.dueDate)}</span>
            </div>
            <p className="text-3xl font-black tracking-tight">
              {formatCurrency(nextDue.amount)}
              {nextDue.kind === 'invoice' && <span className="text-sm font-semibold text-white/70"> / month</span>}
            </p>
            <p className="text-sm text-white/90 mt-1">{nextDue.title} • {nextDue.room}</p>
            {nextDue.periodStart && nextDue.periodEnd && (
              <p className="text-xs font-semibold text-white/75 mt-1">
                Rent Period: {formatDate(nextDue.periodStart)} - {formatDate(nextDue.periodEnd)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-[10px] font-black uppercase tracking-wider ${nextDueOverdue ? 'text-rose-200' : 'text-white/75'}`}>
                {nextDueOverdue ? 'Overdue By' : 'Due In'}
              </span>
              {countdown.map(c => (
                <div key={c.unit} className={`min-w-[48px] px-2 py-1.5 rounded-lg text-center ${nextDueOverdue ? 'bg-rose-100' : 'bg-white/95'}`}>
                  <span className={`block text-sm font-black ${nextDueOverdue ? 'text-rose-700' : 'text-[#062F26]'}`}>{c.value}</span>
                  <span className={`block text-[8px] font-bold uppercase ${nextDueOverdue ? 'text-rose-500' : 'text-slate-400'}`}>{c.unit}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => handlePay(nextDue)}
            className="px-6 py-3 bg-white text-[#062F26] font-black text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Icon icon="lucide:zap" className="w-4 h-4 text-brand-teal" />
            {nextDue.kind === 'invoice' ? 'Pay Rent Now' : 'Pay Now'}
          </button>
        </div>
      )}

      {!loading && nextDue && nextDueOverdue && (
        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Icon icon="lucide:alert-circle" className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-800">Payment Overdue</h4>
            <p className="text-xs text-rose-600 mt-1 font-medium leading-relaxed">
              Your rent payment is past the due date. Please clear your dues immediately to avoid late fees or disruption of services.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {summaryData.map((item) => (
          <div key={item.id} className={`bg-white border border-slate-100 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-400 cursor-pointer ${item.hoverBg}`}>
            <Icon icon={item.icon} className={`absolute -right-4 -bottom-4 w-24 h-24 sm:w-32 sm:h-32 opacity-0 group-hover:opacity-10 transition-all duration-500 pointer-events-none ${item.bgIconColor} transform group-hover:-rotate-12`} />
            <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t ${item.gradientBottom} to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#062F26] transition-colors duration-400 tracking-tight">{item.title}</h2>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500 ${item.iconColorHover} transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg`}>
                <Icon icon={item.icon} className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-5 group-hover:text-slate-600 transition-colors duration-400 relative z-10">{item.subtitle}</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative z-10">
              <div className={`${item.progressBg} h-full ${item.progress} transition-all duration-500 rounded-full`} />
            </div>
          </div>
        ))}
      </div>

      {/* Category filters (as in the app) */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto">
        {CATEGORY_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setCategoryFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all cursor-pointer ${categoryFilter === f.key ? 'bg-[#062F26] text-white border-[#062F26]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {f.label}
            <span className={`text-xs ${categoryFilter === f.key ? 'text-white/70' : 'text-slate-400'}`}>{countFor(f.key)}</span>
          </button>
        ))}
      </div>

      {/* Payment List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-brand-teal mb-2" />
            <span className="text-sm font-medium">Loading transactions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 bg-white rounded-xl border border-slate-100 border-dashed">
            <Icon icon="lucide:receipt" className="w-8 h-8 text-slate-300 mb-2" />
            <span className="text-sm font-medium">No transactions found under this category.</span>
          </div>
        ) : (
          filtered.map((p) => {
            const isPaid = p.status === 'Paid';
            return (
              <div key={p.id} className="relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 hover:shadow-[0_8px_30px_rgba(10,168,125,0.12)] hover:border-brand-teal/40 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-brand-teal/[0.03] hover:to-transparent transition-all duration-500 group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-teal opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-l-2xl"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">

                  {/* Left Side: Details */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shrink-0 ${isPaid ? 'bg-slate-100 text-slate-600 group-hover:bg-brand-teal/10 group-hover:text-brand-teal' : 'bg-amber-50 text-amber-600'}`}>
                      <Icon icon={isPaid ? 'lucide:arrow-up-right' : 'lucide:clock'} className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-[#062F26] mb-0.5 group-hover:text-brand-teal transition-colors">{p.title}</span>
                      <span className="text-[11px] font-medium text-slate-500 mb-1">{categoryLabel(p)} • {p.room}</span>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400 mt-1">
                        <span className="font-bold text-[#062F26]">{formatCurrency(p.amount)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:calendar" className="w-3 h-3" />
                          {isPaid ? `Paid on ${formatDate(p.paidAt || p.dueDate)}` : `Due on ${formatDate(p.dueDate)}`}
                        </span>
                        {p.paymentMethod && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                            <span className="bg-slate-50 px-1.5 py-0.5 rounded text-[9px] sm:bg-transparent sm:px-0 sm:py-0 sm:text-[11px]">{p.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    {getStatusBadge(p.status)}
                    <div className="flex items-center gap-2 ml-4">
                      {isPaid ? (
                        <button
                          onClick={() => handleDownloadReceipt(p)}
                          className="w-9 h-9 cursor-pointer rounded-lg bg-slate-100 text-slate-500 group-hover:bg-brand-teal group-hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-brand-teal/20"
                          title="Download Receipt"
                        >
                          <Icon icon="lucide:download" className="w-4.5 h-4.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePay(p)}
                          className="px-4 py-2 cursor-pointer rounded-lg bg-[#062F26] text-white text-xs font-bold hover:bg-brand-teal transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Icon icon="lucide:credit-card" className="w-4 h-4" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Make Payment Button */}
      <div className="mt-2 sm:mt-4 flex justify-end shrink-0">
        <button onClick={() => (nextDue ? handlePay(nextDue) : navigate('/tenant/bookings'))} className="w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-[#062F26] text-white font-bold text-sm rounded-xl hover:bg-brand-teal transition-colors shadow-sm flex items-center justify-center gap-2">
          <Icon icon="lucide:credit-card" className="w-4 h-4" />
          Make a Payment
        </button>
      </div>

    </div>
  );
};

export default TenantTransactions;
