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

  // Fill form when transformerToEdit changes (UI-only change; logic untouched)
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

    // Primary key is in the URL, payload excludes transformerNumber
    const updatedPayload = {
      region,
      poleNumber: poleNo,
      type,
      locationDetails
    };

    try {
      const res = await axios.patch(
        `http://localhost:8080/api/v1/transformers/${transformerToEdit.transformerNumber}`,
        updatedPayload
      );
      console.log("Update Response:", res.data);

      if (onEditSuccess) onEditSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating transformer:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-200"
      onClick={onClose}
    >
      <div className="flex justify-center items-center w-full">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — gray theme */}
          <div className="bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gray-700 rounded-lg">
                  <Zap size={20} className="text-gray-100" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Edit Transformer</h2>
                  <p className="text-gray-300 text-sm">Update transformer information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Region & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Globe size={16} className="mr-2 text-gray-500" />
                    Regional Zone
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    required
                  >
                    <option value="">Select Regional Zone</option>
                    <option value="Nugegoda">Nugegoda District</option>
                    <option value="Maharagama">Maharagama District</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Cpu size={16} className="mr-2 text-gray-500" />
                    Transformer Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    required
                  >
                    <option value="">Select Transformer Type</option>
                    <option value="Bulk">Bulk Transformer</option>
                    <option value="Distribution">Distribution Transformer</option>
                  </select>
                </div>
              </div>

              {/* Equipment Identification */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <h3 className="flex items-center text-base font-semibold text-gray-900 mb-4">
                  <Hash size={18} className="mr-2 text-gray-700" />
                  Equipment Identification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Settings size={14} className="mr-2 text-gray-600" />
                      Transformer Number (Read-only)
                    </label>
                    <input
                      type="text"
                      value={transformerNo}
                      readOnly
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 placeholder-gray-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={14} className="mr-2 text-gray-600" />
                      Pole Number
                    </label>
                    <input
                      type="text"
                      value={poleNo}
                      onChange={(e) => setPoleNo(e.target.value)}
                      placeholder="Enter pole identification"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="flex items-center text-base font-semibold text-gray-900 mb-3">
                  <Building size={18} className="mr-2 text-gray-700" />
                  Location Information
                </h3>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Detailed Location Address
                  </label>
                  <textarea
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    placeholder="Enter complete location details, landmarks, and access information..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Include nearby landmarks, street names, and accessibility details.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2"
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
