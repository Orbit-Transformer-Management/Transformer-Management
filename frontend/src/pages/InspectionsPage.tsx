import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import Pagination from '../components/common/Pagination';
import AddInspectionModal from '../components/AddInspectionModal';
import { Search, Plus, Star, MoreVertical, ChevronLeft } from 'lucide-react';
import axios from 'axios';

interface Inspection {
    id: string;
    branch: string;
    inspectionNo: string;
    transformerNo: string;
    inspectionDate: string;
    inspectionTime: string;
    maintenanceDate: string;
    maintenanceTime: string;
    status: string;
}

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const InspectionsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const navigate = useNavigate();

    // Fetch inspections from API
    const fetchInspections = async () => {
        try {
            const res = await axios.get<Inspection[]>('http://localhost:5000/inspections');
            setInspections(res.data);
        } catch (err) {
            console.error('Error fetching inspections:', err);
        }
    };

    // Fetch on component mount
    useEffect(() => {
        fetchInspections();
    }, []);

    return (
        <PageLayout title="Transformer > All Inspections">
            <AddInspectionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onAddSuccess={fetchInspections} // refresh table after adding
            />
            
            {/* Card Header */}
            <div className="flex-shrink-0 flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">All Inspections</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-base font-bold shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105 border-2 border-blue-600"
                    >
                        <Plus size={20} className="mr-2"/> Add Inspection
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
                <div className="relative flex-grow">
                    <select className="absolute left-0 top-0 h-full pl-3 pr-8 border-r bg-transparent text-sm text-gray-600 z-10">
                        <option>By Transformer No</option>
                    </select>
                    <input type="text" placeholder="Search Transformer" className="w-full p-3 pl-40 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                    <button className="absolute right-0 top-0 h-full px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                        <Search size={20}/>
                    </button>
                </div>
                <select className="p-3 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500">
                    <option>All Time</option>
                </select>
                <button className="p-3 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm transition-colors">Reset Filters</button>
            </div>

            {/* Inspections Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b sticky top-0">
                        <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Transformer No.</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Inspection No</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Inspected Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Maintenance Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 text-center">Actions</th>
                            <th className="p-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {inspections.map((insp, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-center">
                                    <Star size={18} className="text-gray-400 cursor-pointer hover:text-yellow-500 transition-colors"/>
                                </td>
                                <td className="p-4 text-sm font-medium text-gray-800">{insp.transformerNo}</td>
                                <td className="p-4 text-sm text-gray-600">{insp.inspectionNo}</td>
                                <td className="p-4 text-sm text-gray-600">{insp.inspectionDate}</td>
                                <td className="p-4 text-sm text-gray-600">{insp.maintenanceDate || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(insp.status)}`}>
                                        {insp.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => navigate(`/transformers/${insp.transformerNo}/upload`)}
                                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-base font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-blue-600"
                                    >
                                        View
                                    </button>
                                </td>
                                <td className="p-4 text-center">
                                    <button className="text-gray-500 hover:text-gray-800 transition-colors">
                                        <MoreVertical size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="flex-shrink-0">
                <Pagination />
            </div>
        </PageLayout>
    );
};

export default InspectionsPage;
