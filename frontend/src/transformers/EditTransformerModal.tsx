import React, { useState, useEffect } from 'react';
import { X, Zap, MapPin, Hash, Settings, Building, CheckCircle, Cpu, Globe } from 'lucide-react';
import axios from "axios";

interface EditTransformerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformerToEdit: any; // Object containing transformer details
  onEditSuccess?: () => void; // Callback after successful update
}

const EditTransformerModal: React.FC<EditTransformerModalProps> = ({ isOpen, onClose, transformerToEdit, onEditSuccess }) => {
  const [region, setRegion] = useState("");
  const [transformerNo, setTransformerNo] = useState("");
  const [poleNo, setPoleNo] = useState("");
  const [type, setType] = useState("");
  const [locationDetails, setLocationDetails] = useState("");

  // Fill form when transformerToEdit changes
  useEffect(() => {
    if (transformerToEdit) {
      setRegion(transformerToEdit.region || "");
      setTransformerNo(transformerToEdit.transformerNumber || "");
      setPoleNo(transformerToEdit.poleNumber || "");
      setType(transformerToEdit.type || "");
      setLocationDetails(transformerToEdit.locationDetails || "");
    }
  }, [transformerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The payload doesn't need to include the transformerNumber,
    // as it's part of the URL. The backend should not allow changing the primary key.
    const updatedPayload = {
      region,
      poleNumber: poleNo,
      type,
      locationDetails
    };

    try {
      // --- THIS IS THE FIX ---
      // The URL now correctly uses `transformerToEdit.transformerNumber`
      // instead of the incorrect `transformerToEdit.id`.
      const res = await axios.patch(`http://localhost:8080/api/v1/transformers/${transformerToEdit.transformerNumber}`, updatedPayload);
      console.log("Update Response:", res.data);

      if (onEditSuccess) onEditSuccess(); // Refresh table
      onClose(); // Close modal
    } catch (err) {
      console.error("Error updating transformer:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div className="flex justify-center items-center min-h-screen p-4 w-full">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden transform transition-all duration-300 hover:shadow-3xl"
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-8 py-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <Zap size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">Edit Transformer</h2>
                  <p className="text-yellow-100 text-sm mt-1 font-medium">Update transformer information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
              >
                <X size={24} />
              </button>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-4 right-32 w-6 h-6 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-8 left-32 w-4 h-4 bg-white/40 rounded-full animate-pulse delay-100"></div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Globe size={16} className="text-blue-600" />
                    </div>
                    <span>Regional Zone</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 hover:border-gray-300 hover:shadow-md font-medium"
                    required
                  >
                    <option value="">🌍 Select Regional Zone</option>
                    <option value="Nugegoda">🏙️ Nugegoda District</option>
                    <option value="Maharagama">🌆 Maharagama District</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Cpu size={16} className="text-purple-600" />
                    </div>
                    <span>Transformer Type</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 transition-all duration-300 hover:border-gray-300 hover:shadow-md font-medium"
                    required
                  >
                    <option value="">⚡ Select Transformer Type</option>
                    <option value="Bulk">🏭 Bulk Transformer</option>
                    <option value="Distribution">🏘️ Distribution Transformer</option>
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="flex items-center text-lg font-bold text-gray-800 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Hash size={20} className="text-green-600" />
                  </div>
                  Equipment Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Settings size={14} className="mr-2 text-green-500" />
                      Transformer Number (Read-only)
                    </label>
                    <input
                      type="text"
                      value={transformerNo}
                      // This field should not be editable as it's the primary identifier
                      readOnly
                      className="w-full px-5 py-4 border-2 border-green-200 rounded-xl bg-gray-100 text-gray-500 placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <MapPin size={14} className="mr-2 text-green-500" />
                      Pole Number
                    </label>
                    <input
                      type="text"
                      value={poleNo}
                      onChange={(e) => setPoleNo(e.target.value)}
                      placeholder="Enter pole identification"
                      className="w-full px-5 py-4 border-2 border-green-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <MapPin size={20} className="text-orange-600" />
                  </div>
                  Location Information
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Building size={14} className="mr-2 text-orange-500" />
                    Detailed Location Address
                  </label>
                  <textarea
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    placeholder="Enter complete location details, landmarks, and access information..."
                    rows={3}
                    className="w-full px-5 py-4 border-2 border-orange-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200/50 transition-all duration-300 hover:shadow-sm font-medium resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">💡</span>
                    Include nearby landmarks, street names, and accessibility details
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-300 font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-gray-300 flex items-center space-x-2"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-amber-400 flex items-center space-x-2"
                >
                  <CheckCircle size={18} />
                  <span>Update Transformer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTransformerModal;
