import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import Pagination from '../components/common/Pagination';
import { Search, Plus, Star, MoreVertical, ChevronLeft } from 'lucide-react';

const inspectionsData = [
    { transNo: 'AZ-8890', inspNo: '000123589', inspDate: '02 Jul, 2025 19:12', maintDate: '-', status: 'In Progress' },
    { transNo: 'AZ-1649', inspNo: '000123589', inspDate: '01 Jul, 2025 18:22', maintDate: '-', status: 'In Progress' },
    { transNo: 'AZ-7316', inspNo: '000123589', inspDate: '13 Jun, 2025 12:12', maintDate: '-', status: 'Pending' },
    { transNo: 'AZ-4613', inspNo: '000123589', inspDate: '06 Jun, 2025 16:23', maintDate: '08 Jul, 2025 19:12', status: 'Completed' },
    { transNo: 'AX-8993', inspNo: '000123589', inspDate: '02 Jul, 2025 19:12', maintDate: '08 Jul, 2025 19:12', status: 'Completed' },
    // ... add other data from screenshot
];

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const InspectionsPage = () => {
    const navigate = useNavigate();

    return (
        <PageLayout title="Transformer > All Inspections">
            {/* Card Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">All Inspections</h2>
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-semibold">
                        <Plus size={18} className="mr-2"/> Add Inspection
                    </button>
                </div>
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
                    <button onClick={() => navigate('/transformers')} className="px-4 py-1.5 text-gray-600 rounded-md text-sm font-semibold">Transformers</button>
                    <button className="px-4 py-1.5 bg-white text-blue-600 rounded-md shadow text-sm font-semibold">Inspections</button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-grow">
                    <select className="absolute left-0 top-0 h-full pl-3 pr-8 border-r bg-transparent text-sm text-gray-600">
                        <option>By Transformer No</option>
                    </select>
                    <input type="text" placeholder="Search Transformer" className="w-full p-2 pl-40 pr-10 border rounded-md"/>
                    <button className="absolute right-0 top-0 h-full px-3 bg-blue-600 text-white rounded-r-md">
                        <Search size={20}/>
                    </button>
                </div>
                <select className="p-2 border rounded-md bg-white text-sm">
                    <option>All Time</option>
                </select>
                <button className="p-2 border rounded-md text-gray-600 hover:bg-gray-100 text-sm">Reset Filters</button>
            </div>

            {/* Inspections Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 w-12"></th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Transformer No.</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Inspection No</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Inspected Date</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Maintenance Date</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Actions</th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {inspectionsData.map((insp, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-center">
                                    <Star size={18} className="text-gray-400 cursor-pointer"/>
                                </td>
                                <td className="p-3 text-sm font-medium text-gray-800">{insp.transNo}</td>
                                <td className="p-3 text-sm text-gray-600">{insp.inspNo}</td>
                                <td className="p-3 text-sm text-gray-600">{insp.inspDate}</td>
                                <td className="p-3 text-sm text-gray-600">{insp.maintDate}</td>
                                <td className="p-3">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(insp.status)}`}>
                                        {insp.status}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    {/* This button will navigate to the specific transformer's detail page */}
                                    <button 
                                        onClick={() => navigate(`/transformers/${insp.transNo}`)}
                                        className="bg-blue-600 text-white px-5 py-1.5 rounded-md hover:bg-blue-700 text-sm font-semibold"
                                    >
                                        View
                                    </button>
                                </td>
                                <td className="p-3 text-center">
                                    <button className="text-gray-500 hover:text-gray-800"><MoreVertical size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Pagination />
        </PageLayout>
    );
};

export default InspectionsPage;