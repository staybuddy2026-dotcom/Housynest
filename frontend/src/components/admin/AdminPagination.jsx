import { Icon } from '@iconify/react';

const AdminPagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, itemName = "items" }) => {
  if (totalItems === 0) return null;

  return (
    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 rounded-b-xl">
      <p className="text-xs font-semibold text-slate-500 text-center sm:text-left">
        Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} {itemName}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Icon icon="lucide:chevron-left" className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => onPageChange(index + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors cursor-pointer ${
                currentPage === index + 1
                  ? 'bg-[#062F26] text-white shadow-xs'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Icon icon="lucide:chevron-right" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
