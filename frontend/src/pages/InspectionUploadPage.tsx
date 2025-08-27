import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout'; // Using the main layout
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

const InspectionUploadPage = () => {
    // 1. Get 'inspectionNo' from the URL parameters.
    const { inspectionNo } = useParams<{ inspectionNo: string }>();
    const navigate = useNavigate();
    const thermalInputRef = useRef<HTMLInputElement>(null);
    const baselineInputRef = useRef<HTMLInputElement>(null);

    // --- State Management ---
    const [isLoading, setIsLoading] = useState(true);
    // State to store the transformer number associated with this inspection
    const [transformerNo, setTransformerNo] = useState<string | null>(null);
    
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

    // --- Data Fetching on Component Load ---
    useEffect(() => {
        const fetchInspectionData = async () => {
            if (!inspectionNo) return; // Guard against missing inspection number
            setIsLoading(true);

            try {
                // 2. Fetch the main inspection details to get the transformer number
                const inspectionRes = await axios.get(`http://localhost:8080/api/v1/inspections/${inspectionNo}`);
                const fetchedTransformerNo = inspectionRes.data.transformerNumber;
                
                if (fetchedTransformerNo) {
                    setTransformerNo(fetchedTransformerNo); // Store the transformer number

                    // 3. Define the correct URLs for both images
                    const baselineImageUrl = `http://localhost:8080/api/v1/transformers/${fetchedTransformerNo}/image`;
                    const thermalImageUrl = `http://localhost:8080/api/v1/inspections/${inspectionNo}/image`;

                    // Check if a baseline image already exists for the transformer
                    try {
                        await axios.head(baselineImageUrl);
                        setBaselineImage({
                            url: baselineImageUrl,
                            fileName: `baseline_${fetchedTransformerNo}.jpg`,
                            condition: 'N/A',
                            date: 'Existing',
                        });
                    } catch (err) {
                        console.log("No existing baseline image found.");
                        setBaselineImage(null);
                    }

                    // Check if a thermal image already exists for this inspection
                    try {
                        await axios.head(thermalImageUrl);
                        setThermalImage({
                            url: thermalImageUrl,
                            fileName: `thermal_${inspectionNo}.jpg`,
                            condition: 'N/A',
                            date: 'Existing',
                        });
                    } catch (err) {
                        console.log("No existing thermal image found.");
                        setThermalImage(null);
                    }
                }
            } catch (error) {
                console.error("Could not fetch inspection details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInspectionData();
    }, [inspectionNo]); // This effect re-runs if the inspectionNo in the URL changes

    const environmentalConditions = [
        { name: 'Sunny', icon: <Sun size={16} /> },
        { name: 'Cloudy', icon: <Cloud size={16} /> },
        { name: 'Rainy', icon: <CloudRain size={16} /> },
    ];

    // --- Image Upload Logic ---
    const uploadImage = async (file: File, type: 'thermal' | 'baseline', condition: string) => {
        // Prevent baseline upload if the transformer number wasn't found
        if (type === 'baseline' && !transformerNo) {
            alert("Cannot upload baseline image: Transformer number is missing.");
            return;
        }

        setUploadProgress({ isVisible: true, progress: 0, fileName: file.name, type });

        const formData = new FormData();
        formData.append('image', file);
        
        // 4. Use the correct variables to build the upload URL
        const uploadUrl = type === 'thermal'
            ? `http://localhost:8080/api/v1/inspections/${inspectionNo}/image`
            : `http://localhost:8080/api/v1/transformers/${transformerNo}/image`;

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
            alert(`Upload failed for ${type} image. Please check the console.`);
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
    
    // --- Reusable UI Components ---
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

    const ImageDisplayCard = ({ image, type }: { image: ImageDetails, type: 'thermal' | 'baseline' }) => (
        <div>
            <h4 className={`text-lg font-semibold mb-4 ${type === 'thermal' ? 'text-blue-600' : 'text-green-600'}`}>
                {type === 'thermal' ? 'Thermal Image' : 'Baseline Image'}
            </h4>
            <div className={`border-2 ${type === 'thermal' ? 'border-blue-200' : 'border-green-200'} rounded-xl overflow-hidden`}>
                <img src={image.url} alt={type} className="w-full h-64 object-cover" />
                <div className={`p-4 ${type === 'thermal' ? 'bg-blue-50' : 'bg-green-50'} text-sm text-gray-600`}>
                    {image.condition !== 'N/A' && <p><strong>Condition:</strong> {image.condition}</p>}
                    <p><strong>File:</strong> {image.fileName}</p>
                    <p><strong>Date:</strong> {image.date}</p>
                </div>
            </div>
        </div>
    );

    const ImageUploadCard = ({ type }: { type: 'thermal' | 'baseline' }) => {
        const isThermal = type === 'thermal';
        const title = isThermal ? "Upload Thermal Image" : "Upload Baseline Image";
        const icon = isThermal ? <UploadCloud className="mr-3 text-blue-600" size={24} /> : <Image className="mr-3 text-green-600" size={24} />;
        const ref = isThermal ? thermalInputRef : baselineInputRef;
        const condition = isThermal ? thermalCondition : baselineCondition;
        const setCondition = isThermal ? setThermalCondition : setBaselineCondition;

        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">{icon} {title}</h3>
                <div 
                    className={`border-2 border-dashed ${isThermal ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' : 'border-green-300 bg-green-50 hover:bg-green-100'} rounded-xl p-8 text-center transition-colors cursor-pointer`}
                    onClick={() => ref.current?.click()}
                >
                    <Upload className={`${isThermal ? 'text-blue-500' : 'text-green-500'} mb-4 mx-auto`} size={48} />
                    <p className="text-gray-600 mb-2 font-semibold">Drop image here or click to browse</p>
                    <button className={`${isThermal ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg font-semibold mt-4`}>
                        Choose File
                    </button>
                </div>
                <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, type)} />
                <div className="mt-6">
                    <label className="block text-gray-800 mb-2 font-semibold">Environmental Condition</label>
                    <div className="flex space-x-2">
                        {environmentalConditions.map(cond => (
                            <button key={cond.name} onClick={() => setCondition(cond.name)} className={`flex-1 p-2 border rounded-lg flex items-center justify-center space-x-2 transition-colors font-semibold ${ condition === cond.name ? `${isThermal ? 'bg-blue-600' : 'bg-green-600'} text-white border-transparent` : 'hover:bg-gray-100 border-gray-300' }`}>
                                {cond.icon}<span>{cond.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <PageLayout title="Loading Inspection..."><div>Loading details...</div></PageLayout>;
    }

    return (
        <PageLayout title={`Inspection > ${inspectionNo}`}>
            <ProgressModal />
            
            <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Upload Images for Inspection {inspectionNo}</h2>
                    {transformerNo && <p className="text-gray-500">Associated Transformer: {transformerNo}</p>}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Thermal Image */}
                {thermalImage ? <ImageDisplayCard image={thermalImage} type="thermal" /> : <ImageUploadCard type="thermal" />}

                {/* Column 2: Baseline Image */}
                {baselineImage ? <ImageDisplayCard image={baselineImage} type="baseline" /> : <ImageUploadCard type="baseline" />}
            </div>
        </PageLayout>
    );
};

export default InspectionUploadPage;
