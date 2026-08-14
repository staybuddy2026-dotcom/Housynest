import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const DEFAULT_ITEMS = [
  'Main Door', 'Walls & Paint', 'Flooring', 'Windows', 'Electrical Fittings',
  'Bed & Mattress', 'Wardrobe', 'Bathroom Fixtures', 'Kitchen Platform'
];

const TabConditionReports = ({ propertyId }) => {
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reportType, setReportType] = useState('Move-In');
  const [reportItems, setReportItems] = useState(
    DEFAULT_ITEMS.map(name => ({ name, condition: 'Good', notes: '' }))
  );

  const fetchBookingsAndReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch Bookings for this property
      const bkgRes = await fetch('/api/bookings/owner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bkgRes.ok) {
        const allBookings = await bkgRes.json();
        const propBookings = allBookings.filter(b => b.propertyId?._id === propertyId && !['Rejected', 'Cancelled'].includes(b.status));
        setBookings(propBookings);
        
        // Fetch reports for each booking
        const reportsMap = {};
        for (let b of propBookings) {
          const repRes = await fetch(`/api/condition-reports/booking/${b._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (repRes.ok) {
            reportsMap[b._id] = await repRes.json();
          }
        }
        setReports(reportsMap);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load condition reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchBookingsAndReports();
    }
  }, [propertyId]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...reportItems];
    newItems[index][field] = value;
    setReportItems(newItems);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!selectedBooking) {
      toast.error('Please select a tenant booking');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/condition-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: selectedBooking,
          type: reportType,
          items: reportItems
        })
      });

      if (res.ok) {
        toast.success(`${reportType} Report created successfully`);
        setIsAdding(false);
        setReportItems(DEFAULT_ITEMS.map(name => ({ name, condition: 'Good', notes: '' })));
        setSelectedBooking(null);
        fetchBookingsAndReports();
      } else {
        toast.error('Failed to create report');
      }
    } catch (err) {
      toast.error('Error creating report');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Condition Reports</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#062F26] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-teal transition-colors"
        >
          <Icon icon={isAdding ? "lucide:x" : "lucide:plus"} className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'New Report'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateReport} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Tenant Booking</label>
              <select
                required
                value={selectedBooking || ''}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#062F26] outline-none"
              >
                <option value="">-- Select --</option>
                {bookings.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.tenantId?.fullName} ({b.roomDetails?.roomName || 'Property'}) - {b.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#062F26] outline-none"
              >
                <option>Move-In</option>
                <option>Move-Out</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 border-b pb-2">Checklist Items</h4>
            <div className="space-y-3">
              {reportItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={item.condition}
                      onChange={(e) => handleItemChange(idx, 'condition', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded text-sm"
                    >
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>Poor</option>
                      <option>Damaged</option>
                    </select>
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Notes / Remarks"
                      value={item.notes}
                      onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setReportItems([...reportItems, { name: 'New Item', condition: 'Good', notes: '' }])}
              className="mt-3 text-sm text-brand-teal font-bold hover:underline"
            >
              + Add Custom Item
            </button>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#062F26] transition-colors">
              Save Report
            </button>
          </div>
        </form>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
            No bookings found for this property.
          </div>
        ) : (
          bookings.map(booking => {
            const bookingReports = reports[booking._id] || [];
            if (bookingReports.length === 0) return null;

            return (
              <div key={booking._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b pb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:user" className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{booking.tenantId?.fullName}</p>
                    <p className="text-xs text-slate-500">{booking.roomDetails?.roomName ? `Room: ${booking.roomDetails.roomName}` : 'Property Booking'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookingReports.map(rep => (
                    <div key={rep._id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${rep.type === 'Move-In' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {rep.type}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{new Date(rep.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-0.5 border border-slate-200 bg-white text-slate-600 text-[10px] rounded">
                          {rep.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {rep.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-slate-600">{item.name}</span>
                            <span className={`font-bold ${item.condition === 'Damaged' || item.condition === 'Poor' ? 'text-red-500' : 'text-emerald-600'}`}>{item.condition}</span>
                          </div>
                        ))}
                        {rep.items.length > 3 && (
                          <div className="text-xs text-center text-slate-400 pt-2 border-t mt-2">
                            +{rep.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TabConditionReports;
