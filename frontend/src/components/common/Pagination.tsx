import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = () => {
  return (
    <nav className="flex items-center justify-center space-x-2 mt-6">
      <button className="p-2 rounded-md hover:bg-gray-100">
        <ChevronLeft size={20} />
      </button>
      <button className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold">1</button>
      <button className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold">2</button>
      <button className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold">3</button>
      <button className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold">4</button>
      <button className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold">5</button>
      <button className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold">6</button>
      <span className="px-2">...</span>
      <button className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold">50</button>
      <button className="p-2 rounded-md hover:bg-gray-100">
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;