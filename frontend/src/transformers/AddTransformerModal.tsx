import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddTransformerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransformerModal: React.FC<AddTransformerModalProps> = ({ isOpen, onClose }) => {
  const [region, setRegion] = useState("");
  const [transformerNo, setTransformerNo] = useState("");
  const [poleNo, setPoleNo] = useState("");
  const [type, setType] = useState("");
  const [locationDetails, setLocationDetails] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      region,
      transformerNo,
      poleNo,
      type,
      locationDetails,
    };

    console.log("Form Submitted:", formData);
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
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Transformer</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Region */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="region">Region</label>
              <select 
                id="region" 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Region</option>
                <option value="Nugegoda">Nugegoda</option>
                <option value="Maharagama">Maharagama</option>
              </select>
            </div>

            {/* Transformer No */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="transformerNo">Transformer No</label>
              <input 
                type="text" 
                id="transformerNo" 
                value={transformerNo}
                onChange={(e) => setTransformerNo(e.target.value)}
                placeholder="Enter Transformer Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              />
            </div>

            {/* Pole No */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="poleNo">Pole No</label>
              <input 
                type="text" 
                id="poleNo" 
                value={poleNo}
                onChange={(e) => setPoleNo(e.target.value)}
                placeholder="Enter Pole Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="type">Type</label>
              <select 
                id="type" 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Type</option>
                <option value="Bulk">Bulk</option>
                <option value="Distribution">Distribution</option>
              </select>
            </div>

            {/* Location Details */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="locationDetails">Location Details</label>
              <input 
                type="text"
                id="locationDetails"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="Enter Location Details"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Buttons */}
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

export default AddTransformerModal;
