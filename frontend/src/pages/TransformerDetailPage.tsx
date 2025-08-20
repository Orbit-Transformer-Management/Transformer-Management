import React, { useState } from 'react';
import Header from '../components/common/Header';
import { UploadCloud, Image, Sun, Cloud, CloudRain } from 'lucide-react';

const TransformerDetailPage = () => {
    // State to manage which environmental condition is selected
    const [thermalCondition, setThermalCondition] = useState('Sunny');
    const [baselineCondition, setBaselineCondition] = useState('Sunny');

    const environmentalConditions = [
        { name: 'Sunny', icon: <Sun size={16} /> },
        { name: 'Cloudy', icon: <Cloud size={16} /> },
        { name: 'Rainy', icon: <CloudRain size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Transformer Details" breadcrumb="= Transformer > AZ-8370" />

            <main className="p-8">
                {/* Transformer Info Header */}
                 <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">AZ-8370</h2>
                            <p className="text-gray-500">Nugegoda "Keels", Embuldeniya</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 text-right">Last Inspected</p>
                            <p className="font-semibold text-gray-700">Mon (21), May, 2023 12.55pm</p>
                        </div>
                    </div>
                     <div className="mt-4 pt-4 border-t flex space-x-8 text-sm text-gray-600">
                        <span><strong>Pole No:</strong> EN-122-A</span>
                        <span><strong>Type:</strong> Bulk</span>
                        <span><strong>Capacity:</strong> 102.97</span>
                        <span><strong>No. of Feeders:</strong> 2</span>
                    </div>
                </div>

                {/* Image Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Maintenance Image Upload */}
                     <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            <UploadCloud className="mr-2 text-blue-600" /> Upload Thermal Image (Maintenance)
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                            <p className="text-gray-500 mb-4">Upload a new thermal image for periodic inspection and to identify potential issues.</p>
                             <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 font-semibold">
                                Upload Image
                            </button>
                        </div>
                         <div className="mt-4">
                            <label className="block text-gray-700 mb-2 font-semibold">Environmental Condition</label>
                             <div className="flex space-x-2">
                                {environmentalConditions.map(cond => (
                                     <button 
                                        key={cond.name} 
                                        onClick={() => setThermalCondition(cond.name)}
                                        className={`flex-1 p-2 border rounded-md flex items-center justify-center space-x-2 transition-colors ${
                                            thermalCondition === cond.name ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {cond.icon}<span>{cond.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                     </div>
                     {/* Baseline Image Upload */}
                     <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            <Image className="mr-2 text-green-600" /> Upload Baseline Image (Reference)
                        </h3>
                         <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                            <p className="text-gray-500 mb-4">Upload a reference image for future comparisons under specific environmental conditions.</p>
                            <button className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 font-semibold">
                                Upload Baseline Image
                            </button>
                        </div>
                         <div className="mt-4">
                            <label className="block text-gray-700 mb-2 font-semibold">Environmental Condition</label>
                            <div className="flex space-x-2">
                                {environmentalConditions.map(cond => (
                                     <button 
                                        key={cond.name} 
                                        onClick={() => setBaselineCondition(cond.name)}
                                        className={`flex-1 p-2 border rounded-md flex items-center justify-center space-x-2 transition-colors ${
                                            baselineCondition === cond.name ? 'bg-green-500 text-white border-green-500' : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {cond.icon}<span>{cond.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            </main>
        </div>
    );
};

export default TransformerDetailPage;