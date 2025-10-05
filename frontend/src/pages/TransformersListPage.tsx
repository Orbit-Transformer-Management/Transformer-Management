import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/common/PageLayout';
import Pagination from '../components/common/Pagination';
import AddTransformerModal from '../transformers/AddTransformerModal';
import EditTransformerModal from '../transformers/EditTransformerModal'; // Added import for the new modal
import { Search, Plus, Star, ChevronLeft, Zap, MapPin, Filter, Eye, Trash2, Activity, TrendingUp, AlertTriangle, Edit, X } from 'lucide-react';

const TransformersListPage = () => {
    const [transformersData, setTransformersData] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        transformerNo: '',
        poleNo: '',
        region: '',
        type: '',
    });
    // --- STATE CHANGES ---
    // States are now separate for each modal's visibility
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transformerToEdit, setTransformerToEdit] = useState<any>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        transformer: any;
    }>({ isOpen: false, transformer: null });
    const navigate = useNavigate();

    // Fetch transformers from API
    const fetchTransformers = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/transformers');
            setTransformersData(res.data);
        } catch (err) {
            console.error('Error fetching transformers:', err);
        }
    };

    useEffect(() => {
        fetchTransformers();
    }, []);

    // Show delete confirmation modal
    const showDeleteConfirmation = (transformer: any) => {
        setDeleteConfirmation({ isOpen: true, transformer });
    };

    // Handle delete with confirmation
    const handleDelete = async () => {
        if (!deleteConfirmation.transformer) return;

        try {
            await axios.delete(`http://localhost:8080/api/v1/transformers/${deleteConfirmation.transformer.transformerNumber}`);
            fetchTransformers(); // Refresh list after deletion
            setDeleteConfirmation({ isOpen: false, transformer: null });
        } catch (err) {
            console.error('Error deleting transformer:', err);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, transformer: null });
    };

    // --- HANDLER CHANGES ---

    // Handle edit transformer: Now opens the EDIT modal
    const handleEdit = (transformer: any) => {
        setTransformerToEdit(transformer);
        setIsEditModalOpen(true);
    };

    // Handle modal close: Now closes BOTH modals and resets state
    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setTransformerToEdit(null);
    };

    // Handle successful add/edit: Calls the updated close handler
    const handleAddEditSuccess = () => {
        fetchTransformers();
        handleModalClose();
    };

    // Filtered data based on column filters
    const filteredData = transformersData.filter((t) =>
        (t.transformerNo?.toLowerCase() ?? '').includes(filters.transformerNo.toLowerCase()) &&
        (t.poleNo?.toLowerCase() ?? '').includes(filters.poleNo.toLowerCase()) &&
        (filters.region === '' || t.region === filters.region) &&
        (filters.type === '' || t.type === filters.type)
    );

    // Reset all filters
    const resetFilters = () => {
        setFilters({ transformerNo: '', poleNo: '', region: '', type: '' });
    };

    return (
        <PageLayout title="Transformers">
            {/* --- MODAL RENDERING CHANGES --- */}
            {/* Modal for adding a new transformer */}
            <AddTransformerModal
                isOpen={isAddModalOpen}
                onClose={handleModalClose}
                onAddSuccess={handleAddEditSuccess}
            />

            {/* Modal for editing an existing transformer */}
            {/* It only renders when there is a transformer to edit */}
            {transformerToEdit && (
                <EditTransformerModal
                    isOpen={isEditModalOpen}
                    onClose={handleModalClose}
                    onEditSuccess={handleAddEditSuccess}
                    transformerToEdit={transformerToEdit}
                />
            )}


            {/* Delete Confirmation Modal (no changes here) */}
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
                                Are you sure you want to delete transformer{' '}
                                <span className="font-bold text-red-600">
                                    {deleteConfirmation.transformer?.transformerNumber}
                                </span>?
                            </p>
                            <p className="text-gray-600">
                                This action cannot be undone. All data associated with this transformer will be permanently removed.
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

            <div className="flex flex-col h-full space-y-8">
                <div className="bg-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">

                    <div className="relative p-8">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full blur-2xl"></div>
                        </div>

                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center space-x-6">
                                <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 bg-white text-black rounded-xl text-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                                >
                                <ChevronLeft size={22} className="text-white" />
                                </button>


                                <div className="flex items-center space-x-4">
                                    <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
                                        <Zap size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-800">
                                            Transformer Management
                                        </h1>
                                        <p className="text-lg mt-2 font-medium text-gray-700">
                                            Monitor and control electrical infrastructure
                                        </p>
                                    </div>
                                </div>

                                {/* --- ADD BUTTON ONCLICK CHANGE --- */}
                                <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl 
                                            hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 
                                            text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ml-8"
                                >
                                <Plus size={24} className="mr-3" />
                                <span>Add Transformer</span>
                                </button>

                            </div>

                            <div className="flex items-center bg-white/90 p-2 rounded-2xl shadow-lg border border-amber-200 backdrop-blur-sm">
                                <button
                                    className="inline-flex items-center bg-gradient-to-r from-gray-500 to-gray-700 text-white 
                                                px-4 py-2 rounded-xl 
                                                hover:from-gray-600 hover:to-gray-800 
                                                text-sm font-bold transition-all duration-300 
                                                shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <Zap size={20} />
                                    <span>Transformers</span>
                                </button>
                                <button
                                    onClick={() => navigate('/inspections')}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-xl text-lg font-semibold hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-blue-400/20"
                                >
                                    <Activity size={20} />
                                    <span>Inspections</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The rest of the table code remains the same */}
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
                    {/* ... Table Header ... */}
                    <div className="bg-gradient-to-r from-slate-50 via-gray-100 to-slate-50 px-8 py-6 border-b-2 border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                            <div className="p-3 bg-amber-100 rounded-xl mr-4">
                                <Zap size={24} className="text-amber-600" />
                            </div>
                            Transformer Inventory
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
                                            <Zap size={16} />
                                            <span>Transformer ID</span>
                                        </div>
                                    </th>
                                    <th className="p-6 text-left text-sm font-black text-gray-800 uppercase tracking-wide">
                                        <div className="flex items-center space-x-2">
                                            <MapPin size={16} />
                                            <span>Pole Number</span>
                                        </div>
                                    </th>
                                    <th className="p-6 text-left text-sm font-black text-gray-800 uppercase tracking-wide">
                                        <div className="flex items-center space-x-2">
                                            <span>🌍</span>
                                            <span>Region</span>
                                        </div>
                                    </th>
                                    <th className="p-6 text-left text-sm font-black text-gray-800 uppercase tracking-wide">
                                        <div className="flex items-center space-x-2">
                                            <span>⚡</span>
                                            <span>Type</span>
                                        </div>
                                    </th>
                                    <th className="p-6 text-center text-sm font-black text-gray-800 uppercase tracking-wide">Actions</th>
                                </tr>

                                <tr className="bg-white border-b border-gray-200">
                                    <th></th>
                                    <th className="p-4">
                                        <input
                                            type="text"
                                            value={filters.transformerNo}
                                            onChange={(e) => setFilters({ ...filters, transformerNo: e.target.value })}
                                            placeholder="Search ID..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                        />
                                    </th>
                                    <th className="p-4">
                                        <input
                                            type="text"
                                            value={filters.poleNo}
                                            onChange={(e) => setFilters({ ...filters, poleNo: e.target.value })}
                                            placeholder="Search pole..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                        />
                                    </th>
                                    <th className="p-4">
                                        <select
                                            value={filters.region}
                                            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                        >
                                            <option value="">All</option>
                                            <option value="Nugegoda">Nugegoda</option>
                                            <option value="Maharagama">Maharagama</option>
                                        </select>
                                    </th>
                                    <th className="p-4">
                                        <select
                                            value={filters.type}
                                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                        >
                                            <option value="">All</option>
                                            <option value="Bulk">Bulk</option>
                                            <option value="Distribution">Distribution</option>
                                        </select>
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map((transformer, index) => (
                                    <tr key={index} className="hover:bg-gradient-to-r hover:from-amber-25 hover:to-orange-25 transition-all duration-300 group">
                                        <td className="p-6 text-center">
                                            <Star size={20} className="text-gray-300 hover:text-yellow-500 cursor-pointer transition-all duration-300 hover:scale-125 transform" />
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-lg">
                                                    <Zap size={20} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <span className="text-lg font-black text-gray-800 group-hover:text-amber-600 transition-colors">{transformer.transformerNumber}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-lg font-bold text-gray-700">{transformer.poleNumber}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <MapPin size={16} className="text-blue-600" />
                                                </div>
                                                <span className="text-lg font-semibold text-gray-700">{transformer.region}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-md ${transformer.type === 'Bulk'
                                                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300'
                                                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300'
                                                }`}>
                                                <span className="mr-2">{transformer.type === 'Bulk' ? '🏭' : '🏘️'}</span>
                                                {transformer.type}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    onClick={() => navigate(`/transformers/${transformer.transformerNumber}/history`)}
                                                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                >
                                                    <Eye size={16} className="mr-2" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(transformer)} // No changes here, this is correct
                                                    className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                >
                                                    <Edit size={16} className="mr-2" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => showDeleteConfirmation(transformer)}
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
                    
                    {filteredData.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-8xl mb-6">⚡</div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-3">No Transformers Found</h3>
                            <p className="text-gray-500 text-lg">Try adjusting your search criteria or add a new transformer to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default TransformersListPage;