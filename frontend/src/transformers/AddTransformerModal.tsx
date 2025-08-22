import React, { useState } from 'react';
import { X, Zap, MapPin, Hash, Settings, Building } from 'lucide-react';
import axios from "axios";

interface AddTransformerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess?: () => void; // Called after successful add
}

const AddTransformerModal: React.FC<AddTransformerModalProps> = ({ isOpen, onClose, onAddSuccess }) => {
  const [region, setRegion] = useState("");
  const [transformerNo, setTransformerNo] = useState("");
  const [poleNo, setPoleNo] = useState("");
  const [type, setType] = useState("");
  const [locationDetails, setLocationDetails] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transformerPayload = { 
        region, 
        transformerNumber: transformerNo, 
        poleNumber: poleNo, 
        type, 
        locationDetails 
      };


    try {
      const res = await axios.post("http://localhost:8080/api/v1/transformers", transformerPayload);
      console.log("API Response:", res.data);

      if (onAddSuccess) onAddSuccess(); // Refresh table
      onClose(); // close modal
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-8 pr-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Zap className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Add Transformer
              </h2>
            </div>
            <p className="text-gray-500 text-sm ml-14">Configure your new transformer details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Region */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-3 font-semibold text-sm">
                <Building size={16} className="text-blue-500" />
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                required
              >
                <option value="">Select Region</option>
                <option value="Nugegoda">Nugegoda</option>
                <option value="Maharagama">Maharagama</option>
              </select>
            </div>

            {/* Transformer No */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-3 font-semibold text-sm">
                <Hash size={16} className="text-green-500" />
                Transformer No
              </label>
              <input
                type="text"
                value={transformerNo}
                onChange={(e) => setTransformerNo(e.target.value)}
                placeholder="Enter Transformer Number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                required
              />
            </div>

            {/* Pole No */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-3 font-semibold text-sm">
                <MapPin size={16} className="text-orange-500" />
                Pole No
              </label>
              <input
                type="text"
                value={poleNo}
                onChange={(e) => setPoleNo(e.target.value)}
                placeholder="Enter Pole Number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-3 font-semibold text-sm">
                <Settings size={16} className="text-purple-500" />
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                required
              >
                <option value="">Select Type</option>
                <option value="Bulk">Bulk</option>
                <option value="Distribution">Distribution</option>
              </select>
            </div>

            {/* Location Details */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-3 font-semibold text-sm">
                <MapPin size={16} className="text-red-500" />
                Location Details
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="Enter Location Details"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
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
