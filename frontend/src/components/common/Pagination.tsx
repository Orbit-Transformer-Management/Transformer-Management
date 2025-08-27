import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onChange }) => {
  const maxVisible = 5; // how many pages to show at once

  // Generate page numbers
  const getPageNumbers = () => {
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <nav className="flex items-center justify-center space-x-2 mt-6">
      {/* Prev Button */}
      <button
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`px-4 py-2 rounded-md text-sm font-semibold ${
            page === num
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {num}
        </button>
      ))}

      {/* Dots + Last Page */}
      {page < totalPages - 2 && (
        <>
          <span className="px-2">...</span>
          <button
            onClick={() => onChange(totalPages)}
            className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
