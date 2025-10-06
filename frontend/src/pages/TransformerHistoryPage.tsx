import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/common/PageLayout";
import {
  Star,
  ChevronLeft,
  Zap,
  MapPin,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Calendar,
  Activity,
  Plus,
} from "lucide-react";
import AddInspectionModal from "../components/AddInspectionModal";
import EditInspectionModal from "../components/EditInspectionModal"; // ⬅️ use the modal like transformers page

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
  // add any other fields your EditInspectionModal expects here
}

const TransformerInspectionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transformerInfo, setTransformerInfo] = useState<TransformerInfo | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  // ── Add/Edit modal states (mirrors TransformersListPage) ──────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [inspectionToEdit, setInspectionToEdit] = useState<Inspection | null>(null);

  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    inspection: Inspection | null;
  }>({ isOpen: false, inspection: null });

  const [filters, setFilters] = useState({
    inspectionNumber: "",
    status: "",
    inspectionDate: "",
  });

  // Fetch transformer details + inspections
  const fetchInspections = async () => {
    if (!id) return;
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

  useEffect(() => {
    fetchInspections();
  }, [id]);

  // ── Delete flow ───────────────────────────────────────────────────────────────
  const showDeleteConfirmation = (inspection: Inspection) => {
    setDeleteConfirmation({ isOpen: true, inspection });
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.inspection) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/inspections/${deleteConfirmation.inspection.inspectionNumber}`
      );
      await fetchInspections();
      setDeleteConfirmation({ isOpen: false, inspection: null });
    } catch (err) {
      console.error("Error deleting inspection:", err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, inspection: null });
  };

  // ── Edit flow (same pattern as TransformersListPage) ──────────────────────────
  const handleEdit = (inspection: Inspection) => {
    setInspectionToEdit(inspection);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setInspectionToEdit(null);
  };

  const handleAddEditSuccess = () => {
    // refresh list after add/edit, then close modals
    fetchInspections();
    handleModalClose();
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300";
      case "Pending":
        return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300";
      case "Completed":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-green-800 border-green-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return "⏳";
      case "Pending":
        return "⌛";
      case "Completed":
        return "✓";
      default:
        return "●";
    }
  };

  const filteredInspections = inspections.filter(
    (inspection) =>
      (inspection.inspectionNumber?.toLowerCase() ?? "").includes(
        filters.inspectionNumber.toLowerCase()
      ) &&
      (filters.status === "" || inspection.status === filters.status) &&
      (inspection.inspectionDate?.toLowerCase() ?? "").includes(
        filters.inspectionDate.toLowerCase()
      )
  );

  const InfoCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl text-center border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <p className="text-lg text-gray-500 font-semibold">{label}</p>
      <p className="font-black text-gray-800 text-2xl">{value}</p>
    </div>
  );

  // Optional: toggle favorites
  const toggleFavorite = (inspectionNumber: string) => {
    setInspections((prev) =>
      prev.map((i) =>
        i.inspectionNumber === inspectionNumber ? { ...i, isFavorite: !i.isFavorite } : i
      )
    );
  };

  return (
    <PageLayout title={`Transformer History ${transformerInfo?.id || ""}`}>
      {/* Modals (mirroring your TransformersListPage pattern) */}
      {isAddModalOpen && (
        <AddInspectionModal
          isOpen={isAddModalOpen}
          onClose={handleModalClose}
          onAddSuccess={handleAddEditSuccess}
        />
      )}

      {inspectionToEdit && (
        <EditInspectionModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onEditSuccess={handleAddEditSuccess}
          inspectionToEdit={inspectionToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-10 max-w-md w-full mx-4 transform scale-100 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-red-100 rounded-xl">
                  <AlertTriangle size={30} className="text-red-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">Confirm Delete</h3>
              </div>
              <button
                onClick={cancelDelete}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-xl text-gray-700 mb-4">
                Are you sure you want to delete inspection{" "}
                <span className="font-bold text-red-600">
                  {deleteConfirmation.inspection?.inspectionNumber}
                </span>
                ?
              </p>
              <p className="text-lg text-gray-600">
                This action cannot be undone. All data associated with this inspection will be
                permanently removed.
              </p>
            </div>

            <div className="flex space-x-4 text-lg font-semibold">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center space-x-2 [&_*]:text-white [&_svg]:stroke-white"
              >
                <Trash2 size={20} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THEMED Header Section (amber/gray) */}
      <div className="bg-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="relative p-10">
          {/* Decorative amber blobs */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl" />
            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {/* Back button — light/dark friendly */}
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-xl text-lg font-semibold border transition-all duration-200 
                           flex items-center space-x-2
                           bg-white text-black border-gray-300 hover:bg-gray-50
                           dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700
                           [&_svg]:stroke-black dark:[&_svg]:stroke-white"
                aria-label="Go back"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
                  <Activity size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-800">
                    Transformer No - {transformerInfo?.transformerNumber}
                  </h1>
                  <p className="text-2xl mt-2 font-medium text-gray-700 flex items-center">
                    <MapPin size={22} className="mr-2" />
                    {transformerInfo?.region} 
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 
                         text-white px-8 py-5 rounded-2xl 
                         hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 
                         text-xl font-bold shadow-2xl 
                         transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                         [&_*]:text-white [&_svg]:stroke-white"
            >
              <Plus size={26} className="mr-3" />
              <span>Add Inspection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      {transformerInfo && (
        <div className="grid grid-cols-4 gap-8 mb-10">
          <InfoCard label="Transformer ID" value={transformerInfo.transformerNumber} />
          <InfoCard label="Pole No" value={transformerInfo.poleNumber} />
          <InfoCard label="Type" value={transformerInfo.type} />
          <InfoCard label="Region" value={transformerInfo.region} />
        </div>
      )}

      {/* Inspections Table with themed icons/colors */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 via-gray-100 to-slate-50 px-8 py-6 border-b-2 border-gray-200">
          <h3 className="text-3xl font-bold text-gray-800 flex items-center">
            <div className="p-3 bg-amber-100 rounded-xl mr-4">
              <Activity size={28} className="text-amber-600" />
            </div>
            Inspection History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xl">
            <thead className="bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 border-b-2 border-gray-200 sticky top-0">
              <tr>
                <th className="p-6 w-12 text-center">
                  <Star size={20} className="text-gray-400 mx-auto" />
                </th>
                <th className="p-6 text-left font-black text-gray-900 uppercase tracking-wide text-lg">
                  <div className="flex items-center space-x-3">
                    <span>📋</span>
                    <span>Inspection No</span>
                  </div>
                </th>
                <th className="p-6 text-left font-black text-gray-900 uppercase tracking-wide text-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar size={18} />
                    <span>Inspection Date</span>
                  </div>
                </th>
                <th className="p-6 text-left font-black text-gray-900 uppercase tracking-wide text-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar size={18} />
                    <span>Maintenance Date</span>
                  </div>
                </th>
                <th className="p-6 text-left font-black text-gray-900 uppercase tracking-wide text-lg">
                  <div className="flex items-center space-x-3">
                    <span>⚡</span>
                    <span>Status</span>
                  </div>
                </th>
                <th className="p-6 text-center font-black text-gray-900 uppercase tracking-wide text-lg">
                  Actions
                </th>
              </tr>

              {/* Filter Row */}
              <tr className="bg-white border-b border-gray-200">
                <th></th>
                <th className="p-4">
                  <input
                    type="text"
                    value={filters.inspectionNumber}
                    onChange={(e) =>
                      setFilters({ ...filters, inspectionNumber: e.target.value })
                    }
                    placeholder="Search inspection..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-lg text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                  />
                </th>
                <th className="p-4">
                  <input
                    type="text"
                    value={filters.inspectionDate}
                    onChange={(e) =>
                      setFilters({ ...filters, inspectionDate: e.target.value })
                    }
                    placeholder="Search date..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-lg text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                  />
                </th>
                <th className="p-4"></th>
                <th className="p-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-lg text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
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
              {filteredInspections.map((inspection) => (
                <tr
                  key={inspection.inspectionNumber}
                  className="hover:bg-gradient-to-r hover:from-amber-25 hover:to-orange-25 transition-all duration-300 group"
                >
                <td className="p-6 text-center">
                  <button
                    onClick={() => toggleFavorite(inspection.inspectionNumber)}
                    className="inline-flex items-center justify-center transition-all duration-300 transform hover:scale-125"
                    aria-label="Toggle favorite"
                    title="Toggle favorite"
                  >
                    <Star
                      size={20}
                      className={`transition-all duration-300 ${
                        inspection.isFavorite
                          ? "text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]"
                          : "text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400"
                      }`}
                    />
                  </button>
                </td>


                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity size={22} className="text-amber-600" />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">
                          {inspection.inspectionNumber}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-xl font-bold text-gray-900">
                      {inspection.inspectionDate}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-xl font-bold text-gray-900">
                      {inspection.maintenanceDate}
                    </div>
                  </td>
                  <td className="p-6">
                    <span
                      className={`inline-flex items-center px-5 py-3 rounded-xl text-lg font-bold border-2 shadow-md ${getStatusClass(
                        inspection.status
                      )}`}
                    >
                      <span className="mr-2">{getStatusIcon(inspection.status)}</span>
                      {inspection.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() =>
                        navigate(`/inspections/${inspection.inspectionNumber}/upload`)
                      }
                      className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 
                                text-white px-4 py-2 rounded-xl 
                                hover:from-blue-600 hover:to-indigo-600 
                                text-base font-bold transition-all duration-300 
                                shadow-lg hover:shadow-xl transform hover:scale-105
                                border border-blue-400/20 
                                dark:border-blue-500/30
                                [&_*]:text-white [&_svg]:stroke-white"
                    >
                      <Eye size={18} className="mr-2" />
                      <span>View</span>
                    </button>


                      {/* EDIT via modal (same pattern as transformer list) */}
                      <button
                        onClick={() => handleEdit(inspection)}
                        className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 
                                  text-white px-4 py-2 rounded-xl 
                                  hover:from-emerald-600 hover:to-teal-600 
                                  text-base font-bold transition-all duration-300 
                                  shadow-lg hover:shadow-xl transform hover:scale-105
                                  border border-emerald-400/20 dark:border-emerald-500/30
                                  [&_*]:text-white [&_svg]:stroke-white"
                      >
                        <Edit size={18} className="mr-2" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => showDeleteConfirmation(inspection)}
                        className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 
                                  text-white px-4 py-2 rounded-xl 
                                  hover:from-red-600 hover:to-red-700 
                                  text-base font-bold transition-all duration-300 
                                  shadow-lg hover:shadow-xl transform hover:scale-105
                                  border border-red-400/20 dark:border-red-500/30
                                  [&_*]:text-white [&_svg]:stroke-white"
                      >
                        <Trash2 size={18} className="mr-2" />
                        <span>Delete</span>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInspections.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📋</div>
            <h3 className="text-3xl font-bold text-gray-600 mb-3">No Inspections Found</h3>
            <p className="text-xl text-gray-500">
              Try adjusting your search criteria or add a new inspection to get started.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TransformerInspectionsPage;
