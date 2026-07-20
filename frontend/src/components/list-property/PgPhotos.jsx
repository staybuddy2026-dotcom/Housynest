import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useFormContext } from 'react-hook-form';

const PgPhotos = ({ onNext, onPrev }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();

  const fileInputRef = useRef(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUspInput, setShowUspInput] = useState(false);
  const [newUsp, setNewUsp] = useState('');

  const usps = watch('usps') || [];
  const customUsps = watch('customUsps') || [];
  const uploadedImages = watch('photos') || [];

  const handleUpdate = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const removeImage = (id) => {
    const updatedImages = uploadedImages.filter(i => i.id !== id);
    const img = uploadedImages.find(i => i.id === id);
    if (img && img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }
    handleUpdate('photos', updatedImages);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 30) {
      alert("You can only upload a maximum of 30 images.");
      return;
    }

    const newImages = Array.from(files).map(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds the 5MB limit.`);
        return null;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(`${file.name} is not a supported format.`);
        return null;
      }

      return {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        label: file.name.split('.')[0].substring(0, 15),
        file: file
      };
    }).filter(Boolean);

    handleUpdate('photos', [...uploadedImages, ...newImages]);
  };

  const onFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const _uploadedImages = [...uploadedImages];
    const draggedItemContent = _uploadedImages.splice(dragItem.current, 1)[0];
    _uploadedImages.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    handleUpdate('photos', _uploadedImages);
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">

      <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-brand-teal hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth="2.5" />
          </button>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#062F26] mb-0.5 sm:mb-1">Photos & Videos</h2>
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Add photos and details to attract more tenants</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1">

        {/* USP Section */}
        <div>
          <h3 className="text-sm sm:text-sm font-bold text-[#062F26] mb-2 sm:mb-3">USP (Unique Selling Point)</h3>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            {['Prime Location', 'Modern Amenities', 'Hygienic Food', 'Safe & Secure', ...customUsps].map(usp => {
              const isSelected = usps.includes(usp);
              return (
                <button
                  key={usp}
                  type="button"
                  onClick={() => {
                    const newUsps = isSelected ? usps.filter(u => u !== usp) : [...usps, usp];
                    handleUpdate('usps', newUsps);
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${isSelected
                    ? 'bg-[#EAF5F2] text-[#062F26] border border-brand-teal/50 shadow-sm'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:text-slate-700'
                    }`}
                >
                  {isSelected && <Icon icon="lucide:check" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal" strokeWidth="3" />}
                  {usp}
                </button>
              );
            })}

            {showUspInput ? (
              <div
                className="flex items-center bg-white border border-brand-teal rounded-full overflow-hidden shadow-sm shadow-brand-teal/10 animate-fade-in-up"
              >
                <input
                  type="text"
                  value={newUsp}
                  onChange={(e) => setNewUsp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newUsp.trim()) {
                        handleUpdate('customUsps', [...customUsps, newUsp.trim()]);
                        handleUpdate('usps', [...usps, newUsp.trim()]);
                        setNewUsp('');
                        setShowUspInput(false);
                      }
                    }
                  }}
                  placeholder="e.g. Near Metro"
                  autoFocus
                  className="w-28 sm:w-36 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#062F26] border-none focus:outline-none focus:ring-0 bg-transparent placeholder:text-slate-400 placeholder:font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newUsp.trim()) {
                      handleUpdate('customUsps', [...customUsps, newUsp.trim()]);
                      handleUpdate('usps', [...usps, newUsp.trim()]);
                      setNewUsp('');
                      setShowUspInput(false);
                    }
                  }}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#EAF5F2] text-brand-teal font-bold text-xs sm:text-xs hover:bg-brand-teal hover:text-white transition-colors"
                >
                  Add
                </button>
                <button type="button" onClick={() => setShowUspInput(false)} className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-400 hover:text-red-500 bg-white border-l border-slate-100 transition-colors">
                  <Icon icon="lucide:x" className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth="2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowUspInput(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 hover:border-brand-teal hover:text-brand-teal hover:bg-[#EAF5F2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shadow-sm"
              >
                <Icon icon="lucide:plus" className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth="2.5" />
              </button>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-slate-500">Example: Prime location, Near Metro, 24x7 Security, Great Food, etc.</p>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm sm:text-sm font-bold text-[#062F26] mb-1">Property Description</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3">Write a brief description of your property</p>
          <textarea
            {...register('description')}
            placeholder="Enter Description"
            rows="5"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal resize-none mb-3"
          ></textarea>
        </div>

        {/* Photos */}
        <div>
          <h3 className="text-sm sm:text-sm font-bold text-[#062F26] mb-1">Property Images</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 mb-4 sm:mb-5">Upload clear and high-quality images of your property. You can add up to 30 images.</p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-5 sm:py-6 rounded-2xl border-2 border-dashed transition-all mb-4 sm:mb-6 cursor-pointer flex flex-col items-center justify-center gap-2 ${isDragging ? 'border-brand-teal bg-[#EAF5F2]/50' : 'border-slate-200 bg-slate-50 hover:border-brand-teal/30 hover:bg-[#EAF5F2]/30'
              }`}
          >
            <div className="text-slate-600">
              <Icon icon="lucide:cloud-upload" className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth="1.5" />
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-[15px] font-bold text-[#062F26]">Drag & drop images here</p>
              <p className="text-xs sm:text-xs text-slate-500 my-1 sm:my-2">or</p>
              <button type="button" className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#062F26] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-brand-teal transition-colors">
                Upload Images
              </button>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-2">JPG, PNG or WebP (Max. 5MB per image)</p>
          </div>

          <div className="bg-[#EAF5F2] rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Icon icon="lucide:lightbulb" className="text-brand-teal shrink-0 mt-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <p className="text-xs sm:text-sm font-semibold text-brand-teal">Tip: Use well-lit, clear and real images to get more visibility and trust.</p>
          </div>

          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-xs sm:text-sm font-bold text-[#062F26]">Image Preview ({uploadedImages.length}/30)</h4>
            <button type="button" className="text-xs sm:text-xs font-bold text-slate-600 hover:text-brand-teal transition-colors">Reorder Images</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {uploadedImages.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => dragItem.current = idx}
                onDragEnter={() => dragOverItem.current = idx}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="relative rounded-xl border border-slate-200 bg-white overflow-hidden group flex flex-col hover:border-brand-teal/50 transition-colors"
              >
                <div className="relative h-28 sm:h-32 w-full overflow-hidden">
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md">
                    <span className="text-[9px] sm:text-[10px] font-bold text-white">{idx + 1}</span>
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-600 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Icon icon="lucide:x" className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth="3" />
                  </button>
                </div>
                <div className="p-2 sm:p-3 flex items-center gap-1.5 sm:gap-2 border-t border-slate-100 bg-white">
                  <Icon icon="lucide:grip-vertical" className="text-slate-400 cursor-move shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    type="text"
                    value={img.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      handleUpdate('photos', uploadedImages.map(i => i.id === img.id ? { ...i, label: newLabel } : i));
                    }}
                    className="w-full text-xs sm:text-xs font-bold text-[#062F26] bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    placeholder="Enter label..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 360 Virtual Tour */}
        <div>
          <h3 className="text-sm sm:text-sm font-bold text-[#062F26] mb-1">360° Virtual Tour</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3">Add a 360° virtual tour link for better property showcase</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-xs font-bold text-slate-600">360° View URL</label>
            <input
              type="text"
              {...register('virtualTour')}
              placeholder="Enter 360° virtual tour link (e.g., Matterport, Google Street View)"
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border ${errors.virtualTour ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm sm:text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all placeholder:font-normal placeholder:text-slate-400`}
            />
            {errors.virtualTour && <span className="text-red-500 text-[10px] sm:text-xs">{errors.virtualTour.message}</span>}
          </div>
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-[#062F26] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-brand-teal/20 text-center"
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default PgPhotos;
