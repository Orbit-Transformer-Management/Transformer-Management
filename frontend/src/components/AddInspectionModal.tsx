import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
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

  return (
    <div
      className="fixed inset-0 z-50 transition-all duration-300"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex justify-center items-center min-h-screen p-4">
        <div
          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">New Inspection</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Branch */}
            <div>
              <label htmlFor="branch" className="block mb-2 font-semibold text-gray-700">Branch</label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
              >
                <option value="">Select Branch</option>
                <option value="Nugegoda">Nugegoda</option>
                <option value="Maharagama">Maharagama</option>
              </select>
            </div>

            {/* Inspection No */}
            <div>
              <label htmlFor="inspectionNo" className="block mb-2 font-semibold text-gray-700">Inspection No</label>
              <input
                type="text"
                id="inspectionNo"
                value={inspectionNo}
                onChange={(e) => setInspectionNo(e.target.value)}
                placeholder="Enter Inspection Number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
              />
            </div>

            {/* Transformer No */}
            <div>
              <label htmlFor="transformerNo" className="block mb-2 font-semibold text-gray-700">Transformer No</label>
              <input
                type="text"
                id="transformerNo"
                value={transformerNo}
                onChange={(e) => setTransformerNo(e.target.value)}
                placeholder="Enter Transformer Number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
              />
            </div>

            {/* Dates & Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Inspection Date</label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Inspection Time</label>
                <input
                  type="time"
                  value={inspectionTime}
                  onChange={(e) => setInspectionTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Maintenance Date</label>
                <input
                  type="date"
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Maintenance Time</label>
                <input
                  type="time"
                  value={maintenanceTime}
                  onChange={(e) => setMaintenanceTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block mb-2 font-semibold text-gray-700">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
