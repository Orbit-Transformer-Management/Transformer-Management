import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout'; // Assuming PageLayout exists
import { Star, MoreVertical, ChevronLeft } from 'lucide-react';

const TransformerInspectionsPage = () => {
    const navigate = useNavigate();

    // Mock data based on the provided image
    const transformerInfo = {
        id: 'AZ-8370',
        location: '"Keels", Embuldeniya',
        poleNo: 'EN-122-A',
        capacity: '102.97',
        type: 'Bulk',
        feeders: 2,
        lastInspected: 'Mon(21), May, 2023 12.55pm'
    };

    const inspections = [
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: '-', status: 'In Progress', isFavorite: true },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: '-', status: 'In Progress', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: '-', status: 'Pending', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: 'Mon(21), May, 2023 12.55pm', status: 'Completed', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: 'Mon(21), May, 2023 12.55pm', status: 'Completed', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: 'Mon(21), May, 2023 12.55pm', status: 'Completed', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: 'Mon(21), May, 2023 12.55pm', status: 'Completed', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: 'Mon(21), May, 2023 12.55pm', status: 'Completed', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: 'Mon(21), May, 2023 12.55pm', status: 'Completed', isFavorite: false },
        { inspectionNo: '000123589', inspectedDate: 'Mon(21), May, 2023 12.55pm', maintenanceDate: 'Mon(21), May, 2023 12.55pm', status: 'Completed', isFavorite: false },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case 'In Progress':
                return 'bg-green-100 text-green-700';
            case 'Pending':
                return 'bg-red-100 text-red-700';
            case 'Completed':
                return 'bg-gray-200 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const InfoCard = ({ label, value }) => (
        <div className="bg-gray-100 p-2 rounded-md text-center">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-bold text-gray-800">{value}</p>
        </div>
    );

    return (
        <PageLayout title={`Transformer Details - ${transformerInfo.id}`}>
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{transformerInfo.id}</h1>
                        <p className="text-gray-500">{transformerInfo.location}</p>
                    </div>
                </div>
                <div className="text-right pt-2">
                    <p className="text-sm text-gray-500">Last Inspected Date: {transformerInfo.lastInspected}</p>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <InfoCard label="Pole No" value={transformerInfo.poleNo} />
                <InfoCard label="Capacity" value={transformerInfo.capacity} />
                <InfoCard label="Type" value={transformerInfo.type} />
                <InfoCard label="No. of Feeders" value={transformerInfo.feeders} />
            </div>

            {/* Inspections Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Transformer Inspections</h2>
                    <button
                        onClick={() => { /* Handle Add Inspection */ }}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-semibold shadow transition-colors"
                    >
                        Add Inspection
                    </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500 px-4 mb-2">
                    <div className="col-span-3">Inspection No</div>
                    <div className="col-span-3">Inspected Date</div>
                    <div className="col-span-3">Maintenance Date</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-center">Actions</div>
                </div>

                {/* Table Body */}
                <div className="space-y-2">
                    {inspections.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-md hover:bg-gray-100">
                            <div className="col-span-3 flex items-center">
                                <Star className={`mr-3 ${item.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} size={20} />
                                <span className="font-medium text-gray-800">{item.inspectionNo}</span>
                            </div>
                            <div className="col-span-3 text-gray-600">{item.inspectedDate}</div>
                            <div className="col-span-3 text-gray-600">{item.maintenanceDate}</div>
                            <div className="col-span-1">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end space-x-2">
                                <button className="bg-indigo-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-indigo-600">
                                    View
                                </button>
                                <button className="text-gray-400 hover:text-gray-600 p-2">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default TransformerInspectionsPage;