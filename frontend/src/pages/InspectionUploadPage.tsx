import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../components/common/PageLayout";
import {
  UploadCloud,
  Image,
  Sun,
  Cloud,
  CloudRain,
  Upload,
  ChevronLeft,
  Check,
} from "lucide-react";
import axios from "axios";

// Image details
interface ImageDetails {
  url: string;
  fileName: string;
  condition: string;
  date: string;
}

// Upload progress
interface UploadProgress {
  isVisible: boolean;
  progress: number;
  fileName: string;
  type: "thermal" | "baseline";
}

// Predictions
interface Prediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string; // raw backend class: f / pf
  tag: string; // Error 1 / Fault 1 etc.
}

const InspectionUploadPage = () => {
  const { inspectionNo } = useParams<{ inspectionNo: string }>();
  const navigate = useNavigate();
  const thermalInputRef = useRef<HTMLInputElement>(null);
  const baselineInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [transformerNo, setTransformerNo] = useState<string | null>(null);

  const [thermalCondition, setThermalCondition] = useState("Sunny");
  const [baselineCondition, setBaselineCondition] = useState("Sunny");

  const [thermalImage, setThermalImage] = useState<ImageDetails | null>(null);
  const [baselineImage, setBaselineImage] = useState<ImageDetails | null>(null);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isVisible: false,
    progress: 0,
    fileName: "",
    type: "thermal",
  });

  const [thermalPredictions, setThermalPredictions] = useState<Prediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comment, setComment] = useState("");

  // === Fetch predictions (no rescaling needed) ===
  const fetchPredictions = async () => {
    if (!inspectionNo) return;
    try {
      setIsAnalyzing(true);
      const res = await axios.get(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/analyze`
      );

      const detections: Prediction[] = [];
      let errorCount = 0;
      let faultCount = 0;

      (res.data.outputs || []).forEach((output: any) => {
        if (output.predictions && output.predictions.predictions) {
          output.predictions.predictions.forEach((det: any) => {
            let tag = "";
            if (det.class === "f") {
              errorCount++;
              tag = `Error ${errorCount}`;
            } else if (det.class === "pf") {
              faultCount++;
              tag = `Fault ${faultCount}`;
            } else {
              tag = `Normal`;
            }
            detections.push({
              x: det.x,
              y: det.y,
              width: det.width,
              height: det.height,
              confidence: det.confidence,
              label: det.class,
              tag,
            });
          });
        }
      });

      setThermalPredictions(detections);
    } catch (err) {
      console.error("❌ Analysis failed:", err);
      setThermalPredictions([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // === Load inspection + images ===
  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!inspectionNo) return;
      setIsLoading(true);

      try {
        const inspectionRes = await axios.get(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}`
        );
        const fetchedTransformerNo = inspectionRes.data.transformerNumber;

        if (fetchedTransformerNo) {
          setTransformerNo(fetchedTransformerNo);

          const baselineImageUrl = `http://localhost:8080/api/v1/transformers/${fetchedTransformerNo}/image`;
          const thermalImageUrl = `http://localhost:8080/api/v1/inspections/${inspectionNo}/image`;

          try {
            await axios.head(baselineImageUrl);
            setBaselineImage({
              url: baselineImageUrl,
              fileName: `baseline_${fetchedTransformerNo}.jpg`,
              condition: "N/A",
              date: "Existing",
            });
          } catch {
            setBaselineImage(null);
          }

          try {
            await axios.head(thermalImageUrl);
            setThermalImage({
              url: thermalImageUrl,
              fileName: `thermal_${inspectionNo}.jpg`,
              condition: "N/A",
              date: "Existing",
            });
            fetchPredictions();
          } catch {
            setThermalImage(null);
            setThermalPredictions([]);
          }
        }
      } catch (error) {
        console.error("Could not fetch inspection details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspectionData();
  }, [inspectionNo]);

  // === Upload ===
  const uploadImage = async (
    file: File,
    type: "thermal" | "baseline",
    condition: string
  ) => {
    if (type === "baseline" && !transformerNo) {
      alert("Cannot upload baseline image: Transformer number missing.");
      return;
    }

    setUploadProgress({
      isVisible: true,
      progress: 0,
      fileName: file.name,
      type,
    });

    const formData = new FormData();
    formData.append("image", file);

    const uploadUrl =
      type === "thermal"
        ? `http://localhost:8080/api/v1/inspections/${inspectionNo}/image`
        : `http://localhost:8080/api/v1/transformers/${transformerNo}/image`;

    try {
      await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          const progress = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress((prev) => ({ ...prev, progress }));
        },
      });

      const newImage: ImageDetails = {
        url: URL.createObjectURL(file),
        fileName: file.name,
        condition: condition,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };

      if (type === "thermal") {
        setThermalImage(newImage);
        setTimeout(() => fetchPredictions(), 800);
      } else {
        setBaselineImage(newImage);
      }

      setTimeout(
        () => setUploadProgress((prev) => ({ ...prev, isVisible: false })),
        1000
      );
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Upload failed for ${type} image. Please check the console.`);
      setUploadProgress((prev) => ({ ...prev, isVisible: false }));
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thermal" | "baseline"
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const condition = type === "thermal" ? thermalCondition : baselineCondition;
      uploadImage(files[0], type, condition);
    }
  };

  const handleSubmit = async () => {
    if (!inspectionNo) return;
    try {
      const payload = {
        inspectionId: inspectionNo,
        predictions: thermalPredictions,
        comment: comment,
      };

      await axios.post(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/save-analysis`,
        payload
      );

      alert("Analysis saved successfully!");
    } catch (err) {
      console.error("❌ Failed to save analysis:", err);
      alert("Failed to save analysis");
    }
  };

  // === Upload Progress Modal ===
  const ProgressModal = () => {
    if (!uploadProgress.isVisible) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center">
            <Upload className="mx-auto mb-4 text-blue-600" size={48} />
            <h3 className="text-xl font-bold mb-2">
              Uploading {uploadProgress.type} Image
            </h3>
            <p className="text-gray-600 mb-4 truncate">
              {uploadProgress.fileName}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {uploadProgress.progress}% completed
            </p>
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

  // === Upload Card (for missing images) ===
  const ImageUploadCard = ({ type }: { type: "thermal" | "baseline" }) => {
    const isThermal = type === "thermal";
    const ref = isThermal ? thermalInputRef : baselineInputRef;

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          {isThermal ? (
            <UploadCloud className="mr-3 text-blue-600" size={24} />
          ) : (
            <Image className="mr-3 text-green-600" size={24} />
          )}
          {isThermal ? "Upload Thermal Image" : "Upload Baseline Image"}
        </h3>
        <div
          className={`border-2 border-dashed ${
            isThermal
              ? "border-blue-300 bg-blue-50 hover:bg-blue-100"
              : "border-green-300 bg-green-50 hover:bg-green-100"
          } rounded-xl p-8 text-center transition-colors cursor-pointer`}
          onClick={() => ref.current?.click()}
        >
          <Upload
            className={`${
              isThermal ? "text-blue-500" : "text-green-500"
            } mb-4 mx-auto`}
            size={48}
          />
          <p className="text-gray-600 mb-2 font-semibold">
            Drop image here or click to browse
          </p>
          <button
            className={`${
              isThermal
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-6 py-2 rounded-lg font-semibold mt-4`}
          >
            Choose File
          </button>
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, type)}
        />
      </div>
    );
  };

  // === Display Card (with bounding boxes) ===
  const ImageDisplayCard = ({ image, type }: { image: ImageDetails; type: "thermal" | "baseline" }) => (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h4 className={`text-lg font-semibold mb-2 ${type === "thermal" ? "text-blue-600" : "text-green-600"}`}>
        {type === "thermal" ? "Thermal Image (Analyzed)" : "Baseline Image"}
      </h4>
      <div className="relative border rounded-xl overflow-hidden">
        <img src={image.url} alt={type} className="max-w-full h-auto" />

        {/* Analyzing overlay */}
        {type === "thermal" && isAnalyzing && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white font-bold text-lg">
            Analyzing...
          </div>
        )}

        {/* Bounding boxes (direct, no rescale) */}
        {type === "thermal" &&
          thermalPredictions.map((pred, idx) => {
            const left = pred.x - pred.width / 2;
            const top = pred.y - pred.height / 2;
            const color =
              pred.label === "pf"
                ? "red"
                : pred.label === "f"
                ? "orange"
                : "green";

            return (
              <div
                key={idx}
                className="absolute text-xs"
                style={{
                  left,
                  top,
                  width: pred.width,
                  height: pred.height,
                  border: `2px solid ${color}`,
                }}
              >
                <span
                  className="absolute bottom-0 left-0 px-1 text-[10px] font-bold bg-white bg-opacity-80 text-black"
                >
                  {pred.tag}
                </span>
              </div>
            );
          })}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {image.condition !== "N/A" && (
          <p>
            <strong>Condition:</strong> {image.condition}
          </p>
        )}
        <p>
          <strong>File:</strong> {image.fileName}
        </p>
        <p>
          <strong>Date:</strong> {image.date}
        </p>
      </div>
    </div>
  );

  // === Render ===
  if (isLoading) {
    return (
      <PageLayout title="Loading Inspection...">
        <div>Loading details...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Inspection > ${inspectionNo}`}>
      <ProgressModal />

      <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Upload Images for Inspection {inspectionNo}
          </h2>
          {transformerNo && <p className="text-gray-500">Associated Transformer: {transformerNo}</p>}
        </div>
      </div>

      {/* ✅ Show upload cards if images missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {baselineImage ? (
          <ImageDisplayCard image={baselineImage} type="baseline" />
        ) : (
          <ImageUploadCard type="baseline" />
        )}

        {thermalImage ? (
          <ImageDisplayCard image={thermalImage} type="thermal" />
        ) : (
          <ImageUploadCard type="thermal" />
        )}
      </div>

      {/* Model Output */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-red-600">Model Detected Issues</h3>

        {isAnalyzing ? (
          <p className="text-blue-600">Analyzing...</p>
        ) : thermalPredictions.length > 0 ? (
          <ul className="space-y-2 text-sm text-gray-700">
            {thermalPredictions.map((pred, idx) => (
              <li key={idx} className="p-2 border rounded-md">
                {pred.tag} –{" "}
                {pred.label === "pf"
                  ? "Faulty"
                  : pred.label === "f"
                  ? "Potentially Faulty"
                  : "Normal"}{" "}
                | Confidence: {(pred.confidence * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-600 font-semibold">✅ No errors detected</p>
        )}

        {/* Comment + Submit */}
        <div className="mt-4">
          <label className="block font-semibold mb-2">Comments</label>
          <textarea
            className="w-full border rounded-md p-2"
            rows={3}
            placeholder="Enter your notes here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Submit
        </button>
      </div>
    </PageLayout>
  );
};

export default InspectionUploadPage;
