import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import Pagination from '../components/common/Pagination';
import AddTransformerModal from '../transformers/AddTransformerModal'; // <-- Import the modal
import { Search, Plus, Star, MoreVertical, ChevronLeft } from 'lucide-react';

const transformersData = [
    { no: 'AZ-8890', pole: 'EN-122-A', region: 'Nugegoda', type: 'Bulk' },
    // ... other transformer data
];

const TransformersListPage = () => {
    // State to control the modal's visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <PageLayout title="Transformers">
            {/* Render the modal component and pass state to it */}
            <AddTransformerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            
            {/* Card Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Transformers</h2>
                    {/* This button now opens the modal */}
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-semibold"
                    >
                        <Plus size={18} className="mr-2"/> Add Transformer
                    </button>
                </div>
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
                    <button className="px-4 py-1.5 bg-white text-blue-600 rounded-md shadow text-sm font-semibold">Transformers</button>
                    <button onClick={() => navigate('/inspections')} className="px-4 py-1.5 text-gray-600 rounded-md text-sm font-semibold">Inspections</button>
                </div>
            </div>

            {/* Rest of the page (Filter Bar, Table, Pagination) remains the same */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    {/* ... table content ... */}
                </table>
            </div>
            <Pagination />
        </PageLayout>
    );
};

export default TransformersListPage;