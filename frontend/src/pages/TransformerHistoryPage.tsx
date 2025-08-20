import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import { ChevronLeft, Calendar, MapPin, Zap, Thermometer, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const TransformerHistoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for transformer history
    const transformerInfo = {
        no: id || 'AZ-8890',
        pole: 'EN-122-A',
        region: 'Nugegoda',
        type: 'Bulk',
        location: 'Nugegoda "Keels", Embuldeniya',
        capacity: '102.97 kVA',
        feeders: 2,
        installDate: '15 Jan, 2020',
        lastInspection: '21 May, 2023 12:55 PM'
    };

    const inspectionHistory = [
        {
            date: '21 May, 2023 12:55 PM',
            inspector: 'John Silva',
            status: 'Completed',
            temperature: '68°C',
            condition: 'Good',
            notes: 'All parameters within normal range. No issues detected.',
            type: 'Routine Inspection'
        },
        {
            date: '15 Feb, 2023 09:30 AM',
            inspector: 'Maria Fernando',
            status: 'Completed',
            temperature: '72°C',
            condition: 'Good',
            notes: 'Minor oil leak detected, maintenance scheduled.',
            type: 'Routine Inspection'
        },
        {
            date: '20 Nov, 2022 14:15 PM',
            inspector: 'Kamal Perera',
            status: 'Completed',
            temperature: '75°C',
            condition: 'Warning',
            notes: 'Temperature slightly elevated, recommend monitoring.',
            type: 'Emergency Inspection'
        },
        {
            date: '10 Aug, 2022 11:00 AM',
            inspector: 'Sarah Jones',
            status: 'Completed',
            temperature: '65°C',
            condition: 'Excellent',
            notes: 'Transformer operating optimally.',
            type: 'Routine Inspection'
        }
    ];

    const getStatusIcon = (condition: string) => {
        switch (condition) {
            case 'Excellent':
            case 'Good':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'Warning':
                return <AlertTriangle className="text-yellow-500" size={20} />;
            default:
                return <AlertTriangle className="text-red-500" size={20} />;
        }
    };

    const getConditionClass = (condition: string) => {
        switch (condition) {
            case 'Excellent': return 'bg-green-100 text-green-800';
            case 'Good': return 'bg-green-100 text-green-800';
            case 'Warning': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-red-100 text-red-800';
        }
    };

    return (
        <PageLayout title={`Transformer Details - ${transformerInfo.no}`}>
            {/* Header with Back Button */}
            <div className="flex-shrink-0 flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/transformers')} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{transformerInfo.no}</h2>
                        <p className="text-gray-600">{transformerInfo.location}</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/transformers/${id}/upload`)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition-all duration-200"
                >
                    Upload Images
                </button>
            </div>

            {/* Transformer Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-semibold">Pole Number</p>
                            <p className="text-xl font-bold text-blue-800">{transformerInfo.pole}</p>
                        </div>
                        <MapPin className="text-blue-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-semibold">Capacity</p>
                            <p className="text-xl font-bold text-green-800">{transformerInfo.capacity}</p>
                        </div>
                        <Zap className="text-green-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-600 text-sm font-semibold">Type</p>
                            <p className="text-xl font-bold text-purple-800">{transformerInfo.type}</p>
                        </div>
                        <Thermometer className="text-purple-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-semibold">Feeders</p>
                            <p className="text-xl font-bold text-orange-800">{transformerInfo.feeders}</p>
                        </div>
                        <Zap className="text-orange-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Inspection History */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Inspection History</h3>
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold">Last Inspection:</span> {transformerInfo.lastInspection}
                    </div>
                </div>

                <div className="space-y-4">
                    {inspectionHistory.map((inspection, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStatusIcon(inspection.condition)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="font-bold text-gray-800">{inspection.type}</h4>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConditionClass(inspection.condition)}`}>
                                                {inspection.condition}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Calendar size={16} />
                                                <span>{inspection.date}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Thermometer size={16} />
                                                <span>{inspection.temperature}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold">Inspector:</span>
                                                <span>{inspection.inspector}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{inspection.notes}</p>
                                    </div>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default TransformerHistoryPage;