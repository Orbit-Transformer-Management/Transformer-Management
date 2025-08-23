import React, { useState } from 'react';
import { X, Calendar, Clock, Building, FileText, Settings, CheckCircle, MapPin, Hash } from 'lucide-react';
import axios from 'axios';

interface AddInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess?: () => void; // Called after successful add
}

const AddInspectionModal: React.FC<AddInspectionModalProps> = ({ isOpen, onClose, onAddSuccess }) => {
  const [branch, setBranch] = useState('');
  const [inspectionNo, setInspectionNo] = useState('');
  const [transformerNo, setTransformerNo] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceTime, setMaintenanceTime] = useState('');
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      inspectionNumber: inspectionNo,
      transformerNumber: transformerNo,
      inspectionDate,
      inspectionTime,
      branch,
      maintenanceDate,
      maintenanceTime,
      status,
      };

    try {
      const res = await axios.post('http://localhost:8080/api/v1/inspections', payload);
      console.log('API Response:', res.data);

      if (onAddSuccess) onAddSuccess(); // Refresh table in parent
      onClose(); // Close modal

      // Clear form fields after success
      setBranch('');
      setInspectionNo('');
      setTransformerNo('');
      setInspectionDate('');
      setInspectionTime('');
      setMaintenanceDate('');
      setMaintenanceTime('');
      setStatus('');

    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to add inspection. Check console.');
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'Completed': return '✅';
      case 'In Progress': return '⏳';
      case 'Pending': return '⌛';
      default: return '📊';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      onClick={onClose}
      style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(12px)'
      }}
    >
      <div className="flex justify-center items-center min-h-screen p-4 w-full">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden transform transition-all duration-300 hover:shadow-3xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}
        >
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Inspection</h2>
                  <p className="text-blue-100 text-sm mt-1">Fill in the details below to add a new inspection record</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-110"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
          </div>

          {/* Enhanced Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Branch & Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="branch" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                    <MapPin size={16} className="mr-2 text-blue-500" />
                    Branch Location
                  </label>
                  <select
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-sm"
                  >
                    <option value="">🏢 Select Branch</option>
                    <option value="Nugegoda">🌆 Nugegoda</option>
                    <option value="Maharagama">🏙️ Maharagama</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                    Inspection Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-gray-300 hover:shadow-sm"
                  >
                    <option value="">📊 Select Status</option>
                    <option value="Pending">⌛ Pending</option>
                    <option value="Completed">✅ Completed</option>
                    <option value="In Progress">⏳ In Progress</option>
                  </select>
                </div>
              </div>

              {/* Inspection & Transformer Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="inspectionNo" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                    <Hash size={16} className="mr-2 text-purple-500" />
                    Inspection Number
                  </label>
                  <input
                    type="text"
                    id="inspectionNo"
                    value={inspectionNo}
                    onChange={(e) => setInspectionNo(e.target.value)}
                    placeholder="Enter unique inspection ID"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 hover:border-gray-300 hover:shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="transformerNo" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                    <Settings size={16} className="mr-2 text-orange-500" />
                    Transformer Number
                  </label>
                  <input
                    type="text"
                    id="transformerNo"
                    value={transformerNo}
                    onChange={(e) => setTransformerNo(e.target.value)}
                    placeholder="Enter transformer ID"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 hover:border-gray-300 hover:shadow-sm"
                  />
                </div>
              </div>

              {/* Inspection Date & Time Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                  <Calendar size={20} className="mr-2 text-blue-600" />
                  Inspection Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Calendar size={14} className="mr-2 text-blue-500" />
                      Inspection Date
                    </label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Clock size={14} className="mr-2 text-blue-500" />
                      Inspection Time
                    </label>
                    <input
                      type="time"
                      value={inspectionTime}
                      onChange={(e) => setInspectionTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Date & Time Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                  <Settings size={20} className="mr-2 text-green-600" />
                  Maintenance Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Calendar size={14} className="mr-2 text-green-500" />
                      Maintenance Date
                    </label>
                    <input
                      type="date"
                      value={maintenanceDate}
                      onChange={(e) => setMaintenanceDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Clock size={14} className="mr-2 text-green-500" />
                      Maintenance Time
                    </label>
                    <input
                      type="time"
                      value={maintenanceTime}
                      onChange={(e) => setMaintenanceTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2"
                >
                  <CheckCircle size={18} />
                  <span>Create Inspection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AddInspectionModal;