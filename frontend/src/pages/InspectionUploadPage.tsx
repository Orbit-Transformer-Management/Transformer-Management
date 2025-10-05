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
  Tag,
  MessageSquareText,
  Send,
  User as UserIcon,
  Clock,
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
interface InspectorComment {
  id?: string;
  topic: string;
  text: string;
  author?: string;
  timestamp: string; // ISO
}

const INITIAL_ZOOM = 1;

/* -------------------------------- Utilities -------------------------------- */

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ------------------------ ImageDisplayCard (memoized) ----------------------- */

type ImgType = "thermal" | "baseline";
interface ImageDisplayCardProps {
  image: ImageDetails;
  type: ImgType;
  predictions?: Prediction[]; // only for thermal
  onReuploadThermal?: () => void;
}

const ImageDisplayCard = React.memo(function ImageDisplayCard({
  image,
  type,
  predictions = [],
  onReuploadThermal,
}: ImageDisplayCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // natural image size
  const naturalW = useRef(0);
  const naturalH = useRef(0);

  // transform state
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // dragging
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // mask a right-side legend baked into some photos (purely visual)
  const maskRightPx = 0;

  const centerAtFit = () => {
    const cont = containerRef.current;
    if (!cont || !naturalW.current || !naturalH.current) return;
    const cw = cont.clientWidth;
    const ch = cont.clientHeight;
    const z = Math.min(cw / naturalW.current, ch / naturalH.current) || 1;
    setZoom(z);
    setTranslate({
      x: Math.round((cw - naturalW.current * z) / 2),
      y: Math.round((ch - naturalH.current * z) / 2),
    });
  };

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    naturalW.current = img.naturalWidth;
    naturalH.current = img.naturalHeight;
    centerAtFit();
  };

  // refit on URL change or window resize
  useEffect(() => {
    centerAtFit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.url]);

  useEffect(() => {
    const onResize = () => centerAtFit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // zoom with wheel (block page scroll)
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wheelListener = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.min(5, Math.max(0.2, zoomRef.current + dir));

      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const ratio = newZoom / zoomRef.current;

      setTranslate((prev) => ({
        x: cx - ratio * (cx - prev.x),
        y: cy - ratio * (cy - prev.y),
      }));
      setZoom(newZoom);
    };

    el.addEventListener("wheel", wheelListener, { passive: false });
    return () => el.removeEventListener("wheel", wheelListener);
  }, []);

  // pan
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
  const onMouseUpOrLeave = () => (dragging.current = false);

  const zoomIn = () => setZoom((z) => Math.min(5, z + 0.2));
  const zoomOut = () => setZoom((z) => Math.max(0.2, z - 0.2));
  const resetView = () => centerAtFit();

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg relative">
      {/* Header + controls */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-2xl font-semibold text-black-800">
          {type === "thermal" ? "Maintenance Image" : "Baseline Image"}
        </h4>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="px-2 py-1 rounded-md border text-sm hover:bg-gray-50"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-lg tabular-nums w-14 text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={zoomIn}
            className="px-2 py-1 rounded-md border text-xl hover:bg-gray-50"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={resetView}
            className="ml-1 px-6 py-1 rounded-md border text-xl hover:bg-gray-50"
            title="Reset (fit)"
          >
            Reset
          </button>

          {type === "thermal" && (
            <button
              onClick={onReuploadThermal}
              className="ml-2 px-6 py-1 rounded-md border text-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Reupload
            </button>
          )}
        </div>
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border h-[40vh] md:h-[48vh] xl:h-[54vh]"
        style={{ overscrollBehavior: "contain" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onDoubleClick={resetView}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
            transformOrigin: "top left",
            willChange: "transform",
            lineHeight: 0,
          }}
        >
          <div className="relative block" style={{ width: naturalW.current || "auto" }}>
            <img
              ref={imgRef}
              src={image.url}
              alt={type}
              className="block max-w-none h-auto select-none"
              draggable={false}
              onLoad={handleImgLoad}
            />

            {/* Optional mask */}
            {maskRightPx > 0 && (
              <div
                className="absolute top-0 right-0 h-full bg-white"
                style={{ width: `${maskRightPx}px` }}
              />
            )}

            {/* Overlays (thermal) */}
            {type === "thermal" &&
              predictions.map((pred, idx) => {
                const left = pred.x - pred.width / 2;
                const top = pred.y - pred.height / 2;
                const width = pred.width;
                const height = pred.height;

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

      <p className="mt-2 text-lg text-gray-500">
        Scroll to zoom, drag to pan, double-click to fit.
      </p>
    </div>
  );
},
(prev, next) =>
  prev.image.url === next.image.url &&
  prev.type === next.type &&
  prev.onReuploadThermal === next.onReuploadThermal &&
  prev.predictions === next.predictions
);

/* --------------------------------- Page ------------------------------------ */

const InspectionUploadPage = () => {
  const { inspectionNo } = useParams<{ inspectionNo: string }>();
  const navigate = useNavigate();

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

  // Comments state
  const [comments, setComments] = useState<InspectorComment[]>([]);
  const [commentTopic, setCommentTopic] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  // === Predictions ===
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

  // === Comments ===
  const fetchComments = useCallback(async () => {
    if (!inspectionNo) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/comments`
      );
      const list = Array.isArray(res.data) ? res.data : res.data?.comments || [];
      const normalized: InspectorComment[] = list.map((c: any) => ({
        id: c.id ?? c._id ?? undefined,
        topic: c.topic ?? c.title ?? c.subject ?? "(No topic)",
        text: c.text ?? c.comment ?? c.body ?? "", // normalize to `text`
        author: c.author ?? undefined,
        timestamp: c.timestamp ?? c.createdAt ?? new Date().toISOString(),
      }));

      normalized.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setComments(normalized);
    } catch {
      try {
        const r2 = await axios.get(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}`
        );
        const list = r2.data?.comments || [];
        const normalized: InspectorComment[] = list.map((c: any) => ({
          id: c.id ?? c._id ?? undefined,
          topic: c.topic ?? c.title ?? c.subject ?? "(No topic)",
          text: c.text ?? c.comment ?? c.body ?? "",
          author: c.author ?? undefined,
          timestamp: c.timestamp ?? c.createdAt ?? new Date().toISOString(),
        }));
        normalized.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setComments(normalized);
      } catch {
        setComments([]);
      }
    }
  }, [inspectionNo]);

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

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center">
            <Upload className="mx-auto mb-4 text-blue-600" size={48} />
            <h3 className="text-xl font-bold mb-2">
              Uploading {uploadProgress.type} Image…
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
            className={`${isThermal ? "text-blue-500" : "text-green-500"} mb-4 mx-auto`}
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

  // === Save topic+comment (with fallback) ===
  const handleSubmitComment = async () => {
    if (!inspectionNo) return;
    const topic = commentTopic.trim();
    const text = commentText.trim();
    if (!topic || !text) {
      alert("Please enter both a topic and a comment.");
      return;
    }

    setIsSavingComment(true);

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimistic: InspectorComment = {
      id: tempId,
      topic,
      text,
      author: "Shaveen",
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);
    setCommentTopic("");
    setCommentText("");

    try {
      const res = await axios.post(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/comments`,
        { topic, author: "Shaveen", comment: text } // API expects `comment`
      );
      const saved: InspectorComment = {
        id: res.data?.id ?? res.data?._id ?? tempId,
        topic: res.data?.topic ?? res.data?.title ?? topic,
        text: res.data?.text ?? res.data?.comment ?? text,
        author: res.data?.author ?? "Shaveen",
        timestamp:
          res.data?.timestamp ?? res.data?.createdAt ?? new Date().toISOString(),
      };
      setComments((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
    } catch {
      try {
        await axios.post(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}/save-analysis`,
          {
            inspectionId: inspectionNo,
            predictions: thermalPredictions,
            comment: `Topic: ${topic}\n${text}`,
          }
        );
        // keep optimistic entry
      } catch {
        setComments((prev) => prev.filter((c) => c.id !== tempId));
        setCommentTopic(topic);
        setCommentText(text);
        alert("Failed to save comment. Please try again.");
      }
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleReuploadThermal = useCallback(() => {
    thermalInputRef.current?.click();
  }, []);

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

      {/* Hidden inputs */}
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

      {/* Header */}
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
            <p className="text-xl font-bold text-gray-500">Associated Transformer No : {transformerNo}</p>
          )}
        </div>
      </div>

      {/* Main grid */}
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

      {/* Analysis + Comments */}
      <section className="mt-10">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-3xl font-bold tracking-tight text-red-600">
              Model Detected Issues
            </h3>
            {!isAnalyzing && (
              <span className="text-sm text-gray-500">
                {thermalPredictions.length} item
                {thermalPredictions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

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
                          <span className="text-xl font-bold text-gray-900">
                            {pred.tag}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xl font-semibold
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

                        <p className="mt-1 text-xl text-gray-700">
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

            {/* ---------------------------- Comments block ---------------------------- */}
            <div className="mt-12">
              <h4 className="text-2xl md:text-3xl font-bold text-red-600 mb-6 flex items-center gap-3">
                {/* <MessageSquareText className="h-8 w-8 text-red-600" /> */}
                Comments by Inspector
              </h4>

              {comments.length > 0 ? (
                <div className="relative">
                  {/* timeline spine */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-gray-200 to-transparent hidden sm:block" />
                  <ul className="space-y-4 mb-10">
                    {comments.map((c, i) => (
                      <li key={c.id ?? `${c.timestamp}-${i}`} className="relative">
                        {/* timeline dot */}
                        <span className="hidden sm:block absolute -left-0.5 top-5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100" />

                        <div className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                          {/* header */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-2 min-w-0">
                              <Tag className="h-5 w-5 text-gray-400 shrink-0" />
                              <h5 className="text-lg md:text-xl font-bold text-black-900 truncate">
                                {c.topic}
                              </h5>
                            </div>
                            <div className="flex items-center gap-4 text-lg text-black-600">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-6 w-6" />
                                <span className="text-lg font-bold"></span>{formatDateTime(c.timestamp)}
                              </span>
                              {c.author && (
                                <span className="inline-flex items-center gap-2">
                                  <UserIcon className="h-8 w-8" />
                                  <span className="text-lg font-semibold">{c.author}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* body */}
                          <div className="px-5 py-4">
                          <p className="text-xl md:text-xl leading-relaxed text-gray-800 whitespace-pre-wrap">{c.text}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mb-10 rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 p-8 text-center">
                  <MessageSquareText className="mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">
                    No Comments yet
                  </p>
                </div>
              )}

              {/* Composer */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-lg md:text-xl font-bold text-gray-800 mb-2">
                      Topic
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                      <input
                        type="text"
                        className="w-full rounded-2xl border-2 border-gray-200 pl-12 pr-4 py-4 text-xl
                                   shadow-sm placeholder:text-gray-400 focus:border-blue-500
                                   focus:ring-4 focus:ring-blue-100 outline-none"
                        placeholder="Enter Topic..."
                        value={commentTopic}
                        onChange={(e) => setCommentTopic(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg md:text-xl font-bold text-gray-800 mb-2">
                      Comment
                    </label>
                    <div className="relative">
                      <MessageSquareText className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                      <textarea
                        className="w-full min-h-40 rounded-2xl border-2 border-gray-200 pl-12 pr-4 py-4
                                   text-xl leading-relaxed shadow-sm placeholder:text-gray-400
                                   focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                        rows={5}
                        placeholder="Write your detailed observations…"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={isSavingComment}
                      className={`inline-flex items-center gap-3 text-white text-2xl font-semibold px-7 py-4 rounded-2xl shadow-lg transition
                        ${isSavingComment ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      <Send className="h-8 w-8" />
                      {isSavingComment ? "Saving…" : "Submit Comment"}
                    </button>
                  </div>
                </div>
              </div>
              {/* /Composer */}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default InspectionUploadPage;
