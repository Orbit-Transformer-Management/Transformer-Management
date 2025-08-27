import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/common/PageLayout";
import { Star, ChevronLeft, Zap, MapPin, Eye, Edit, Trash2, AlertTriangle, X, Calendar, Activity, Plus } from "lucide-react";
import AddInspectionModal from '../components/AddInspectionModal';

interface TransformerInfo {
  id: string;
  transformerNumber: string;
  region: string;
  poleNumber: string;
  capacity: string;
  type: string;
  feeders: number;
  lastInspected: string;
}

interface Inspection {
  inspectionNumber: string;
  inspectionDate: string;
  maintenanceDate: string;
  status: string;
  isFavorite?: boolean;
}

const TransformerInspectionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transformerInfo, setTransformerInfo] = useState<TransformerInfo | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    inspection: Inspection | null;
  }>({ isOpen: false, inspection: null });
  const [filters, setFilters] = useState({
    inspectionNumber: '',
    status: '',
    inspectionDate: '',
  });

  // Fetch transformer details + inspections
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const transformerRes = await axios.get(
          `http://localhost:8080/api/v1/transformers/${id}`
        );
        setTransformerInfo(transformerRes.data);

        const inspectionRes = await axios.get(
          `http://localhost:8080/api/v1/transformers/${id}/inspections`
        );

        const formattedInspections = inspectionRes.data.map((insp: Inspection) => ({
          ...insp,
          isFavorite: false,
        }));

        setInspections(formattedInspections);
      } catch (error) {
        console.error("Error fetching transformer or inspections:", error);
      }
    };

    fetchData();
  }, [id]);

  // Show delete confirmation modal
  const showDeleteConfirmation = (inspection: Inspection) => {
    setDeleteConfirmation({ isOpen: true, inspection });
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    if (!deleteConfirmation.inspection) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/inspections/${deleteConfirmation.inspection.inspectionNumber}`);
      // Refresh inspections after deletion
      const inspectionRes = await axios.get(
        `http://localhost:8080/api/v1/transformers/${id}/inspections`
      );
      const formattedInspections = inspectionRes.data.map((insp: Inspection) => ({
        ...insp,
        isFavorite: false,
      }));
      setInspections(formattedInspections);
      setDeleteConfirmation({ isOpen: false, inspection: null });
    } catch (err) {
      console.error('Error deleting inspection:', err);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, inspection: null });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300";
      case "Pending":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300";
      case "Completed":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return "🔄";
      case "Pending":
        return "⏳";
      case "Completed":
        return "✅";
      default:
        return "📋";
    }
  };

  // Filtered data based on filters
  const filteredInspections = inspections.filter((inspection) =>
    (inspection.inspectionNumber?.toLowerCase() ?? '').includes(filters.inspectionNumber.toLowerCase()) &&
    (filters.status === '' || inspection.status === filters.status) &&
    (inspection.inspectionDate?.toLowerCase() ?? '').includes(filters.inspectionDate.toLowerCase())
  );

  const InfoCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl text-center border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
      <p className="font-black text-gray-800 text-lg">{value}</p>
    </div>
  );

  return (
    <PageLayout title={`Transformer History - ${transformerInfo?.id || ""}`}>
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-8 max-w-md w-full mx-4 transform scale-100 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Confirm Delete</h3>
              </div>
              <button
                onClick={cancelDelete}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="mb-8">
              <p className="text-gray-700 text-lg mb-4">
                Are you sure you want to delete inspection{' '}
                <span className="font-bold text-red-600">
                  {deleteConfirmation.inspection?.inspectionNumber}
                </span>?
              </p>
              <p className="text-gray-600">
                This action cannot be undone. All data associated with this inspection will be permanently removed.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-200 shadow-xl overflow-hidden">
        <div className="relative p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-4 bg-gradient-to-r from-gray-500 via-slate-500 to-gray-600 text-white rounded-xl text-lg font-semibold hover:from-gray-600 hover:via-slate-600 hover:to-gray-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              >
                <ChevronLeft size={24} className="text-white" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg">
                  <Zap size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-800">
                    Transformer {transformerInfo?.transformerNumber}
                  </h1>
                  <p className="text-lg mt-2 font-medium text-gray-700 flex items-center">
                    <MapPin size={18} className="mr-2" />
                    {transformerInfo?.region} • Last Inspected: {transformerInfo?.lastInspected || "Never"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <Plus size={24} className="mr-3" />
              <span>Add Inspection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      {transformerInfo && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <InfoCard label="Transformer ID" value={transformerInfo.transformerNumber} />
          <InfoCard label="Pole No" value={transformerInfo.poleNumber} />
          <InfoCard label="Type" value={transformerInfo.type} />
          <InfoCard label="Region" value={transformerInfo.region} />
        </div>
      )}

      {/* Enhanced Inspections Table */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 via-gray-100 to-slate-50 px-8 py-6 border-b-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <Activity size={24} className="text-blue-600" />
            </div>
            Inspection History
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 border-b-2 border-gray-200 sticky top-0">
              <tr>
                <th className="p-6 w-12 text-center">
                  <Star size={18} className="text-gray-400 mx-auto" />
                </th>
                <th className="p-6 text-left text-sm font-black text-gray-800 uppercase tracking-wide">
                  <div className="flex items-center space-x-2">
                    <Activity size={16} />
                    <span>Inspection No</span>
                  </div>
                </th>
                <th className="p-6 text-left text-sm font-black text-gray-800 uppercase tracking-wide">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Inspection Date</span>
                  </div>
                </th>
                <th className="p-6 text-left text-sm font-black text-gray-800 uppercase tracking-wide">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Maintenance Date</span>
                  </div>
                </th>
                <th className="p-6 text-left text-sm font-black text-gray-800 uppercase tracking-wide">
                  <div className="flex items-center space-x-2">
                    <span>📊</span>
                    <span>Status</span>
                  </div>
                </th>
                <th className="p-6 text-center text-sm font-black text-gray-800 uppercase tracking-wide">Actions</th>
              </tr>

              {/* Enhanced Filter Row */}
              <tr className="bg-white border-b border-gray-200">
                <th></th>
                <th className="p-4">
                  <input
                    type="text"
                    value={filters.inspectionNumber}
                    onChange={(e) => setFilters({ ...filters, inspectionNumber: e.target.value })}
                    placeholder="Search inspection..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                  />
                </th>
                <th className="p-4">
                  <input
                    type="text"
                    value={filters.inspectionDate}
                    onChange={(e) => setFilters({ ...filters, inspectionDate: e.target.value })}
                    placeholder="Search date..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                  />
                </th>
                <th className="p-4"></th>
                <th className="p-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                  >
                    <option value="">All</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </th>
                <th></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredInspections.map((inspection, index) => (
                <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-25 hover:to-indigo-25 transition-all duration-300 group">
                  <td className="p-6 text-center">
                    <Star 
                      size={20} 
                      className={`transition-all duration-300 hover:scale-125 transform cursor-pointer ${
                        inspection.isFavorite ? "text-yellow-500 fill-current" : "text-gray-300 hover:text-yellow-500"
                      }`}
                    />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <span className="text-lg font-black text-gray-800 group-hover:text-blue-600 transition-colors">{inspection.inspectionNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-lg font-bold text-gray-700">{inspection.inspectionDate}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-lg font-bold text-gray-700">{inspection.maintenanceDate}</div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-md ${getStatusClass(inspection.status)}`}>
                      <span className="mr-2">{getStatusIcon(inspection.status)}</span>
                      {inspection.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => navigate(`/inspections/${inspection.inspectionNumber}/upload`)}
                        className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Eye size={16} className="mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => {/* Handle edit inspection */}}
                        className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => showDeleteConfirmation(inspection)}
                        className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Empty State */}
        {filteredInspections.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">No Inspections Found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search criteria or add a new inspection to get started.</p>
          </div>
        )}
      </div>

      {/* Add Inspection Modal */}
      {isAddModalOpen && (
        <AddInspectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </PageLayout>
  );
};

export default TransformerInspectionsPage;