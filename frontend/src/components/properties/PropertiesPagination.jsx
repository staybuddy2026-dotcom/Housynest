import { Icon } from '@iconify/react';

const PropertiesPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // Hide if 1 page or empty

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center transition-colors shadow-sm ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}>
        <Icon icon="lucide:chevron-left" className="w-4 h-4" />
      </button>

      {pages.map(page => (
        <button 
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center shadow-sm transition-colors ${currentPage === page ? 'bg-[#062F26] text-white border border-transparent' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          {page}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center transition-colors shadow-sm ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}>
        <Icon icon="lucide:chevron-right" className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PropertiesPagination;
