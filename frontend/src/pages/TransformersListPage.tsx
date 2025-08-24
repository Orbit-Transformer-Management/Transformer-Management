import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/common/PageLayout';
import Pagination from '../components/common/Pagination';
import AddTransformerModal from '../transformers/AddTransformerModal';
import { Search, Plus, Star, MoreVertical, ChevronLeft, Zap, MapPin, Filter, Eye, Trash2, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

const TransformersListPage = () => {
    const [transformersData, setTransformersData] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        transformerNo: '',
        poleNo: '',
        region: '',
        type: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    
    const handleDelete = async (transformerNumber: string) => {
        if (!window.confirm("Are you sure you want to delete this transformer?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/v1/transformers/${transformerNumber}`);
            alert("Transformer deleted successfully!");
            fetchTransformers(); // Refresh list after deletion
        } catch (err) {
            console.error('Error deleting transformer:', err);
            alert("Failed to delete transformer");
        }
    };

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
            <AddTransformerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddSuccess={fetchTransformers} />
            
            <div className="flex flex-col h-full space-y-8">

                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-3xl border border-amber-200 shadow-xl overflow-hidden">
                    <div className="relative p-8">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full blur-2xl"></div>
                        </div>
                        
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center space-x-6">
                                <button 
                                    onClick={() => navigate(-1)} 
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-xl text-lg font-semibold hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-blue-400/20"
                                >
                                    <ChevronLeft size={24} className="text-gray-700" />
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
                                
                                <button 
                                    onClick={() => setIsModalOpen(true)} 
                                    className="flex items-center bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ml-8"
                                >
                                    <Plus size={24} className="mr-3"/> 
                                    <span>Add Transformer</span>
                                </button>
                            </div>
                            
                            {/* Enhanced Tab Navigation */}
                            <div className="flex items-center bg-white/90 p-2 rounded-2xl shadow-lg border border-amber-200 backdrop-blur-sm">
                                <button 
                                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg text-lg font-bold transition-all duration-300 flex items-center space-x-2"
                                >
                                    <Zap size={18} />
                                    <span>Transformers</span>
                                </button>
                                <button
                                    onClick={() => navigate('/inspections')}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-xl text-lg font-semibold hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-blue-400/20"
                                >
                                    <Activity size={18} />
                                    <span>Inspections</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-700 text-sm font-bold uppercase tracking-wide">Total Fleet</p>
                                <p className="text-4xl font-black text-blue-900 mt-2">{transformersData.length}</p>
                                <p className="text-blue-600 text-xs mt-1 font-medium">Active Transformers</p>
                            </div>
                            <div className="p-4 bg-blue-200 rounded-2xl shadow-inner">
                                <Zap size={32} className="text-blue-800" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-700 text-sm font-bold uppercase tracking-wide">Operational</p>
                                <p className="text-4xl font-black text-green-900 mt-2">{Math.floor(transformersData.length * 0.85)}</p>
                                <p className="text-green-600 text-xs mt-1 font-medium flex items-center">
                                    <TrendingUp size={12} className="mr-1" />
                                    Running Smoothly
                                </p>
                            </div>
                            <div className="p-4 bg-green-200 rounded-2xl shadow-inner">
                                <div className="w-8 h-8 bg-green-600 rounded-full animate-pulse shadow-lg"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-100 rounded-2xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-700 text-sm font-bold uppercase tracking-wide">Maintenance</p>
                                <p className="text-4xl font-black text-amber-900 mt-2">{Math.floor(transformersData.length * 0.15)}</p>
                                <p className="text-amber-600 text-xs mt-1 font-medium flex items-center">
                                    <AlertTriangle size={12} className="mr-1" />
                                    Needs Attention
                                </p>
                            </div>
                            <div className="p-4 bg-amber-200 rounded-2xl shadow-inner">
                                <AlertTriangle size={32} className="text-amber-800 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 via-indigo-100 to-blue-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-700 text-sm font-bold uppercase tracking-wide">Efficiency</p>
                                <p className="text-4xl font-black text-purple-900 mt-2">94%</p>
                                <p className="text-purple-600 text-xs mt-1 font-medium">System Performance</p>
                            </div>
                            <div className="p-4 bg-purple-200 rounded-2xl shadow-inner">
                                <Activity size={32} className="text-purple-800" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filter Section */}
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-slate-100 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                                    <Filter size={24} className="text-blue-600" />
                                </div>
                                Advanced Search & Filtering
                            </h3>
                            <button 
                                onClick={resetFilters}
                                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-gray-300"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                            <div className="md:col-span-6 space-y-3">
                                <label className="block text-sm font-bold text-gray-700">🔍 Search Transformers</label>
                                <div className="relative">
                                    <select className="absolute left-0 top-0 h-full pl-5 pr-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-r-2 border-blue-200 text-sm text-blue-700 z-10 rounded-l-xl font-semibold">
                                        <option>By Transformer No</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder="Enter transformer ID, location, or specifications..." 
                                        className="w-full p-4 pl-48 pr-16 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-300 text-gray-800 font-medium"
                                    />
                                    <button className="absolute right-0 top-0 h-full px-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-r-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                                        <Search size={20}/>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="md:col-span-3 space-y-3">
                                <label className="block text-sm font-bold text-gray-700">🌍 Regional Zone</label>
                                <div className="relative">
                                    <select 
                                        value={filters.region}
                                        onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 transition-all duration-300 appearance-none"
                                    >
                                        <option value="">All Regions</option>
                                        <option value="Nugegoda">🏙️ Nugegoda</option>
                                        <option value="Maharagama">🌆 Maharagama</option>
                                    </select>
                                    <MapPin size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            <div className="md:col-span-3 space-y-3">
                                <label className="block text-sm font-bold text-gray-700">⚡ Transformer Type</label>
                                <select 
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                                >
                                    <option value="">All Types</option>
                                    <option value="Bulk">🏭 Bulk Transformer</option>
                                    <option value="Distribution">🏘️ Distribution Unit</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Table Container */}
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
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
                                    <th className="p-6 w-12 text-center"></th>
                                </tr>

                                {/* Enhanced Filter Row */}
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
                                    <th colSpan={2}></th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map((transformer, index) => (
                                    <tr key={index} className="hover:bg-gradient-to-r hover:from-amber-25 hover:to-orange-25 transition-all duration-300 group">
                                        <td className="p-6 text-center">
                                            <Star size={20} className="text-gray-300 hover:text-yellow-500 cursor-pointer transition-all duration-300 hover:scale-125 transform"/>
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
                                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-md ${
                                                transformer.type === 'Bulk' 
                                                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300'
                                                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300'
                                            }`}>
                                                <span className="mr-2">{transformer.type === 'Bulk' ? '🏭' : '🏘️'}</span>
                                                {transformer.type}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button 
                                                onClick={() => navigate(`/transformers/${transformer.transformerNumber}/history`)}
                                                className="inline-flex items-center bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                                            >
                                                <Eye size={16} className="mr-2" />
                                                View Details
                                            </button>
                                        </td>
                                        <td className="p-6 text-center relative">
                                            <button
                                                onClick={() =>
                                                    setOpenDropdown(
                                                        openDropdown === transformer.transformerNumber
                                                            ? null
                                                            : transformer.transformerNumber
                                                    )
                                                }
                                                className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                                            >
                                                <MoreVertical size={20} className="text-gray-600" />
                                            </button>

                                            {openDropdown === transformer.transformerNumber && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden">
                                                    <button
                                                        onClick={() => {
                                                            handleDelete(transformer.transformerNumber);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center w-full px-6 py-4 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all duration-200 border-l-4 border-transparent hover:border-red-500"
                                                    >
                                                        <Trash2 size={18} className="mr-3" />
                                                        Delete Transformer
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Enhanced Empty State */}
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