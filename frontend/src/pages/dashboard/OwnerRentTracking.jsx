import React, { useState, useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/list-property/CustomDropdown';
import { jsPDF } from "jspdf";

const OwnerRentTracking = () => {
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTenantHistory, setSelectedTenantHistory] = useState(null);

  const [filterProperty, setFilterProperty] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const uniqueMonths = Array.from(new Set([
    ...invoices.map(i => new Date(i.billingPeriodStart).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })),
    ...bookings.map(b => new Date(b.moveInDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))
  ])).filter(x => x !== 'Invalid Date').sort((a, b) => new Date(b) - new Date(a));
  const uniqueProperties = Array.from(new Set(
    bookings.map(b => b.propertyId?.societyName || b.propertyId?.pgName || b.propertyId?.propertyCategory).filter(Boolean)
  )).sort();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [invRes, bookRes] = await Promise.all([
        fetch('/api/invoices/owner', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/bookings/owner', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (invRes.ok && bookRes.ok) {
        const invData = await invRes.json();
        const bookData = await bookRes.json();
        setInvoices(invData);
        setBookings(bookData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (tx) => {
    toast.loading('Generating receipt...', { id: 'receipt' });
    try {
      const doc = new jsPDF();
      
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
      
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 12, 40, 12);
      } else {
        doc.setFontSize(22);
        doc.setTextColor(10, 168, 125);
        doc.setFont('helvetica', 'bold');
        doc.text('Housynest', 14, 20);
      }
      
      doc.setFontSize(16);
      doc.setTextColor(10, 168, 125);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT RECEIPT', 105, 22, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`Receipt #${tx._id?.substring(0, 8).toUpperCase()}`, 196, 20, { align: 'right' });
      doc.setFontSize(10);
      doc.text(`Date: ${new Date(tx.paidAt || tx.updatedAt || Date.now()).toLocaleDateString('en-GB')}`, 196, 26, { align: 'right' });
      
      doc.setDrawColor(230, 230, 230);
      doc.line(14, 32, 196, 32);
      
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('PAID TO', 14, 42);
      doc.text('BILLED TO', 196, 42, { align: 'right' });
      
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      const propertyName = selectedTenantHistory?.tenant?.propertyId?.societyName || selectedTenantHistory?.tenant?.propertyId?.pgName || 'Property Owner';
      doc.text(propertyName, 14, 48);
      
      doc.text(selectedTenantHistory?.tenant?.tenantId?.fullName || 'Tenant', 196, 48, { align: 'right' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      let roomStr = 'Entire Property';
      if (tx.bookingId?.roomDetails) {
        const rName = tx.bookingId.roomDetails.roomName || '';
        roomStr = rName.toLowerCase().includes('room') ? rName : `Room ${rName}`;
        if (tx.bookingId.roomDetails.bedName) {
           roomStr += `, ${tx.bookingId.roomDetails.bedName}`;
        }
      }
      
      doc.text(roomStr, 14, 54);
      doc.text(selectedTenantHistory?.tenant?.tenantId?.email || 'N/A', 196, 54, { align: 'right' });
      doc.text(`Booking ID: BKG-${(tx.bookingId?.bookingId || tx.bookingId?._id || tx._id)?.substring(0, 8).toUpperCase()}`, 196, 60, { align: 'right' });
      
      // Table Header
      const startY = 70;
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY, 182, 10, 'FD');
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("Description", 20, startY + 7);
      doc.text("Amount", 188, startY + 7, { align: 'right' });
      
      // Table Content
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");
      
      let currentY = startY + 10;
      
      let finalRentAmt = tx.bookingId?.roomDetails?.rent || tx.bookingId?.roomDetails?.rentAmount || tx.bookingId?.paymentDetails?.rentAmount || 0;
      
      if (!finalRentAmt) {
        if (tx.propertyId?.monthlyRent) {
          finalRentAmt = Number(String(tx.propertyId.monthlyRent).replace(/\D/g, ''));
        } else if (tx.propertyId?.price) {
          finalRentAmt = Number(String(tx.propertyId.price).replace(/\D/g, ''));
        } else if (tx.amount > 1000) {
          const possibleRent = (tx.amount - 800) / 2;
          if (possibleRent > 0) finalRentAmt = possibleRent;
        }
      }

      if (!finalRentAmt || finalRentAmt === 0) {
        finalRentAmt = tx.amount; 
      }

      let stamp = 0;
      let secDep = 0;
      let isMoveIn = false;

      if (finalRentAmt > 0 && tx.amount >= finalRentAmt + 800) {
        isMoveIn = true;
        stamp = 800;
        secDep = tx.amount - finalRentAmt - stamp;
      }
      
      const formatDt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      const periodStr = tx.billingPeriodStart && tx.billingPeriodEnd ? ` (${formatDt(tx.billingPeriodStart)} - ${formatDt(tx.billingPeriodEnd)})` : '';
      
      if (isMoveIn) {
        const items = [
          { label: `Rent${periodStr}`, amount: finalRentAmt },
          { label: 'Security Deposit', amount: secDep > 0 ? secDep : 0 }
        ];
        if (stamp > 0) items.push({ label: 'Extra Charges (Stamp & Agreement)', amount: stamp });
        
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
      doc.text(`Rs. ${tx.amount?.toLocaleString('en-IN')}`, 188, finalY + 11, { align: 'right' });

      // Add Watermark (center) over everything so it's not clipped
      if (logoBase64) {
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        doc.addImage(logoBase64, 'PNG', 45, 130, 120, 36);
        doc.setGState(new doc.GState({ opacity: 1.0 }));
      }
      
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text('This is a computer generated receipt and does not require a physical signature.', 105, 270, { align: 'center' });
      
      doc.save(`Receipt_${tx._id?.substring(0, 8) || 'Rent'}.pdf`);
      toast.success('Receipt downloaded!', { id: 'receipt' });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt.', { id: 'receipt' });
    }
  };

  const handleSendReminder = async (invoiceId) => {
    setProcessingId(invoiceId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/invoices/${invoiceId}/remind`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Reminder sent to tenant successfully');
      } else {
        toast.error('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Error sending reminder');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewHistory = (bookingId) => {
    // Find all invoices for this booking
    const tenantInvoices = invoices.filter(i =>
      (i.bookingId === bookingId || (i.bookingId && i.bookingId._id === bookingId))
    );
    tenantInvoices.sort((x, y) => new Date(y.dueDate) - new Date(x.dueDate));

    // Get tenant info
    const tenant = mappedTenants.find(t => t.bookingId._id === bookingId);

    setSelectedTenantHistory({
      tenant: tenant,
      invoices: tenantInvoices
    });
    setHistoryModalOpen(true);
  };

  const mappedTenants = bookings.filter(b => {
    return b.status === 'Confirmed' || b.status === 'Reserved' || b.status === 'Active' || b.status === 'Moved Out';
  }).map(b => {
    const tenantName = b.tenantId?.fullName || (b.personalInfo?.firstName ? b.personalInfo.firstName + ' ' + (b.personalInfo.lastName || '') : 'Unknown');
    const propertyName = b.propertyId?.societyName || b.propertyId?.pgName || b.propertyId?.propertyCategory || 'Property';

    // Find all invoices for this booking
    const bookingInvoices = invoices.filter(i => i.bookingId === b._id || (i.bookingId && i.bookingId._id === b._id));
    bookingInvoices.sort((x, y) => new Date(y.dueDate) - new Date(x.dueDate));

    // Identify unpaid invoice
    let activeInvoice = bookingInvoices.find(i => i.status === 'Pending' || i.status === 'Overdue');
    if (!activeInvoice) {
      activeInvoice = bookingInvoices.length > 0 ? bookingInvoices[0] : null;
    }

    let displayStatus = activeInvoice ? activeInvoice.status : 'Paid';
    let daysLate = 0;
    let dueDate = activeInvoice ? new Date(activeInvoice.dueDate) : new Date(b.moveInDate || new Date());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (displayStatus === 'Pending' && due < today) {
      displayStatus = 'Overdue';
    }

    if (displayStatus === 'Overdue') {
      daysLate = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Rent calculation
    let rentAmt = 0;
    const sharing = b.roomDetails?.sharingType || '';
    let baseType = 'Other';
    if (sharing.includes('Single')) baseType = 'Single';
    else if (sharing.includes('Double')) baseType = 'Double';
    else if (sharing.includes('Triple')) baseType = 'Triple';
    else if (sharing.includes('Four')) baseType = 'Four';

    const typeAC = `${baseType}_AC`;
    const typeNonAC = `${baseType}_NonAC`;

    if (b.propertyId?.propertyType === 'PG' && b.propertyId?.pgPricing) {
      if (b.propertyId.pgPricing[typeNonAC]?.rentPerBed) {
        rentAmt = Number(String(b.propertyId.pgPricing[typeNonAC].rentPerBed).replace(/\D/g, ''));
      } else if (b.propertyId.pgPricing[typeAC]?.rentPerBed) {
        rentAmt = Number(String(b.propertyId.pgPricing[typeAC].rentPerBed).replace(/\D/g, ''));
      }
    } else if (b.propertyId) {
      rentAmt = Number(String(b.propertyId.monthlyRent || '').replace(/\D/g, '') || 0);
    }

    if (rentAmt === 0 && activeInvoice) rentAmt = activeInvoice.amount;

    let cycleStart = activeInvoice ? activeInvoice.billingPeriodStart : b.moveInDate;
    let cycleEnd = activeInvoice ? activeInvoice.billingPeriodEnd : new Date(new Date(b.moveInDate).setMonth(new Date(b.moveInDate).getMonth() + 1));

    return {
      _id: activeInvoice ? activeInvoice._id : b._id,
      tenantId: b.tenantId || { fullName: tenantName, phone: b.personalInfo?.mobileNumber, email: b.personalInfo?.email },
      propertyId: b.propertyId,
      bookingId: b,
      rentAmt,
      displayStatus,
      daysLate,
      dueDate,
      billingPeriodStart: cycleStart,
      billingPeriodEnd: cycleEnd,
      status: activeInvoice ? activeInvoice.status : 'Paid',
      paidAt: activeInvoice ? activeInvoice.paidAt : b.paymentDetails?.paidAt,
      invoiceId: activeInvoice ? activeInvoice._id : null,
      payoutStatus: b.payoutStatus || 'Pending',
      isInitialPayment: !activeInvoice
    };
  }).filter(item => {
    const tName = item.tenantId?.fullName || '';
    const tPhone = item.tenantId?.phone || '';
    const tEmail = item.tenantId?.email || '';
    const pName = item.propertyId?.societyName || item.propertyId?.pgName || item.propertyId?.propertyCategory || '';

    const searchLower = searchQuery.toLowerCase();

    const matchesSearch = tName.toLowerCase().includes(searchLower) ||
      tPhone.toLowerCase().includes(searchLower) ||
      tEmail.toLowerCase().includes(searchLower) ||
      pName.toLowerCase().includes(searchLower);

    const matchesProperty = filterProperty === 'All' || pName === filterProperty;
    const matchesStatus = filterStatus === 'All' || item.displayStatus === filterStatus;

    let matchesMonth = true;
    if (filterMonth !== 'All') {
      const cycleStartString = new Date(item.billingPeriodStart).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      const cycleEndString = new Date(item.billingPeriodEnd).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      matchesMonth = (cycleStartString === filterMonth) || (cycleEndString === filterMonth);
    }

    return matchesSearch && matchesProperty && matchesStatus && matchesMonth;
  });

  const getStatusBadge = (status, inv = null) => {
    if (inv && inv.isInitialPayment && inv.payoutStatus === 'Pending' && status === 'Paid') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full shadow-sm hover:bg-indigo-100 transition-colors">
          <Icon icon="lucide:shield-alert" className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">In Escrow</span>
        </div>
      );
    }
    if (['Paid'].includes(status)) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm hover:bg-emerald-100 transition-colors">
          <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    } else if (['Pending'].includes(status)) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm hover:bg-amber-100 transition-colors">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    } else if (['Overdue'].includes(status)) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full shadow-sm hover:bg-rose-100 transition-colors">
          <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      );
    }
  };

  const stats = [
    { title: mappedTenants.length.toString(), subtitle: 'Total Tenants', desc: 'Active & Checked-in', icon: 'lucide:users', color: 'text-brand-teal', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: mappedTenants.filter(i => i.status === 'Pending' || i.status === 'Overdue').length.toString(), subtitle: 'Unpaid Rent', desc: 'Requires Action', icon: 'lucide:clock', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: `₹${mappedTenants.filter(i => i.status === 'Pending' || i.status === 'Overdue').reduce((acc, curr) => acc + (curr.rentAmt || 0), 0).toLocaleString('en-IN')}`, subtitle: 'Pending Amount', desc: 'To be collected', icon: 'lucide:indian-rupee', color: 'text-rose-500', bgColor: 'bg-rose-50', borderColor: 'border-rose-100', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
    { title: `₹${mappedTenants.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + (curr.rentAmt || 0), 0).toLocaleString('en-IN')}`, subtitle: 'Settled Rent', desc: 'Current Cycle', icon: 'lucide:wallet', color: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-200', chartPath: 'M0 30 Q 25 20, 40 5 T 70 10 T 100 0' },
  ];

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-100px)] min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full relative pb-24 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-300 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 shadow-sm">
            <Icon icon="lucide:indian-rupee" className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#062F26] mb-0.5 tracking-tight">Payouts</h1>
            <p className="text-sm text-slate-500 font-medium">Track recurring monthly rent payments across all your active tenants.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="relative overflow-hidden bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <h3 className="text-2xl font-bold text-[#062F26]">{stat.title}</h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${stat.bgColor} ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon icon={stat.icon} className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-base font-bold text-slate-800 group-hover:text-[#062F26] transition-colors">{stat.subtitle}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium group-hover:text-slate-500 transition-colors">{stat.desc}</p>
            </div>

            {/* Sparkline Chart Anchored to Bottom Right */}
            <div className="absolute right-0 bottom-0 w-32 h-14 opacity-40 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible drop-shadow-sm" preserveAspectRatio="none">
                <path
                  d={stat.chartPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={stat.color}
                />

                {/* Subtle gradient fill under the line */}
                <path
                  d={`${stat.chartPath} L 100 40 L 0 40 Z`}
                  fill="currentColor"
                  className={`${stat.color} opacity-10`}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/30 relative z-20">
          <div className="relative w-full xl:w-96 group shrink-0">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, email or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all shadow-sm h-[42px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto shrink-0">
            <div className="w-full sm:w-[180px] shrink-0">
              {/* Property Filter */}
              <CustomDropdown
                icon="lucide:building"
                value={filterProperty === 'All' ? 'All Properties' : filterProperty}
                options={[{ label: 'All Properties', value: 'All' }, ...uniqueProperties.map(p => ({ label: p, value: p }))]}
                onChange={setFilterProperty}
                buttonClassName="shadow-sm border-slate-200 !py-2.5 h-[42px] w-full"
                containerClassName="w-full"
              />
            </div>

            <div className="w-full sm:w-[160px] shrink-0">
              {/* Month Filter */}
              <CustomDropdown
                icon="lucide:calendar"
                value={filterMonth === 'All' ? 'All Months' : filterMonth}
                options={[{ label: 'All Months', value: 'All' }, ...uniqueMonths.map(m => ({ label: m, value: m }))]}
                onChange={setFilterMonth}
                buttonClassName="shadow-sm border-slate-200 !py-2.5 h-[42px] w-full"
                containerClassName="w-full"
              />
            </div>

            <div className="w-full sm:w-[160px] shrink-0">
              {/* Status Filter */}
              <CustomDropdown
                icon="lucide:activity"
                value={filterStatus === 'All' ? 'All Statuses' : filterStatus}
                options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Paid', value: 'Paid' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Overdue', value: 'Overdue' }
                ]}
                onChange={setFilterStatus}
                buttonClassName="shadow-sm border-slate-200 !py-2.5 h-[42px] w-full"
                containerClassName="w-full"
              />
            </div>
          </div>
        </div>

        {/* Responsive Content Container */}
        <div className="flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar bg-white min-h-0 relative flex flex-col md:block rounded-xl">

          {/* Mobile View (Cards) */}
          <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50/30">
            {mappedTenants.map((inv) => (
              <div key={inv._id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm shrink-0">
                      {inv.tenantId?.fullName ? inv.tenantId.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#062F26] text-sm truncate max-w-[150px]">{inv.tenantId?.fullName || 'Unknown'}</h3>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate max-w-[150px]">{inv.propertyId?.societyName || inv.propertyId?.pgName || inv.propertyId?.propertyCategory || 'Property'}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(inv.displayStatus, inv)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rent Due</p>
                    <p className="text-sm font-bold text-slate-700">₹ {inv.rentAmt?.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Due Date</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    {inv.displayStatus === 'Overdue' && (
                      <p className="text-[10px] font-bold text-red-500 mt-0.5">{inv.daysLate} {inv.daysLate === 1 ? 'Day' : 'Days'} Late</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <a href={`tel:${inv.tenantId?.phone || ''}`} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:phone" className="w-4 h-4" /></a>
                    <a href={`https://wa.me/${(inv.tenantId?.whatsappNumber || inv.tenantId?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><Icon icon="lucide:message-circle" className="w-4 h-4" /></a>
                    <a href={`mailto:${inv.tenantId?.email || ''}`} className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title={inv.tenantId?.email || 'Email'}><Icon icon="lucide:mail" className="w-4 h-4" /></a>
                    <button
                      onClick={() => handleViewHistory(inv.bookingId._id)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors shadow-sm"
                      title="View Payment History"
                    >
                      <Icon icon="lucide:history" className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.status !== 'Paid' && inv.invoiceId ? (
                      <button
                        onClick={() => handleSendReminder(inv.invoiceId)}
                        disabled={processingId === inv.invoiceId}
                        className="px-3 h-8 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {processingId === inv.invoiceId ? <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" /> : <><Icon icon="lucide:bell-ring" className="w-3.5 h-3.5" /> Remind</>}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" /> Paid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {mappedTenants.length === 0 && !loading && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                <Icon icon="lucide:search-x" className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No rent invoices found.</p>
              </div>
            )}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block w-full">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  {[
                    { label: 'Tenant', align: 'left' },
                    { label: 'Property / Bed', align: 'left' },
                    { label: 'Contact', align: 'center' },
                    { label: 'Rent Cycle', align: 'left' },
                    { label: 'Due Date', align: 'left' },
                    { label: 'Rent', align: 'left' },
                    { label: 'Status', align: 'left' },
                    { label: 'History', align: 'center' },
                    { label: 'Actions', align: 'right' }
                  ].map((col) => (
                    <th key={col.label} className={`py-4 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-${col.align}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mappedTenants.map((inv) => (
                  <tr key={inv._id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="py-2.5 px-5 align-middle">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#062F26] mb-1 truncate max-w-[120px] lg:max-w-[180px]" title={inv.tenantId?.fullName || 'Unknown'}>{inv.tenantId?.fullName || 'Unknown'}</p>
                        <p className="text-[11px] font-semibold text-slate-400 truncate max-w-[120px] lg:max-w-[180px]">{inv.tenantId?.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-5 align-middle">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate max-w-[150px] lg:max-w-[220px]" title={inv.propertyId?.societyName || inv.propertyId?.pgName || inv.propertyId?.propertyCategory || 'Property'}>{inv.propertyId?.societyName || inv.propertyId?.pgName || inv.propertyId?.propertyCategory || 'Property'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] font-medium text-slate-400 truncate max-w-[150px] lg:max-w-[220px]" title={inv.bookingId?.roomDetails?.roomName ? `${inv.bookingId.roomDetails.roomName} • ${inv.bookingId.roomDetails.bedName}` : 'Entire Property'}>{inv.bookingId?.roomDetails?.roomName ? `${inv.bookingId.roomDetails.roomName} • ${inv.bookingId.roomDetails.bedName}` : 'Entire Property'}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${inv.propertyId?.propertyType === 'PG' ? 'bg-purple-100 text-purple-700' : inv.propertyId?.propertyType === 'Tenant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                            {inv.propertyId?.propertyType || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-5 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <a href={`tel:${inv.tenantId?.phone || ''}`} className="relative group/icon w-7 h-7 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                          <Icon icon="lucide:phone" className="w-3.5 h-3.5" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#062F26] text-white text-[11px] font-bold rounded-md shadow-lg opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 border border-[#094738]">
                            {inv.tenantId?.phone || 'N/A'}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-[#062F26]"></div>
                          </div>
                        </a>
                        <a href={`https://wa.me/${(inv.tenantId?.whatsappNumber || inv.tenantId?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="relative group/icon w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                          <Icon icon="lucide:message-circle" className="w-3.5 h-3.5" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#062F26] text-white text-[11px] font-bold rounded-md shadow-lg opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 border border-[#094738]">
                            {inv.tenantId?.whatsappNumber || inv.tenantId?.phone || 'N/A'}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-[#062F26]"></div>
                          </div>
                        </a>
                        <a href={`mailto:${inv.tenantId?.email || ''}`} className="relative group/icon w-7 h-7 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                          <Icon icon="lucide:mail" className="w-3.5 h-3.5" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#062F26] text-white text-[11px] font-bold rounded-md shadow-lg opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 border border-[#094738]">
                            {inv.tenantId?.email || 'N/A'}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-[#062F26]"></div>
                          </div>
                        </a>
                      </div>
                    </td>
                    <td className="py-2.5 px-5 align-middle">
                      <div className="text-[12px] font-semibold text-slate-600 flex items-center whitespace-nowrap">
                        <span className="truncate max-w-[80px]" title={new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}>{new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        <span className="mx-1 text-slate-400 shrink-0">-</span>
                        <span className="truncate max-w-[80px]" title={new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}>{new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-5 align-middle">
                      <div className="text-sm font-bold text-slate-700 truncate max-w-[100px]" title={new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}>{new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      {inv.displayStatus === 'Overdue' && (
                        <div className="text-[11px] font-bold text-red-500 mt-1">{inv.daysLate} {inv.daysLate === 1 ? 'Day' : 'Days'} Late</div>
                      )}
                    </td>
                    <td className="py-2.5 px-5 align-middle">
                      <div className="font-bold text-slate-800 text-sm truncate max-w-[100px]" title={`₹ ${inv.rentAmt?.toLocaleString()}`}>₹ {inv.rentAmt?.toLocaleString()}</div>
                    </td>
                    <td className="py-2.5 px-5 align-middle">
                      {getStatusBadge(inv.displayStatus, inv)}
                    </td>
                    <td className="py-2.5 px-5 align-middle text-center">
                      <button
                        onClick={() => handleViewHistory(inv.bookingId._id)}
                        className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors shadow-sm mx-auto"
                        title="View Payment History"
                      >
                        <Icon icon="lucide:history" className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-2.5 px-5 align-middle text-right">
                      <div className="flex items-center justify-end">
                        {inv.status !== 'Paid' && inv.invoiceId ? (
                          <button
                            onClick={() => handleSendReminder(inv.invoiceId)}
                            disabled={processingId === inv.invoiceId}
                            className="px-3.5 py-2 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {processingId === inv.invoiceId ? (
                              <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Icon icon="lucide:bell-ring" className="w-3.5 h-3.5" />
                                Send Reminder
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 justify-end">
                            <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                            {inv.paidAt ? `Paid on ${new Date(inv.paidAt).toLocaleDateString()}` : 'Paid'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {mappedTenants.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Icon icon="lucide:users" className="w-10 h-10 mb-3 text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">No active tenants found.</p>
                        <p className="text-xs text-slate-400 mt-1">Add tenants to start tracking their rent collection.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {historyModalOpen && selectedTenantHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-sm">
                  {selectedTenantHistory.tenant?.tenantId?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Payment History</h3>
                  <p className="text-xs font-medium text-slate-500">
                    {selectedTenantHistory.tenant?.tenantId?.fullName} • {selectedTenantHistory.tenant?.propertyId?.societyName || selectedTenantHistory.tenant?.propertyId?.pgName || 'Property'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-50/20 custom-scrollbar">
              {selectedTenantHistory.invoices.length > 0 ? (
                <div className="space-y-4">
                  {selectedTenantHistory.invoices.map((inv, idx) => (
                    <div key={inv._id || idx} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-slate-800">
                            {new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                          {getStatusBadge(inv.status)}
                        </div>
                        <p className="text-xs font-medium text-slate-500">
                          Due: {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {inv.paidAt && ` • Paid: ${new Date(inv.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-bold text-slate-800">
                            ₹ {inv.amount?.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {inv.paymentMethod || (inv.status === 'Paid' ? 'Online' : 'Not paid')}
                          </div>
                        </div>
                        {inv.status === 'Paid' && (
                          <button
                            onClick={() => handleDownloadReceipt(inv)}
                            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-teal hover:border-brand-teal hover:bg-brand-teal/5 transition-colors group"
                            title="Download Receipt"
                          >
                            <Icon icon="lucide:download" className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Icon icon="lucide:history" className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">No payment history found.</p>
                  <p className="text-xs mt-1 text-slate-400">Past invoices will appear here once generated.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRentTracking;
