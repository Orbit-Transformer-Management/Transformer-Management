import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

interface AddInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddInspectionModal: React.FC<AddInspectionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to submit form data
    console.log("Inspection Form Submitted");
    onClose(); 
  };

  return (
    // Backdrop with blur effect
    <div 
      className="fixed inset-0 z-50 transition-all duration-300"
      onClick={onClose}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="flex justify-center items-center min-h-screen p-4">
        {/* Modal Content */}
        <div 
          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative transform transition-all duration-300 scale-100"
          onClick={e => e.stopPropagation()} 
        >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">New Inspection</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-2 font-semibold" htmlFor="branch">Branch</label>
            <select 
              id="branch" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Select Branch</option>
              <option value="Nugegoda">Nugegoda</option>
              <option value="Maharagama">Maharagama</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-semibold" htmlFor="transformerNo">Transformer No</label>
            <input 
              type="text" 
              id="transformerNo" 
              placeholder="Enter Transformer Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="inspectionDate">Date of Inspection</label>
              <div className="relative">
                <input 
                  type="date" 
                  id="inspectionDate" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                />
                <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="inspectionTime">Time</label>
              <div className="relative">
                <input 
                  type="time" 
                  id="inspectionTime" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                />
                <Clock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Confirm
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddInspectionModal;