import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const EditPropertyForm = ({ propertyId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    status: 'Active',
    pgName: '',
    propertyCategory: '',
    monthlyRent: '',
    securityAmount: '',
    maintenanceCharges: '',
    description: '',
    bhkType: '',
    availableFromType: 'Immediately',
    availableDate: '',
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data);
          setFormData({
            status: data.status || 'Pending',
            pgName: data.pgName || '',
            propertyCategory: data.propertyCategory || '',
            monthlyRent: data.monthlyRent || (data.rooms?.[0]?.rentPerBed || ''),
            securityAmount: data.securityAmount || (data.rooms?.[0]?.depositPerBed || ''),
            maintenanceCharges: data.maintenanceCharges || '',
            description: data.description || '',
            bhkType: data.bhkType || '',
            availableFromType: data.availableFromType || 'Immediately',
            availableDate: data.availableDate ? new Date(data.availableDate).toISOString().split('T')[0] : '',
          });
        } else {
          toast.error('Failed to load property details');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');

      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      if (property.propertyType === 'PG' && formData.monthlyRent) {
        if (property.rooms && property.rooms.length > 0) {
          const updatedRooms = [...property.rooms];
          updatedRooms[0].rentPerBed = formData.monthlyRent;
          updatedRooms[0].depositPerBed = formData.securityAmount;
          submitData.append('rooms', JSON.stringify(updatedRooms));
        }
      }

      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (res.ok) {
        toast.success('Property updated successfully!');
        onSuccess();
      } else {
        const errorData = await res.json();
        toast.error(`Update failed: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Icon icon="lucide:loader-2" className="w-8 h-8 text-brand-teal animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading property details...</p>
      </div>
    );
  }

  const isPg = property?.propertyType === 'PG';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#062F26] flex items-center gap-2">
            <Icon icon="lucide:pencil-line" className="w-6 h-6 text-brand-teal" />
            Edit Property
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Update the core details of your listing
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Icon icon="lucide:x" className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <label className="block text-sm font-bold text-slate-700 mb-2">Listing Status</label>
          <div className="relative w-full sm:w-1/2">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white cursor-pointer hover:border-slate-300 shadow-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending (Under Review)</option>
              <option value="Sold/Rented">Sold / Rented</option>
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Changing the status to Inactive will hide it from search results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Property Title</label>
            <input
              type="text"
              name={isPg ? "pgName" : "propertyCategory"}
              value={isPg ? formData.pgName : formData.propertyCategory}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
              required
            />
          </div>

          {!isPg && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">BHK Type</label>
              <div className="relative">
                <select
                  name="bhkType"
                  value={formData.bhkType}
                  onChange={handleChange}
                  className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white cursor-pointer hover:border-slate-300 shadow-sm"
                >
                  <option value="">Select BHK</option>
                  <option value="1 RK">1 RK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4+ BHK">4+ BHK</option>
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">
              {isPg ? 'Rent / Month (Per Bed)' : 'Monthly Rent (₹)'}
            </label>
            <input
              type="number"
              name="monthlyRent"
              value={formData.monthlyRent}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Security Deposit (₹)</label>
            <input
              type="number"
              name="securityAmount"
              value={formData.securityAmount}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Maintenance Charges (Optional)</label>
            <input
              type="number"
              name="maintenanceCharges"
              value={formData.maintenanceCharges}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Available From</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <select
                  name="availableFromType"
                  value={formData.availableFromType}
                  onChange={handleChange}
                  className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white cursor-pointer hover:border-slate-300 shadow-sm"
                >
                  <option value="Immediately">Immediately</option>
                  <option value="Select Date">Select Date</option>
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {formData.availableFromType === 'Select Date' && (
                <input
                  type="date"
                  name="availableDate"
                  value={formData.availableDate}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
                  required
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Property Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="px-4 py-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all resize-none"
            placeholder="Provide a detailed description of your property..."
          />
        </div>

        <div className="flex items-center justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-brand-teal text-white text-sm font-bold hover:bg-[#062F26] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Icon icon="lucide:save" className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPropertyForm;
