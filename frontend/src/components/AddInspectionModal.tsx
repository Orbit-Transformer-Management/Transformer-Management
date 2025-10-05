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

      if (onAddSuccess) onAddSuccess();
      onClose();

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-200"
      onClick={onClose}
    >
      <div className="flex justify-center items-center w-full min-h-[50vh]">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gray-700 rounded-lg">
                  <FileText size={20} className="text-gray-100" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Create New Inspection</h2>
                  <p className="text-gray-300 text-sm">Fill the details to add a new record</p>
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

              {/* Branch & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="branch" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    Branch Location
                  </label>
                  <select
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  >
                    <option value="">Select Branch</option>
                    <option value="Nugegoda">Nugegoda</option>
                    <option value="Maharagama">Maharagama</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle size={16} className="mr-2 text-gray-500" />
                    Inspection Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="inspectionNo" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Hash size={16} className="mr-2 text-gray-500" />
                    Inspection Number
                  </label>
                  <input
                    type="text"
                    id="inspectionNo"
                    value={inspectionNo}
                    onChange={(e) => setInspectionNo(e.target.value)}
                    placeholder="Unique inspection ID"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="transformerNo" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Settings size={16} className="mr-2 text-gray-500" />
                    Transformer Number
                  </label>
                  <input
                    type="text"
                    id="transformerNo"
                    value={transformerNo}
                    onChange={(e) => setTransformerNo(e.target.value)}
                    placeholder="Transformer ID"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Inspection Schedule */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="flex items-center text-base font-semibold text-gray-800 mb-3">
                  <Calendar size={18} className="mr-2 text-gray-600" />
                  Inspection Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={14} className="mr-2 text-gray-500" />
                      Inspection Date
                    </label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Clock size={14} className="mr-2 text-gray-500" />
                      Inspection Time
                    </label>
                    <input
                      type="time"
                      value={inspectionTime}
                      onChange={(e) => setInspectionTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Schedule */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="flex items-center text-base font-semibold text-gray-800 mb-3">
                  <Settings size={18} className="mr-2 text-gray-600" />
                  Maintenance Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={14} className="mr-2 text-gray-500" />
                      Maintenance Date
                    </label>
                    <input
                      type="date"
                      value={maintenanceDate}
                      onChange={(e) => setMaintenanceDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Clock size={14} className="mr-2 text-gray-500" />
                      Maintenance Time
                    </label>
                    <input
                      type="time"
                      value={maintenanceTime}
                      onChange={(e) => setMaintenanceTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
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
