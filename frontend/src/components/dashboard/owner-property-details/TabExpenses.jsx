import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const TabExpenses = ({ propertyId }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Analytics
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const [formData, setFormData] = useState({
    category: 'Repairs',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchExpensesAndIncome = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch Expenses
      const expRes = await fetch(`/api/expenses/property/${propertyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let expData = [];
      if (expRes.ok) {
        expData = await expRes.json();
        setExpenses(expData);
      }

      // Fetch Income (Rent Invoices) - we can reuse booking/invoice data if it was specifically per property
      // For now, let's fetch bookings to calculate total paid rent for this property
      const bkgRes = await fetch(`/api/bookings/owner`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let totalInc = 0;
      if (bkgRes.ok) {
        const bookings = await bkgRes.json();
        const propBookings = bookings.filter(b => b.propertyId?._id === propertyId);
        // Simple income calculation from bookings' paymentDetails or rent logic
        // Ideally we fetch actual RentInvoices, but here we sum up booking payments as a baseline
        propBookings.forEach(b => {
          if (b.paymentDetails?.status === 'Paid') {
            totalInc += (b.paymentDetails.amount || 0);
          }
        });
      }

      const totalExp = expData.reduce((acc, curr) => acc + curr.amount, 0);
      
      setTotalExpenses(totalExp);
      setTotalIncome(totalInc); // Will need more advanced RentInvoice fetching for true ROI

    } catch (err) {
      console.error(err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchExpensesAndIncome();
    }
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId,
          ...formData
        })
      });

      if (res.ok) {
        toast.success('Expense added successfully');
        setIsAdding(false);
        setFormData({
          category: 'Repairs',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        fetchExpensesAndIncome();
      } else {
        toast.error('Failed to add expense');
      }
    } catch (err) {
      toast.error('Error adding expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Expense deleted');
        fetchExpensesAndIncome();
      }
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const netROI = totalIncome - totalExpenses;

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading financials...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Income (Est.)</p>
          <p className="text-2xl font-black text-emerald-600">₹{totalIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Expenses</p>
          <p className="text-2xl font-black text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className={`p-5 rounded-xl border shadow-sm ${netROI >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${netROI >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net ROI (Profit/Loss)</p>
          <p className={`text-2xl font-black ${netROI >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {netROI >= 0 ? '+' : '-'}₹{Math.abs(netROI).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Expense Log</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#062F26] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-teal transition-colors"
        >
          <Icon icon={isAdding ? "lucide:x" : "lucide:plus"} className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {/* Add Expense Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#062F26] outline-none"
            >
              <option>Repairs</option>
              <option>Taxes</option>
              <option>Utility</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#062F26] outline-none"
              placeholder="e.g. 1500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#062F26] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#062F26] outline-none"
              placeholder="e.g. Plumber for leakage"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#062F26] transition-colors">
              Save Expense
            </button>
          </div>
        </form>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500">No expenses recorded yet.</td>
              </tr>
            ) : (
              expenses.map(exp => (
                <tr key={exp._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{exp.description}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">-₹{exp.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Icon icon="lucide:trash-2" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabExpenses;
