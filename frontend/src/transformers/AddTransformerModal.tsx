import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddTransformerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransformerModal: React.FC<AddTransformerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to submit form data
    console.log("Form Submitted");
    onClose(); 
  };

  return (
    // Backdrop with blur effect
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative"
        onClick={e => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Transformer</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-semibold" htmlFor="region">Region</label>
            <select 
              id="region" 
              className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Region</option>
              <option value="Nugegoda">Nugegoda</option>
              <option value="Maharagama">Maharagama</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-semibold" htmlFor="transformerNo">Transformer No</label>
            <input 
              type="text" 
              id="transformerNo" 
              placeholder="Transformer No"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
           <div>
            <label className="block text-gray-700 mb-2 font-semibold" htmlFor="poleNo">Pole No</label>
            <input 
              type="text" 
              id="poleNo" 
              placeholder="Pole No"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-semibold" htmlFor="type">Type</label>
             <select 
                id="type" 
                className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
                <option value="">Select Type</option>
                <option value="Bulk">Bulk</option>
                <option value="Distribution">Distribution</option>
            </select>
          </div>
          <div>
             <label className="block text-gray-700 mb-2 font-semibold" htmlFor="locationDetails">Location Details</label>
            <input 
              type="text"
              id="locationDetails" 
              placeholder="Location Details"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransformerModal;