import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../components/common/PageLayout";
import {
  UploadCloud,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  Check,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

// === Types ===
interface ImageDetails {
  url: string;
  fileName: string;
  condition: string;
  date: string;
}
interface UploadProgress {
  isVisible: boolean;
  progress: number;
  fileName: string;
  type: "thermal" | "baseline";
}
interface Prediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string; // "f" | "pf" | "normal"
  tag: string; // "Error N" | "Fault N" | "Normal"
}

const INITIAL_ZOOM = 1;

// ==================== ImageDisplayCard (hoisted + memoized) ====================
type ImgType = "thermal" | "baseline";
interface ImageDisplayCardProps {
  image: ImageDetails;
  type: ImgType;
  predictions?: Prediction[]; // only for thermal
  onReuploadThermal?: () => void;
  initialZoom?: number;
}

const ImageDisplayCard = React.memo(function ImageDisplayCard({
  image,
  type,
  predictions = [],
  onReuploadThermal,
  initialZoom = INITIAL_ZOOM,
}: ImageDisplayCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [zoom, setZoom] = useState(initialZoom);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const zoomIn = () => setZoom((z) => clamp(z + 0.2, 0.5, 5));
  const zoomOut = () => setZoom((z) => clamp(z - 0.2, 0.5, 5));
  const resetView = () => {
    setZoom(initialZoom);
    setTranslate({ x: 0, y: 0 });
  };

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = clamp(zoom + dir, 0.5, 5);
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const ratio = newZoom / zoom;
    setTranslate({
      x: cx - ratio * (cx - translate.x),
      y: cy - ratio * (cy - translate.y),
    });
    setZoom(newZoom);
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    translateStart.current = { ...translate };
  };
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTranslate({
      x: translateStart.current.x + dx,
      y: translateStart.current.y + dy,
    });
  };
  const onMouseUpOrLeave = () => {
    dragging.current = false;
  };

  // compute base scale when image loads/changes
  useEffect(() => {
    if (imgRef.current) {
      const img = imgRef.current;
      setScale({
        x: img.clientWidth / img.naturalWidth,
        y: img.clientHeight / img.naturalHeight,
      });
      setZoom(initialZoom);
      setTranslate({ x: 0, y: 0 });
    }
  }, [image.url, initialZoom]);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setScale({
      x: img.clientWidth / img.naturalWidth,
      y: img.clientHeight / img.naturalHeight,
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg relative">
      {/* Header + controls */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold text-gray-800">
          {type === "thermal" ? "Thermal Image" : "Baseline Image"}
        </h4>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="px-2 py-1 rounded-md border text-sm hover:bg-gray-50"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-sm tabular-nums w-14 text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={zoomIn}
            className="px-2 py-1 rounded-md border text-sm hover:bg-gray-50"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={resetView}
            className="ml-1 px-3 py-1 rounded-md border text-sm hover:bg-gray-50"
            title="Reset view"
          >
            Reset
          </button>

          {type === "thermal" && (
            <button
              onClick={onReuploadThermal}
              className="ml-2 px-3 py-1 rounded-md border text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              Reupload
            </button>
          )}
        </div>
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border"
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onDoubleClick={resetView}
      >
        {/* transform layer keeps image + boxes aligned */}
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
            transformOrigin: "top left",
            willChange: "transform",
          }}
        >
          <div className="relative inline-block">
            <img
              ref={imgRef}
              src={image.url}
              alt={type}
              className="w-full h-auto block select-none"
              draggable={false}
              onLoad={handleImgLoad}
            />

            {/* Overlays */}
            {type === "thermal" &&
              predictions.map((pred, idx) => {
                const left = (pred.x - pred.width / 2) * scale.x;
                const top = (pred.y - pred.height / 2) * scale.y;
                const width = pred.width * scale.x;
                const height = pred.height * scale.y;
                const color =
                  pred.label === "pf"
                    ? "red"
                    : pred.label === "f"
                    ? "orange"
                    : "limegreen";

                return (
                  <div
                    key={idx}
                    className="absolute text-xs pointer-events-none"
                    style={{
                      left,
                      top,
                      width,
                      height,
                      border: `2px solid ${color}`,
                    }}
                  >
                    <span className="absolute bottom-0 left-0 px-1 text-[10px] font-bold bg-white/80 text-black">
                      {pred.tag}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Scroll to zoom, drag to pan, double-click to reset.
      </p>
    </div>
  );
},
// Skip re-render unless inputs actually change
(prev, next) =>
  prev.image.url === next.image.url &&
  prev.type === next.type &&
  prev.onReuploadThermal === next.onReuploadThermal &&
  prev.initialZoom === next.initialZoom &&
  prev.predictions === next.predictions // same array ref when only comment changes
);

// ==================== Page ====================
const InspectionUploadPage = () => {
  const { inspectionNo } = useParams<{ inspectionNo: string }>();
  const navigate = useNavigate();

  // File inputs (mounted once at page level)
  const thermalInputRef = useRef<HTMLInputElement>(null);
  const baselineInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [transformerNo, setTransformerNo] = useState<string | null>(null);

  const [thermalCondition] = useState("Sunny");
  const [baselineCondition] = useState("Sunny");

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

  // === Fetch predictions ===
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
        if (output.predictions?.predictions) {
          output.predictions.predictions.forEach((det: any) => {
            let tag = "Normal";
            if (det.class === "f") {
              errorCount++;
              tag = `Error ${errorCount}`;
            } else if (det.class === "pf") {
              faultCount++;
              tag = `Fault ${faultCount}`;
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
        condition,
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
      e.currentTarget.value = "";
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
              Uploading {uploadProgress.type} Image in Progress....
            </h3>
            <p className="text-gray-600 mb-4 truncate">{uploadProgress.fileName}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
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

  // === Upload Card (uses page-level inputs) ===
  const ImageUploadCard = ({ type }: { type: "thermal" | "baseline" }) => {
    const isThermal = type === "thermal";
    const ref = isThermal ? thermalInputRef : baselineInputRef;

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          {isThermal ? (
            <UploadCloud className="mr-3 text-blue-600" size={24} />
          ) : (
            <ImageIcon className="mr-3 text-green-600" size={24} />
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
            type="button"
            className={`${
              isThermal ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
            } text-white px-6 py-2 rounded-lg font-semibold mt-4`}
            onClick={() => ref.current?.click()}
          >
            Choose File
          </button>
        </div>
      </div>
    );
  };

  // === Save analysis ===
  const handleSubmit = async () => {
    if (!inspectionNo) return;
    try {
      const payload = {
        inspectionId: inspectionNo,
        predictions: thermalPredictions,
        comment,
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

  // Stable handler for reupload button inside memoized card
  const handleReuploadThermal = useCallback(() => {
    thermalInputRef.current?.click();
  }, []);

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

      {/* Always-mounted hidden inputs (used by Upload & Reupload) */}
      <input
        ref={thermalInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "thermal")}
      />
      <input
        ref={baselineInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "baseline")}
      />

      {/* Header row */}
      <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Transformer Inspection No {inspectionNo}
          </h2>
          {transformerNo && (
            <p className="text-gray-500">Associated Transformer: {transformerNo}</p>
          )}
        </div>
      </div>

      {/* Main grid: baseline + thermal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {baselineImage ? (
          <ImageDisplayCard image={baselineImage} type="baseline" />
        ) : (
          <ImageUploadCard type="baseline" />
        )}

        {thermalImage ? (
          <ImageDisplayCard
            image={thermalImage}
            type="thermal"
            predictions={thermalPredictions}
            onReuploadThermal={handleReuploadThermal}
          />
        ) : (
          <ImageUploadCard type="thermal" />
        )}
      </div>

      {/* ===== Analysis / Model Output (PRETTY) ===== */}
      <section className="mt-10">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Model Detected Issues
            </h3>
            {!isAnalyzing && (
              <span className="text-sm text-gray-500">
                {thermalPredictions.length} item
                {thermalPredictions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {isAnalyzing ? (
              <p className="text-blue-700 text-lg font-semibold">Analyzing…</p>
            ) : thermalPredictions.length > 0 ? (
              <ul className="space-y-3">
                {thermalPredictions.map((pred, idx) => {
                  const isFault = pred.label === "pf";
                  const isError = pred.label === "f";
                  const statusText = isFault
                    ? "Faulty"
                    : isError
                    ? "Potentially Faulty"
                    : "Normal";

                  const wrapperClasses = isFault
                    ? "from-red-50 to-rose-50 border-red-200"
                    : isError
                    ? "from-amber-50 to-yellow-50 border-amber-200"
                    : "from-emerald-50 to-green-50 border-emerald-200";

                  return (
                    <li
                      key={idx}
                      className={`flex items-start gap-4 p-4 rounded-2xl border bg-gradient-to-r ${wrapperClasses} shadow-sm`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isFault ? (
                          <AlertOctagon className="h-6 w-6 text-red-600" />
                        ) : isError ? (
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            {pred.tag}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold
                            ${
                              isFault
                                ? "bg-red-100 text-red-700"
                                : isError
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>

                        <p className="mt-1 text-base text-gray-700">
                          Confidence: {(pred.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <p className="text-lg font-semibold text-emerald-800">
                  No issues detected by the model.
                </p>
              </div>
            )}

            {/* Comments + Submit */}
            <div className="mt-8">
              <label className="block text-2xl font-extrabold text-gray-900 mb-3">
                Comments by Inspector
              </label>

              <textarea
                className="w-full min-h-36 text-lg leading-relaxed rounded-xl border-2 border-gray-200 p-4 shadow-sm
                           placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                rows={5}
                placeholder="Enter your notes here…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="mt-5 flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                             text-lg font-semibold px-6 py-3 rounded-xl shadow-lg transition"
                >
                  <Check className="h-5 w-5" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default InspectionUploadPage;
