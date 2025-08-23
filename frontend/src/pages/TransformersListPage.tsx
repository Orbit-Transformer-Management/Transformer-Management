import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/common/PageLayout';
import Pagination from '../components/common/Pagination';
import AddTransformerModal from '../transformers/AddTransformerModal';
import { Search, Plus, Star, MoreVertical, ChevronLeft, Zap, MapPin, Filter } from 'lucide-react';

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
            <AddTransformerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 shadow-sm border border-blue-100">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
                        >
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Zap size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                    Transformers Management
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">Monitor and manage electrical transformers</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105 ml-8"
                        >
                            <Plus size={18} className="mr-2"/> Add New Transformer
                        </button>
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="flex items-center bg-white p-1 rounded-xl shadow-md border border-gray-200">
                        <button 
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-sm text-sm font-semibold transition-all duration-200"
                        >
                            Transformers
                        </button>
                        <button 
                            onClick={() => navigate('/inspections')} 
                            className="px-6 py-2.5 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                        >
                            Inspections
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Filter size={20} className="mr-2 text-blue-600" />
                        Search & Filter
                    </h3>
                    <button 
                        onClick={resetFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-sm transition-all duration-200 font-medium"
                    >
                        Reset All Filters
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Transformer</label>
                        <div className="relative">
                            <select className="absolute left-0 top-0 h-full pl-4 pr-8 bg-gray-50 border-r border-gray-200 text-sm text-gray-600 z-10 rounded-l-lg">
                                <option>By Transformer No</option>
                            </select>
                            <input 
                                type="text" 
                                placeholder="Enter transformer number or details..." 
                                className="w-full p-3 pl-44 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-200"
                            />
                            <button className="absolute right-0 top-0 h-full px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md">
                                <Search size={18}/>
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <div className="relative">
                            <select 
                                value={filters.region}
                                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            >
                                <option value="">All Regions</option>
                                <option value="Nugegoda">Nugegoda</option>
                                <option value="Maharagama">Maharagama</option>
                            </select>
                            <MapPin size={16} className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select 
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <option value="">All Types</option>
                            <option value="Bulk">Bulk</option>
                            <option value="Distribution">Distribution</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Total Transformers</p>
                            <p className="text-2xl font-bold text-blue-800 mt-1">{transformersData.length}</p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-xl">
                            <Zap size={24} className="text-blue-700" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Active Units</p>
                            <p className="text-2xl font-bold text-green-800 mt-1">{Math.floor(transformersData.length * 0.85)}</p>
                        </div>
                        <div className="p-3 bg-green-200 rounded-xl">
                            <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-medium">Needs Attention</p>
                            <p className="text-2xl font-bold text-orange-800 mt-1">{Math.floor(transformersData.length * 0.15)}</p>
                        </div>
                        <div className="p-3 bg-orange-200 rounded-xl">
                            <div className="w-6 h-6 bg-orange-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transformer Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Transformer Inventory</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <Star size={16} className="text-gray-400 mx-auto" />
                                </th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Transformer No.</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Pole No.</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Region</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                                <th className="p-4 w-12 text-center"></th>
                            </tr>

                            {/* Filter Row */}
                            <tr className="bg-gray-50">
                                <th></th>
                                <th className="p-2">
                                    <input
                                        type="text"
                                        value={filters.transformerNo}
                                        onChange={(e) => setFilters({ ...filters, transformerNo: e.target.value })}
                                        placeholder="Filter..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                                    />
                                </th>
                                <th className="p-2">
                                    <input
                                        type="text"
                                        value={filters.poleNo}
                                        onChange={(e) => setFilters({ ...filters, poleNo: e.target.value })}
                                        placeholder="Filter..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                                    />
                                </th>
                                <th className="p-2">
                                    <select
                                        value={filters.region}
                                        onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
                                    >
                                        <option value="">All</option>
                                        <option value="Nugegoda">Nugegoda</option>
                                        <option value="Maharagama">Maharagama</option>
                                    </select>
                                </th>
                                <th className="p-2">
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-green-500 transition-all duration-200 hover:border-gray-300"
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
                                <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 group">
                                    <td className="p-4 text-center">
                                        <Star size={18} className="text-gray-300 hover:text-yellow-500 cursor-pointer transition-all duration-200 hover:scale-110"/>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Zap size={16} className="text-blue-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">{transformer.transformerNumber}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">{transformer.poleNumber}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <MapPin size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{transformer.region}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            transformer.type === 'Bulk' 
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-green-100 text-green-800 border border-green-200'
                                        }`}>
                                            {transformer.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => navigate(`/transformers/${transformer.transformerNo}/history`)}
                                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">

                                    <td className="p-4 text-center relative">
                                        {/* 3-dots button */}
                                        <button
                                            onClick={() =>
                                                setOpenDropdown(
                                                    openDropdown === transformer.transformerNumber
                                                        ? null
                                                        : transformer.transformerNumber
                                                )
                                            }
                                            className="p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                                        >
                                            <MoreVertical size={20} className="text-gray-600" />
                                        </button>

                                        {/* Dropdown menu */}
                                        {openDropdown === transformer.transformerNumber && (
                                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 animate-fadeIn">
                                                <button
                                                    onClick={() => {
                                                        handleDelete(transformer.transformerNumber);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 mr-2"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>



                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pagination
            <div className="mt-6">
                <Pagination />
            </div> */}
        </PageLayout>
    );
};

export default TransformersListPage;
