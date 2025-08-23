import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header'; // Assuming Header component exists
import { UploadCloud, Image, Sun, Cloud, CloudRain, Upload, X, ChevronLeft, Check } from 'lucide-react';
import axios from 'axios';

// Define the structure for an image object
interface ImageDetails {
    url: string;
    fileName: string;
    condition: string;
    date: string;
}

// Define the structure for the upload progress modal
interface UploadProgress {
    isVisible: boolean;
    progress: number;
    fileName: string;
    type: 'thermal' | 'baseline';
}

const InspectionDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const thermalInputRef = useRef<HTMLInputElement>(null);
    const baselineInputRef = useRef<HTMLInputElement>(null);

    // --- State Management ---
    const [isLoading, setIsLoading] = useState(true);
    const [inspectionLocation, setInspectionLocation] = useState('');
    const [thermalCondition, setThermalCondition] = useState('Sunny');
    const [baselineCondition, setBaselineCondition] = useState('Sunny');
    
    const [thermalImage, setThermalImage] = useState<ImageDetails | null>(null);
    const [baselineImage, setBaselineImage] = useState<ImageDetails | null>(null);

    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        isVisible: false,
        progress: 0,
        fileName: '',
        type: 'thermal'
    });

    // --- Data Fetching on Load ---
    useEffect(() => {
        const fetchAndCheckData = async () => {
            if (!id) return;
            setIsLoading(true);

            // Fetch main inspection details (like location)
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/inspections/${id}`);
                setInspectionLocation(res.data.location || 'Unknown Location');
            } catch (error) {
                console.error("Could not fetch inspection details:", error);
                setInspectionLocation('Details not found');
            }

            // --- UPDATED: Check for BOTH baseline and thermal images ---
            const baselineImageUrl = `http://localhost:8080/api/v1/transformers/${id}/image`;
            const thermalImageUrl = `http://localhost:8080/api/v1/inspections/${id}/image`;

            // Check for baseline image
            try {
                await axios.head(baselineImageUrl);
                setBaselineImage({
                    url: baselineImageUrl,
                    fileName: `baseline_${id}.jpg`,
                    condition: 'N/A',
                    date: 'Existing',
                });
            } catch (error) {
                console.log("No existing baseline image found.");
                setBaselineImage(null);
            }

            // Check for thermal image
            try {
                await axios.head(thermalImageUrl);
                setThermalImage({
                    url: thermalImageUrl,
                    fileName: `thermal_${id}.jpg`,
                    condition: 'N/A',
                    date: 'Existing',
                });
            } catch (error) {
                console.log("No existing thermal image found.");
                setThermalImage(null);
            }

            setIsLoading(false);
        };

        fetchAndCheckData();
    }, [id]);

    const environmentalConditions = [
        { name: 'Sunny', icon: <Sun size={16} /> },
        { name: 'Cloudy', icon: <Cloud size={16} /> },
        { name: 'Rainy', icon: <CloudRain size={16} /> },
    ];

    // --- UPDATED Image Upload Logic ---
    const uploadImage = async (file: File, type: 'thermal' | 'baseline', condition: string) => {
        setUploadProgress({ isVisible: true, progress: 0, fileName: file.name, type });

        const formData = new FormData();
        formData.append('image', file);
        
        // Determine the correct API endpoint based on the image type
        const uploadUrl = type === 'thermal'
            ? `http://localhost:8080/api/v1/inspections/${id}/image`
            : `http://localhost:8080/api/v1/transformers/${id}/image`;

        try {
            await axios.post(uploadUrl, formData, {
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total || file.size;
                    const progress = Math.round((progressEvent.loaded * 100) / total);
                    setUploadProgress(prev => ({ ...prev, progress }));
                }
            });

            const newImage: ImageDetails = {
                url: URL.createObjectURL(file),
                fileName: file.name,
                condition: condition,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            };

            if (type === 'thermal') {
                setThermalImage(newImage);
            } else {
                setBaselineImage(newImage);
            }

            setTimeout(() => setUploadProgress(prev => ({ ...prev, isVisible: false })), 1000);

        } catch (err) {
            console.error('Upload failed:', err);
            setUploadProgress(prev => ({ ...prev, isVisible: false }));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'thermal' | 'baseline') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const condition = type === 'thermal' ? thermalCondition : baselineCondition;
            uploadImage(files[0], type, condition);
        }
    };

    const handleDrop = (e: React.DragEvent, type: 'thermal' | 'baseline') => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            const condition = type === 'thermal' ? thermalCondition : baselineCondition;
            uploadImage(files[0], type, condition);
        }
    };
    
    const ProgressModal = () => {
        if (!uploadProgress.isVisible) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                    <div className="text-center">
                        <Upload className="mx-auto mb-4 text-blue-600" size={48} />
                        <h3 className="text-xl font-bold mb-2">Uploading {uploadProgress.type} Image</h3>
                        <p className="text-gray-600 mb-4 truncate">{uploadProgress.fileName}</p>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                            <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${uploadProgress.progress}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-600">{uploadProgress.progress}% completed</p>
                        {uploadProgress.progress === 100 && (
                            <div className="flex items-center justify-center mt-4 text-green-600">
                                <Check size={20} className="mr-2" />
                                <span className="font-semibold">Upload Complete!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Inspection Details" breadcrumb={`Inspection > ${id}`} />
            <ProgressModal />

            <main className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{id}</h2>
                        <p className="text-gray-500 text-lg mt-1">{inspectionLocation}</p>
                    </div>
                </div>

                {thermalImage && baselineImage && (
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">Image Comparison</h3>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column 1: Thermal Image (Upload or Display) */}
                    {thermalImage ? (
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-blue-600">Thermal Image</h4>
                            <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                                <img src={thermalImage.url} alt="Thermal" className="w-full h-64 object-cover" />
                                <div className="p-4 bg-blue-50 text-sm text-gray-600">
                                    <p><strong>Condition:</strong> {thermalImage.condition}</p>
                                    <p><strong>File:</strong> {thermalImage.fileName}</p>
                                    <p><strong>Date:</strong> {thermalImage.date}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                                <UploadCloud className="mr-3 text-blue-600" size={24} /> Upload Thermal Image
                            </h3>
                            <div className="border-2 border-dashed border-blue-300 rounded-xl p-10 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer" onDrop={(e) => handleDrop(e, 'thermal')} onDragOver={(e) => e.preventDefault()} onClick={() => thermalInputRef.current?.click()}>
                                <div className="flex flex-col items-center">
                                    <Upload className="text-blue-500 mb-4" size={48} />
                                    <p className="text-gray-600 mb-2 text-lg font-semibold">Drop thermal image here</p>
                                    <p className="text-gray-500 mb-6">or click to browse files</p>
                                    <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center">
                                        <UploadCloud className="mr-2" size={20} /> Choose File
                                    </button>
                                </div>
                            </div>
                            <input ref={thermalInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'thermal')} />
                            <div className="mt-6">
                                <label className="block text-gray-800 mb-3 font-bold text-lg">Environmental Condition</label>
                                <div className="flex space-x-3">
                                    {environmentalConditions.map(cond => (
                                        <button key={cond.name} onClick={() => setThermalCondition(cond.name)} className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold ${ thermalCondition === cond.name ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105' : 'hover:bg-blue-50 border-gray-300 hover:border-blue-300' }`}>
                                            {cond.icon}<span>{cond.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Column 2: Baseline Image (Display or Upload) */}
                    {baselineImage ? (
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-green-600">Baseline Image</h4>
                            <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                                <img src={baselineImage.url} alt="Baseline" className="w-full h-64 object-cover" />
                                <div className="p-4 bg-green-50 text-sm text-gray-600">
                                    <p><strong>File:</strong> {baselineImage.fileName}</p>
                                    <p><strong>Date:</strong> {baselineImage.date}</p>
                                </div>
                            </div>
                             <div className="mt-4 text-center">
                                <button onClick={() => setBaselineImage(null)} className="text-red-600 hover:text-red-800 font-semibold">
                                    Replace Baseline Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                             <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                                <Image className="mr-3 text-green-600" size={24} /> Upload Baseline Image
                            </h3>
                            <div className="border-2 border-dashed border-green-300 rounded-xl p-10 text-center bg-green-50 hover:bg-green-100 transition-colors cursor-pointer" onDrop={(e) => handleDrop(e, 'baseline')} onDragOver={(e) => e.preventDefault()} onClick={() => baselineInputRef.current?.click()}>
                                <div className="flex flex-col items-center">
                                    <Upload className="text-green-500 mb-4" size={48} />
                                    <p className="text-gray-600 mb-2 text-lg font-semibold">Drop baseline image here</p>
                                    <p className="text-gray-500 mb-6">or click to browse files</p>
                                    <button className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center">
                                        <Image className="mr-2" size={20} /> Choose File
                                    </button>
                                </div>
                            </div>
                            <input ref={baselineInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'baseline')} />
                            <div className="mt-6">
                                <label className="block text-gray-800 mb-3 font-bold text-lg">Environmental Condition</label>
                                <div className="flex space-x-3">
                                    {environmentalConditions.map(cond => (
                                        <button key={cond.name} onClick={() => setBaselineCondition(cond.name)} className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold ${ baselineCondition === cond.name ? 'bg-green-600 text-white border-green-600 shadow-lg transform scale-105' : 'hover:bg-green-50 border-gray-300 hover:border-green-300' }`}>
                                            {cond.icon}<span>{cond.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InspectionDetailPage;