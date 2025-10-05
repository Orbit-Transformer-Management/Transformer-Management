import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
  /** how many page buttons to show at once (default 5) */
  maxVisible?: number;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
  maxVisible = 5,
}) => {
  // Clamp current page defensively
  const current = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

  const getPageNumbers = (): number[] => {
    if (totalPages <= 0) return [];
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // readjust start if we hit the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageNumbers();

  if (totalPages <= 1) {
    // Nothing to paginate
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center space-x-2 mt-6"
      aria-label="Pagination"
    >
      {/* Prev */}
      <button
        type="button"
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* First + leading dots */}
      {pages[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            className={`px-4 py-2 rounded-md text-sm font-semibold ${
              current === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
            aria-current={current === 1 ? "page" : undefined}
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-2">…</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map((num) => (
        <button
          type="button"
          key={num}
          onClick={() => onChange(num)}
          className={`px-4 py-2 rounded-md text-sm font-semibold ${
            current === num ? "bg-blue-600 text-white" : "hover:bg-gray-100"
          }`}
          aria-current={current === num ? "page" : undefined}
        >
          {num}
        </button>
      ))}

      {/* Trailing dots + last */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2">…</span>
          )}
          <button
            type="button"
            onClick={() => onChange(totalPages)}
            className={`px-4 py-2 rounded-md text-sm font-semibold ${
              current === totalPages
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
            aria-current={current === totalPages ? "page" : undefined}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        type="button"
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
