import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import Pagination from '../components/common/Pagination';
import AddInspectionModal from '../components/AddInspectionModal';
import EditInspectionModal from '../components/EditInspectionModal';
import { Search, Plus, Star, MoreVertical, ChevronLeft, Filter, Calendar, Clock, Eye, Trash2, Activity, TrendingUp, AlertTriangle, Zap, MapPin, Edit, X, Download } from 'lucide-react';
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
        case 'Completed': return 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-800 border-green-300';
        case 'In Progress': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300';
        case 'Pending': return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300';
        default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Completed': return '✓';
        case 'In Progress': return '⏳';
        case 'Pending': return '⌛';
        default: return '●';
    }
};

const ITEMS_PER_PAGE = 5; // pagination size

const InspectionsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [inspectionToEdit, setInspectionToEdit] = useState<Inspection | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        inspection: Inspection | null;
    }>({ isOpen: false, inspection: null });
    const [annotationsCount, setAnnotationsCount] = useState<number>(0);
    const [isFeedbackExportDropdownOpen, setIsFeedbackExportDropdownOpen] = useState(false);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    const fetchInspections = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/inspections');
            const mappedData = res.data.map((item: any) => ({
                id: item.inspectionNumber,
                inspectionNo: item.inspectionNumber,
                transformerNo: item.transformerNumber,
                inspectionDate: item.inspectionDate,
                inspectionTime: item.inspectionTime,
                branch: item.branch,
                maintenanceDate: item.maintenanceDate,
                maintenanceTime: item.maintenanceTime,
                status: item.status
            }));
            setInspections(mappedData);
        } catch (err) {
            console.error('Error fetching inspections:', err);
        }
    };

    // Show delete confirmation modal
    const showDeleteConfirmation = (inspection: Inspection) => {
        setDeleteConfirmation({ isOpen: true, inspection });
    };

    // Handle delete with confirmation
    const handleDelete = async () => {
        if (!deleteConfirmation.inspection) return;

        try {
            await axios.delete(`http://localhost:8080/api/v1/inspections/${deleteConfirmation.inspection.inspectionNo}`);
            fetchInspections(); // Refresh list after deletion
            setDeleteConfirmation({ isOpen: false, inspection: null });
        } catch (err) {
            console.error('Error deleting inspection:', err);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, inspection: null });
    };

    // Handle edit inspection
    const handleEdit = (inspection: Inspection) => {
        setInspectionToEdit(inspection);
        setIsEditModalOpen(true);
    };

    // Handle modal close
    const handleAddModalClose = () => setIsModalOpen(false);
    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setInspectionToEdit(null);
    };

    // Handle successful add/edit
    const handleAddSuccess = () => {
        fetchInspections();
        handleAddModalClose();
    };
    const handleEditSuccess = () => {
        fetchInspections();
        handleEditModalClose();
    };

    useEffect(() => {
        fetchInspections();
    }, []);

    // Fetch annotations count (including localStorage entries)
    useEffect(() => {
        const fetchAnnotationsCount = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/v1/inspections/analyze/timeline/all');
                let totalCount = res.data.length;
                
                // Add localStorage timeline entries count for each inspection
                // Get all unique inspection numbers from backend timeline
                const inspectionNumbers = [...new Set(res.data.map((entry: any) => {
                    const inspNo = entry.detect?.inspectionNumber || entry.inspectionNumber;
                    return inspNo;
                }).filter(Boolean))];
                
                // Also check all inspections in the list
                inspections.forEach(insp => {
                    if (!inspectionNumbers.includes(insp.inspectionNo)) {
                        inspectionNumbers.push(insp.inspectionNo);
                    }
                });
                
                // Count localStorage entries for all inspections
                inspectionNumbers.forEach((inspNo) => {
                    const storedTimeline = localStorage.getItem(`localTimeline_${inspNo}`);
                    if (storedTimeline) {
                        try {
                            const localEntries = JSON.parse(storedTimeline);
                            totalCount += localEntries.length;
                        } catch (e) {
                            console.error(`Failed to parse localStorage timeline for ${inspNo}:`, e);
                        }
                    }
                });
                
                setAnnotationsCount(totalCount);
            } catch (err) {
                console.error('Error fetching annotations count:', err);
                // If API fails, still try to count localStorage entries
                let localCount = 0;
                inspections.forEach(insp => {
                    const storedTimeline = localStorage.getItem(`localTimeline_${insp.inspectionNo}`);
                    if (storedTimeline) {
                        try {
                            const localEntries = JSON.parse(storedTimeline);
                            localCount += localEntries.length;
                        } catch (e) {
                            console.error(`Failed to parse localStorage timeline for ${insp.inspectionNo}:`, e);
                        }
                    }
                });
                setAnnotationsCount(localCount);
            }
        };
        fetchAnnotationsCount();
    }, [inspections]);

    const [filters, setFilters] = useState({
        transformerNo: "",
        inspectionNo: "",
        inspectionDate: "",
        maintenanceDate: "",
        status: ""
    });

    const filteredInspections = inspections.filter((insp) => {
        return (
            (filters.transformerNo === "" || insp.transformerNo.toLowerCase().includes(filters.transformerNo.toLowerCase())) &&
            (filters.inspectionNo === "" || insp.inspectionNo.toLowerCase().includes(filters.inspectionNo.toLowerCase())) &&
            (filters.inspectionDate === "" || insp.inspectionDate === filters.inspectionDate) &&
            (filters.maintenanceDate === "" || insp.maintenanceDate === filters.maintenanceDate) &&
            (filters.status === "" || insp.status === filters.status)
        );
    });

    // --- pagination derived data ---
    const totalPages = Math.max(1, Math.ceil(filteredInspections.length / ITEMS_PER_PAGE));
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pagedInspections = filteredInspections.slice(start, start + ITEMS_PER_PAGE);

    // reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // clamp current page if list shrinks
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    // Reset all filters
    const resetFilters = () => {
        setFilters({ transformerNo: "", inspectionNo: "", inspectionDate: "", maintenanceDate: "", status: "" });
    };

    // Export All Feedback Logs to CSV
    const exportAllFeedbackLogsToCSV = async () => {
        try {
            const [detectionsRes, timelineRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/inspections/analyze/all'),
                axios.get('http://localhost:8080/api/v1/inspections/analyze/timeline/all')
            ]);

            const allDetections = detectionsRes.data;
            let allTimeline = timelineRes.data;
            
            // Load local timeline entries from localStorage for each inspection
            // Backend doesn't properly save Add and Delete operations, so we need to check localStorage
            const inspectionNumbers = [...new Set(allDetections.map((d: any) => d.inspectionNumber).filter(Boolean))];
            inspectionNumbers.forEach((inspNo) => {
                const storedTimeline = localStorage.getItem(`localTimeline_${inspNo}`);
                if (storedTimeline) {
                    try {
                        const localEntries = JSON.parse(storedTimeline);
                        allTimeline = [...allTimeline, ...localEntries];
                    } catch (e) {
                        console.error(`Failed to parse localStorage timeline for ${inspNo}:`, e);
                    }
                }
            });

            const feedbackLog: any[] = [];
            const detectionsByInspection: { [key: string]: any[] } = {};
            allDetections.forEach((detection: any) => {
                const inspNo = detection.inspectionNumber || 'unknown';
                if (!detectionsByInspection[inspNo]) {
                    detectionsByInspection[inspNo] = [];
                }
                detectionsByInspection[inspNo].push(detection);
            });

            // Group timeline by detection ID (handle both backend and localStorage structures)
            const timelineByDetectId: { [key: string]: any[] } = {};
            allTimeline.forEach((entry: any) => {
                // Backend entries have detect.detectId, localStorage entries have anotationId
                const detectId = entry.detect?.detectId || entry.anotationId;
                if (detectId) {
                    if (!timelineByDetectId[detectId]) {
                        timelineByDetectId[detectId] = [];
                    }
                    timelineByDetectId[detectId].push(entry);
                }
            });

            const addedDetectIds = new Set<number>();
            allTimeline.forEach((entry: any) => {
                if (entry.type === 'add') {
                    // Backend entries have detect.detectId, localStorage entries have anotationId
                    const detectId = entry.detect?.detectId || entry.anotationId;
                    if (detectId) {
                        addedDetectIds.add(detectId);
                    }
                }
            });

            Object.entries(detectionsByInspection).forEach(([inspectionNo, detections]) => {
                detections.forEach((detection: any) => {
                    const detectId = detection.detectId;
                    const isUserAdded = addedDetectIds.has(detectId);
                    const relatedTimeline = timelineByDetectId[detectId] || [];
                    
                    const editAnnotation = relatedTimeline.find((a: any) => a.type === 'edit');
                    const deleteAnnotation = relatedTimeline.find((a: any) => a.type === 'delete');
                    const addAnnotation = relatedTimeline.find((a: any) => a.type === 'add');

                    if (isUserAdded) {
                        feedbackLog.push({
                            imageId: inspectionNo,
                            predictedBy: "annotator",
                            confidence: 1,
                            type: detection.className,
                            accepted: true,
                            boundingBoxX: detection.x,
                            boundingBoxY: detection.y,
                            boundingBoxWidth: detection.width,
                            boundingBoxHeight: detection.height,
                            annotatorUser: addAnnotation ? addAnnotation.author : '',
                            annotatorTime: addAnnotation ? addAnnotation.createdAt : '',
                            annotatorComment: addAnnotation ? addAnnotation.comment : ''
                        });
                    } else {
                        if (editAnnotation) {
                            feedbackLog.push({
                                imageId: inspectionNo,
                                predictedBy: "Model",
                                confidence: detection.confidence,
                                type: detection.className,
                                accepted: false,
                                boundingBoxX: detection.x,
                                boundingBoxY: detection.y,
                                boundingBoxWidth: detection.width,
                                boundingBoxHeight: detection.height,
                                annotatorUser: '',
                                annotatorTime: '',
                                annotatorComment: ''
                            });

                            feedbackLog.push({
                                imageId: inspectionNo,
                                predictedBy: "annotator",
                                confidence: 1,
                                type: detection.className,
                                accepted: true,
                                boundingBoxX: detection.x,
                                boundingBoxY: detection.y,
                                boundingBoxWidth: detection.width,
                                boundingBoxHeight: detection.height,
                                annotatorUser: editAnnotation.author,
                                annotatorTime: editAnnotation.createdAt,
                                annotatorComment: editAnnotation.comment
                            });
                        } else if (deleteAnnotation) {
                            feedbackLog.push({
                                imageId: inspectionNo,
                                predictedBy: "Model",
                                confidence: detection.confidence,
                                type: detection.className,
                                accepted: false,
                                boundingBoxX: detection.x,
                                boundingBoxY: detection.y,
                                boundingBoxWidth: detection.width,
                                boundingBoxHeight: detection.height,
                                annotatorUser: deleteAnnotation.author,
                                annotatorTime: deleteAnnotation.createdAt,
                                annotatorComment: deleteAnnotation.comment
                            });
                        } else {
                            feedbackLog.push({
                                imageId: inspectionNo,
                                predictedBy: "Model",
                                confidence: detection.confidence,
                                type: detection.className,
                                accepted: true,
                                boundingBoxX: detection.x,
                                boundingBoxY: detection.y,
                                boundingBoxWidth: detection.width,
                                boundingBoxHeight: detection.height,
                                annotatorUser: '',
                                annotatorTime: '',
                                annotatorComment: ''
                            });
                        }
                    }
                });
            });

            // Create CSV content
            const headers = [
                'Image ID',
                'Predicted By',
                'Confidence',
                'Type',
                'Accepted',
                'Bounding Box X',
                'Bounding Box Y',
                'Bounding Box Width',
                'Bounding Box Height',
                'Annotator User',
                'Annotator Time',
                'Annotator Comment'
            ];

            const csvRows = feedbackLog.map(entry => [
                entry.imageId,
                entry.predictedBy,
                entry.confidence,
                entry.type,
                entry.accepted,
                entry.boundingBoxX,
                entry.boundingBoxY,
                entry.boundingBoxWidth,
                entry.boundingBoxHeight,
                entry.annotatorUser,
                entry.annotatorTime,
                entry.annotatorComment
            ].map(val => `"${val}"`).join(','));

            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `feedback_log_all_inspections_${date}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting feedback log to CSV:', error);
        }
    };

    // Export All Feedback Logs to JSON - FR3.3: Feedback Integration for Model Improvement
    const exportAllFeedbackLogsToJSON = async () => {
        try {
            // Fetch all detections and timeline data
            const [detectionsRes, timelineRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/inspections/analyze/all'),
                axios.get('http://localhost:8080/api/v1/inspections/analyze/timeline/all')
            ]);

            const allDetections = detectionsRes.data;
            let allTimeline = timelineRes.data;
            
            // Load local timeline entries from localStorage for each inspection
            // Backend doesn't properly save Add and Delete operations, so we need to check localStorage
            const inspectionNumbers = [...new Set(allDetections.map((d: any) => d.inspectionNumber).filter(Boolean))];
            inspectionNumbers.forEach((inspNo) => {
                const storedTimeline = localStorage.getItem(`localTimeline_${inspNo}`);
                if (storedTimeline) {
                    try {
                        const localEntries = JSON.parse(storedTimeline);
                        allTimeline = [...allTimeline, ...localEntries];
                    } catch (e) {
                        console.error(`Failed to parse localStorage timeline for ${inspNo}:`, e);
                    }
                }
            });

            const feedbackLog: any[] = [];
            const detectionsByInspection: { [key: string]: any[] } = {};
            allDetections.forEach((detection: any) => {
                const inspNo = detection.inspectionNumber || 'unknown';
                if (!detectionsByInspection[inspNo]) {
                    detectionsByInspection[inspNo] = [];
                }
                detectionsByInspection[inspNo].push(detection);
            });

            // Group timeline by detection ID (handle both backend and localStorage structures)
            const timelineByDetectId: { [key: string]: any[] } = {};
            allTimeline.forEach((entry: any) => {
                // Backend entries have detect.detectId, localStorage entries have anotationId
                const detectId = entry.detect?.detectId || entry.anotationId;
                if (detectId) {
                    if (!timelineByDetectId[detectId]) {
                        timelineByDetectId[detectId] = [];
                    }
                    timelineByDetectId[detectId].push(entry);
                }
            });

            // Track which detection IDs are user-added (have 'add' annotation)
            const addedDetectIds = new Set<number>();
            allTimeline.forEach((entry: any) => {
                if (entry.type === 'add') {
                    // Backend entries have detect.detectId, localStorage entries have anotationId
                    const detectId = entry.detect?.detectId || entry.anotationId;
                    if (detectId) {
                        addedDetectIds.add(detectId);
                    }
                }
            });

            // Process each inspection's detections
            Object.entries(detectionsByInspection).forEach(([inspectionNo, detections]) => {
                detections.forEach((detection: any) => {
                    const detectId = detection.detectId;
                    const isUserAdded = addedDetectIds.has(detectId);
                    const relatedTimeline = timelineByDetectId[detectId] || [];
                    
                    const editAnnotation = relatedTimeline.find((a: any) => a.type === 'edit');
                    const deleteAnnotation = relatedTimeline.find((a: any) => a.type === 'delete');
                    const addAnnotation = relatedTimeline.find((a: any) => a.type === 'add');

                    if (isUserAdded) {
                        // User-added anomaly: only one entry
                        feedbackLog.push({
                            imageId: inspectionNo,
                            "predicted by": "annotator",
                            confidence: 1,
                            type: detection.className,
                            accepted: true,
                            boundingBox: {
                                x: detection.x,
                                y: detection.y,
                                width: detection.width,
                                height: detection.height
                            },
                            "annotator metadata": addAnnotation ? {
                                user: addAnnotation.author,
                                time: addAnnotation.createdAt,
                                comment: addAnnotation.comment
                            } : null
                        });
                    } else {
                        // Model-generated anomaly
                        if (editAnnotation) {
                            // EDITED: Keep original model prediction with accepted=false
                            feedbackLog.push({
                                imageId: inspectionNo,
                                "predicted by": "Model",
                                confidence: detection.confidence,
                                type: detection.className,
                                accepted: false,
                                boundingBox: {
                                    x: detection.x,
                                    y: detection.y,
                                    width: detection.width,
                                    height: detection.height
                                },
                                "annotator metadata": null
                            });

                            // Add new entry with edited position
                            feedbackLog.push({
                                imageId: inspectionNo,
                                "predicted by": "annotator",
                                confidence: 1,
                                type: detection.className,
                                accepted: true,
                                boundingBox: {
                                    x: detection.x,
                                    y: detection.y,
                                    width: detection.width,
                                    height: detection.height
                                },
                                "annotator metadata": {
                                    user: editAnnotation.author,
                                    time: editAnnotation.createdAt,
                                    comment: editAnnotation.comment
                                }
                            });
                        } else if (deleteAnnotation) {
                            // DELETED: Keep original model prediction with accepted=false
                            feedbackLog.push({
                                imageId: inspectionNo,
                                "predicted by": "Model",
                                confidence: detection.confidence,
                                type: detection.className,
                                accepted: false,
                                boundingBox: {
                                    x: detection.x,
                                    y: detection.y,
                                    width: detection.width,
                                    height: detection.height
                                },
                                "annotator metadata": {
                                    user: deleteAnnotation.author,
                                    time: deleteAnnotation.createdAt,
                                    comment: deleteAnnotation.comment
                                }
                            });
                        } else {
                            // UNCHANGED: Keep original model prediction with accepted=true
                            feedbackLog.push({
                                imageId: inspectionNo,
                                "predicted by": "Model",
                                confidence: detection.confidence,
                                type: detection.className,
                                accepted: true,
                                boundingBox: {
                                    x: detection.x,
                                    y: detection.y,
                                    width: detection.width,
                                    height: detection.height
                                },
                                "annotator metadata": null
                            });
                        }
                    }
                });
            });

            // Create and download JSON file
            const jsonString = JSON.stringify(feedbackLog, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `feedback_log_all_inspections_${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting feedback log:', error);
        }
    };

    return (
        <PageLayout title="Transformer > All Inspections">
            {/* Add Modal */}
            <AddInspectionModal 
                isOpen={isModalOpen} 
                onClose={handleAddModalClose}
                onAddSuccess={handleAddSuccess}
            />

            {/* Edit Modal */}
            <EditInspectionModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                inspectionToEdit={inspectionToEdit}
                onEditSuccess={handleEditSuccess}
            />

            {/* Delete Confirmation Modal */}
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
                                Are you sure you want to delete inspection{' '}
                                <span className="font-bold text-red-600">
                                    {deleteConfirmation.inspection?.inspectionNo}
                                </span>?
                            </p>
                            <p className="text-gray-600">
                                This action cannot be undone. All data associated with this inspection will be permanently removed.
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

                {/* Enhanced Header - Similar to Transformers */}
                <div className="bg-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">

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
                        className="px-4 py-2 rounded-xl text-lg font-semibold border transition-all duration-200 
                                    flex items-center space-x-2
                                    bg-white text-black border-gray-300 hover:bg-gray-50
                                    dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700
                                    [&_svg]:stroke-black dark:[&_svg]:stroke-white"
                        >
                        <ChevronLeft size={22} />
                        </button>



                                <div className="flex items-center space-x-4">
                                    <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
                                        <Activity size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-5xl font-bold text-gray-800">
                                            Transformer Inspections
                                        </h1>
                                        <p className="text-xl mt-2 font-medium text-gray-700">
                                            Monitor and manage transformer inspection records
                                        </p>
                                    </div>
                                </div>
                                
                                <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 
                                            text-white px-8 py-4 rounded-2xl 
                                            hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 
                                            text-lg font-bold shadow-2xl 
                                            transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ml-8
                                            [&_*]:text-white [&_svg]:stroke-white"
                                >
                                <Plus size={24} className="mr-3" />
                                <span>Add Inspection</span>
                                </button>


                            </div>
                            
                            {/* Enhanced Tab Navigation */}
                            <div className="flex items-center bg-white/90 p-2 rounded-2xl shadow-lg border border-amber-200 backdrop-blur-sm">
                            <button
                            onClick={() => navigate('/transformers')}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 
                                        text-white rounded-xl text-lg font-semibold 
                                        hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 
                                        transition-all duration-300 flex items-center space-x-2 
                                        shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 
                                        border border-blue-400/20
                                        [&_*]:text-white [&_svg]:stroke-white"
                            >
                            <Zap size={20} />
                            <span>Transformers</span>
                            </button>
                            <button 
                            className="inline-flex items-center bg-gradient-to-r from-gray-500 to-gray-700 
                                        text-white px-4 py-2 rounded-xl 
                                        hover:from-gray-600 hover:to-gray-800 
                                        text-sm font-bold transition-all duration-300 
                                        shadow-lg hover:shadow-xl transform hover:scale-105
                                        [&_*]:text-white [&_svg]:stroke-white"
                            >
                            <Activity size={20} />
                            <span>Inspections</span>
                            </button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Log Export Section - FR3.3 */}
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 relative overflow-visible">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-bold text-red-600 mb-2">Feedback Log</h3>
                            <p className="text-gray-600 text-lg mb-3">Export feedback data for all inspections to improve AI model accuracy</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-700 font-semibold text-lg">Total Annotations Changes:</span>
                                <span className="text-2xl font-bold text-red-600">{annotationsCount}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsFeedbackExportDropdownOpen(!isFeedbackExportDropdownOpen)}
                                className="flex items-center bg-black text-white px-8 py-4 rounded-2xl 
                                            hover:bg-gray-800 text-lg font-bold shadow-2xl 
                                            transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                                            [&_*]:text-white [&_svg]:stroke-white"
                            >
                                <Download size={24} className="mr-3" />
                                <span>Export</span>
                            </button>
                            {isFeedbackExportDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-[9998]" 
                                        onClick={() => setIsFeedbackExportDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-[9999]">
                                        <button
                                            onClick={() => {
                                                exportAllFeedbackLogsToJSON();
                                                setIsFeedbackExportDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-semibold transition-colors"
                                        >
                                            Export as JSON
                                        </button>
                                        <button
                                            onClick={() => {
                                                exportAllFeedbackLogsToCSV();
                                                setIsFeedbackExportDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-semibold transition-colors border-t border-gray-200"
                                        >
                                            Export as CSV
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Table Container */}
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 via-gray-100 to-slate-50 px-8 py-6 border-b-2 border-gray-200">
                        <h3 className="text-3xl font-bold text-gray-800 flex items-center">
                            <div className="p-3 bg-amber-100 rounded-xl mr-4">
                                <Activity size={28} className="text-amber-600" />
                            </div>
                            Inspection Records
                        </h3>
                    </div>

                    {/* Fixed-height content so pagination stays put */}
                    <div className="min-h-[560px] flex flex-col">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 border-b-2 border-gray-200 sticky top-0">
                                    <tr>
                                        <th className="p-6 w-12 text-center">
                                            <Star size={18} className="text-gray-400 mx-auto" />
                                        </th>
                                        <th className="p-6 text-left text-base md:text-lg font-extrabold text-gray-900 uppercase tracking-wide">
                                            <div className="flex items-center space-x-2">
                                                <Zap size={16} />
                                                <span>Transformer No.</span>
                                            </div>
                                        </th>
                                        <th className="p-6 text-left text-base md:text-lg font-extrabold text-gray-900 uppercase tracking-wide">
                                            <div className="flex items-center space-x-2">
                                                <span>📋</span>
                                                <span>Inspection No</span>
                                            </div>
                                        </th>
                                        <th className="p-6 text-left text-base md:text-lg font-extrabold text-gray-900 uppercase tracking-wide">
                                            <div className="flex items-center space-x-2">
                                                <Calendar size={16} />
                                                <span>Inspected Date</span>
                                            </div>
                                        </th>
                                        <th className="p-6 text-left text-base md:text-lg font-extrabold text-gray-900 uppercase tracking-wide">
                                            <div className="flex items-center space-x-2">
                                                <Clock size={16} />
                                                <span>Maintenance Date</span>
                                            </div>
                                        </th>
                                        <th className="p-6 text-left text-base md:text-lg font-extrabold text-gray-900 uppercase tracking-wide">
                                            <div className="flex items-center space-x-2">
                                                <span>⚡</span>
                                                <span>Status</span>
                                            </div>
                                        </th>
                                        <th className="p-6 text-center text-base md:text-lg font-extrabold text-gray-900 uppercase tracking-wide">Actions</th>
                                    </tr>

                                    {/* Enhanced Filter Row */}
                                    <tr className="bg-white border-b border-gray-200">
                                        <th></th>
                                        <th className="p-4">
                                            <input
                                                type="text"
                                                placeholder="Filter..."
                                                className="w-full px-4 py-3 text-base md:text-lg border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                                value={filters.transformerNo}
                                                onChange={(e) => setFilters({ ...filters, transformerNo: e.target.value })}
                                            />
                                        </th>
                                        <th className="p-4">
                                            <input
                                                type="text"
                                                placeholder="Filter..."
                                                className="w-full px-4 py-3 text-base md:text-lg border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                                value={filters.inspectionNo}
                                                onChange={(e) => setFilters({ ...filters, inspectionNo: e.target.value })}
                                            />
                                        </th>
                                        <th className="p-4">
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3 text-base md:text-lg border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                                value={filters.inspectionDate}
                                                onChange={(e) => setFilters({ ...filters, inspectionDate: e.target.value })}
                                            />
                                        </th>
                                        <th className="p-4">
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3 text-base md:text-lg border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                                value={filters.maintenanceDate}
                                                onChange={(e) => setFilters({ ...filters, maintenanceDate: e.target.value })}
                                            />
                                        </th>
                                        <th className="p-4">
                                            <select
                                                className="w-full px-4 py-3 text-base md:text-lg border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 hover:shadow-sm font-medium"
                                                value={filters.status}
                                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            >
                                                <option value="">All</option>
                                                <option value="Completed">Completed</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {pagedInspections.map((insp, index) => (
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
                                                        <span className="text-xl md:text-2xl font-extrabold text-gray-900 group-hover:text-amber-600 transition-colors">{insp.transformerNo}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-xl md:text-2xl font-bold text-gray-900">{insp.inspectionNo}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <Calendar size={16} className="text-purple-600" />
                                                    </div>
                                                    <span className="text-xl md:text-2xl font-semibold text-gray-900">{insp.inspectionDate}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <Clock size={16} className="text-orange-600" />
                                                    </div>
                                                    <span className="text-xl md:text-2xl font-semibold text-gray-900">{insp.maintenanceDate || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`inline-flex items-center px-5 py-3 rounded-xl text-base md:text-lg font-bold border-2 shadow-md ${getStatusClass(insp.status)}`}>
                                                    <span className="mr-2">{getStatusIcon(insp.status)}</span>
                                                    {insp.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex items-center justify-center space-x-3">
                                            <button 
                                            onClick={() => navigate(`/inspections/${insp.inspectionNo}/upload`)}
                                            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 
                                                        text-white px-4 py-2 rounded-xl 
                                                        hover:from-blue-600 hover:to-indigo-600 
                                                        text-sm font-bold transition-all duration-300 
                                                        shadow-lg hover:shadow-xl transform hover:scale-105
                                                        [&_*]:text-white [&_svg]:stroke-white"
                                            >
                                            <Eye size={16} className="mr-2" />
                                            <span>View</span>
                                            </button>
                                            <button 
                                            onClick={() => handleEdit(insp)}
                                            className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 
                                                        text-white px-4 py-2 rounded-xl 
                                                        hover:from-emerald-600 hover:to-teal-600 
                                                        text-sm font-bold transition-all duration-300 
                                                        shadow-lg hover:shadow-xl transform hover:scale-105
                                                        [&_*]:text-white [&_svg]:stroke-white"
                                            >
                                            <Edit size={16} className="mr-2" />
                                            <span>Edit</span>
                                            </button>

                                            <button 
                                            onClick={() => showDeleteConfirmation(insp)}
                                            className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 
                                                        text-white px-4 py-2 rounded-xl 
                                                        hover:from-red-600 hover:to-red-700 
                                                        text-sm font-bold transition-all duration-300 
                                                        shadow-lg hover:shadow-xl transform hover:scale-105
                                                        [&_*]:text-white [&_svg]:stroke-white"
                                            >
                                            <Trash2 size={16} className="mr-2" />
                                            <span>Delete</span>
                                            </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Empty state kept inside the fixed-height area */}
                            {filteredInspections.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="text-8xl mb-6">🔍</div>
                                    <h3 className="text-3xl font-extrabold text-gray-700 mb-3">No Inspections Found</h3>
                                    <p className="text-lg md:text-xl text-gray-600">Try adjusting your search criteria or add a new inspection to get started.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer always rendered so pagination doesn't move */}
                        <div className="px-6 py-5 border-t">
                            {filteredInspections.length > 0 ? (
                                <div className="flex flex-col sm:flex-row items-center justify-between">
                                    <p className="text-base md:text-lg text-gray-700 mb-3 sm:mb-0">
                                        Showing{' '}
                                        <span className="font-semibold">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                        </span>{' '}
                                        –{' '}
                                        <span className="font-semibold">
                                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredInspections.length)}
                                        </span>{' '}
                                        of <span className="font-semibold">{filteredInspections.length}</span> inspections
                                    </p>

                                    <Pagination
                                        page={currentPage}
                                        totalPages={totalPages}
                                        onChange={(p: number) => {
                                            if (p >= 1 && p <= totalPages) setCurrentPage(p);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="h-6" />
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </PageLayout>
    );
};

export default InspectionsPage;
