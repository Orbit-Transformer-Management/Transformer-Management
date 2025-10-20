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
  Edit3,
  X,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import axios from "axios";
import { Rnd } from "react-rnd";
// Local modal for comments (inlined to avoid path resolution issues)

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
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string; // "f" | "pf" | "normal"
  tag: string; // "Error N" | "Fault N" | "Normal"
}
interface DrawnRect {
  x: number; // center x in image px
  y: number; // center y in image px
  width: number;
  height: number;
}
interface InspectorComment {
  id?: string;
  topic: string;
  text: string;
  author?: string;
  timestamp: string; // ISO
}

interface AnnotationEntry {
  id: string;
  action: "Add" | "Edit" | "Delete";
  comment: string;
  user: string;
  timestamp: string; // ISO
  details?: string;
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
  onDeleteBaseline?: () => void;
  onDeleteThermal?: () => void;
  onReuploadBaseline?: () => void; // NEW
  // Drawing support (thermal only)
  enableBBoxDrawing?: boolean;
  onBBoxDrawn?: (rect: DrawnRect) => void;
  // Delete/select support (thermal only)
  deleteMode?: boolean;
  onOverlayClick?: (predictionIndex: number) => void;
  // Edit support (thermal only)
  editMode?: boolean;
  editSelectedIndex?: number | null;
  onEditDraftChange?: (draft: { left: number; top: number; width: number; height: number }) => void;
}

const ImageDisplayCard = React.memo(function ImageDisplayCard({
  image,
  type,
  predictions = [],
  onReuploadThermal,
  onReuploadBaseline, // NEW
  enableBBoxDrawing = false,
  onBBoxDrawn,
  deleteMode = false,
  onOverlayClick,
  editMode = false,
  editSelectedIndex = null,
  onEditDraftChange,
}: ImageDisplayCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawOverlayRef = useRef<HTMLDivElement>(null);

  const naturalW = useRef(0);
  const naturalH = useRef(0);

  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

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

  useEffect(() => {
    centerAtFit();
  }, [image.url]);

  useEffect(() => {
    const onResize = () => centerAtFit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // Disable pan when drawing, delete mode, or edit mode is enabled
    if (type === "thermal" && (enableBBoxDrawing || deleteMode || editMode)) return;
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

  // -------- Drawing state (thermal only) --------
  const [isDrawing, setIsDrawing] = useState(false);
  const drawStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draftRect, setDraftRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const toImageCoords = (clientX: number, clientY: number) => {
    const overlay = drawOverlayRef.current;
    if (!overlay || !zoomRef.current) return { x: 0, y: 0 };
    const r = overlay.getBoundingClientRect();
    const x = (clientX - r.left) / zoomRef.current;
    const y = (clientY - r.top) / zoomRef.current;
    return { x: Math.max(0, Math.min(naturalW.current, x)), y: Math.max(0, Math.min(naturalH.current, y)) };
  };

  const onDrawMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!enableBBoxDrawing || type !== "thermal") return;
    e.stopPropagation();
    e.preventDefault();
    const { x, y } = toImageCoords(e.clientX, e.clientY);
    drawStart.current = { x, y };
    setDraftRect({ left: x, top: y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const onDrawMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDrawing || !enableBBoxDrawing || type !== "thermal") return;
    e.stopPropagation();
    e.preventDefault();
    const { x, y } = toImageCoords(e.clientX, e.clientY);
    const sx = drawStart.current.x;
    const sy = drawStart.current.y;
    const left = Math.max(0, Math.min(sx, x));
    const top = Math.max(0, Math.min(sy, y));
    const right = Math.min(naturalW.current, Math.max(sx, x));
    const bottom = Math.min(naturalH.current, Math.max(sy, y));
    setDraftRect({ left, top, width: right - left, height: bottom - top });
  };

  const onDrawMouseUp: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDrawing || !enableBBoxDrawing || type !== "thermal") return;
    e.stopPropagation();
    e.preventDefault();
    setIsDrawing(false);
    if (draftRect && draftRect.width > 4 && draftRect.height > 4) {
      const rect: DrawnRect = {
        x: draftRect.left + draftRect.width / 2,
        y: draftRect.top + draftRect.height / 2,
        width: draftRect.width,
        height: draftRect.height,
      };
      onBBoxDrawn && onBBoxDrawn(rect);
    }
    setDraftRect(null);
  };

  // -------- Edit overlay state (thermal only) --------
  const [editCssBox, setEditCssBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (type !== "thermal") return;
    if (!editMode || editSelectedIndex == null) {
      setEditCssBox(null);
      return;
    }
    const pred = predictions[editSelectedIndex];
    if (!pred) return;
    const left = pred.x - pred.width / 2;
    const top = pred.y - pred.height / 2;
    setEditCssBox({ left, top, width: pred.width, height: pred.height });
  }, [editMode, editSelectedIndex, predictions, type]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg relative">
      {/* Header + controls */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-3xl font-semibold text-black-800">
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
            <>
              <button
                onClick={onReuploadThermal}
                className="ml-2 px-6 py-1 rounded-md border text-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Re-upload
              </button>
 
              
            </>
          )}

          {type === "baseline" && (
            <>
              {onReuploadBaseline && (
                <button
                  onClick={onReuploadBaseline}
                  className="ml-2 px-6 py-1 rounded-md border text-lg bg-green-600 text-white hover:bg-green-700"
                  title="Reupload baseline image"
                >
                  Re-upload
                </button>
              )}

            </>
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

                const selectable = deleteMode || (editMode && editSelectedIndex == null);
                const isEditingThis = editMode && editSelectedIndex === idx && editCssBox;

                if (isEditingThis && editCssBox) {
                  return (
                    <Rnd
                      key={pred.id ?? idx}
                      bounds="parent"
                      size={{ width: editCssBox.width, height: editCssBox.height }}
                      position={{ x: editCssBox.left, y: editCssBox.top }}
                      scale={zoom}
                      onDrag={(_, d) => setEditCssBox((b) => (b ? { ...b, left: d.x, top: d.y } : b))}
                      onResize={(_, __, ref, ___, position) =>
                        setEditCssBox({
                          left: position.x,
                          top: position.y,
                          width: parseFloat(ref.style.width),
                          height: parseFloat(ref.style.height),
                        })
                      }
                      onDragStop={(_, d) => {
                        const draft = {
                          left: d.x,
                          top: d.y,
                          width: editCssBox.width,
                          height: editCssBox.height,
                        };
                        onEditDraftChange && onEditDraftChange(draft);
                      }}
                      onResizeStop={(_, __, ref, ___, position) => {
                        const draft = {
                          left: position.x,
                          top: position.y,
                          width: parseFloat(ref.style.width),
                          height: parseFloat(ref.style.height),
                        };
                        onEditDraftChange && onEditDraftChange(draft);
                      }}
                      style={{
                        border: `2px solid ${color}`,
                        boxShadow: "0 0 0 2px rgba(37,99,235,0.35) inset",
                      }}
                    >
                      <span className="absolute bottom-0 left-0 px-1 text-[10px] font-bold bg-white/80 text-black">
                        {pred.tag}
                      </span>
                    </Rnd>
                  );
                }

                return (
                  <div
                    key={pred.id ?? idx}
                    className={`absolute text-xs ${selectable ? "cursor-pointer" : "pointer-events-none"}`}
                    style={{
                      left,
                      top,
                      width,
                      height,
                      border: `2px solid ${color}`,
                      boxShadow: deleteMode ? "0 0 0 2px rgba(239,68,68,0.35) inset" : undefined,
                    }}
                    onClick={selectable ? () => onOverlayClick?.(idx) : undefined}
                  >
                    <span className="absolute bottom-0 left-0 px-1 text-[10px] font-bold bg-white/80 text-black">
                      {pred.tag}
                    </span>
                  </div>
                );
              })}

            {/* Drawing overlay (thermal only) */}
            {type === "thermal" && enableBBoxDrawing && (
              <div
                ref={drawOverlayRef}
                className="absolute inset-0 cursor-crosshair"
                style={{ width: naturalW.current || 0, height: naturalH.current || 0 }}
                onMouseDown={onDrawMouseDown}
                onMouseMove={onDrawMouseMove}
                onMouseUp={onDrawMouseUp}
              >
                {draftRect && (
                  <div
                    className="absolute border-2 border-blue-500/90 bg-blue-200/10"
                    style={{
                      left: draftRect.left,
                      top: draftRect.top,
                      width: draftRect.width,
                      height: draftRect.height,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xl text-gray-500">
        Scroll to zoom, drag to pan, double-click to fit.
      </p>
    </div>
  );
},
(prev, next) =>
  prev.image.url === next.image.url &&
  prev.type === next.type &&
  prev.onReuploadThermal === next.onReuploadThermal &&
  prev.onDeleteBaseline === next.onDeleteBaseline &&
  prev.onDeleteThermal === next.onDeleteThermal &&
  prev.onReuploadBaseline === next.onReuploadBaseline && // NEW
  prev.predictions === next.predictions &&
  prev.enableBBoxDrawing === next.enableBBoxDrawing &&
  prev.deleteMode === next.deleteMode
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
  // Delete mode state
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [isSubmittingDeleteComment, setIsSubmittingDeleteComment] = useState(false);
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editSelectedIndex, setEditSelectedIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isSubmittingEditComment, setIsSubmittingEditComment] = useState(false);
  const [editCommentOpen, setEditCommentOpen] = useState(false);
  // Session annotations log (Add/Edit/Delete)
  const [annotationsMade, setAnnotationsMade] = useState<AnnotationEntry[]>([]);

  // User annotation/draw state (Step 1 - Add)
  const [isAddMode, setIsAddMode] = useState(false);
  const [pendingRect, setPendingRect] = useState<DrawnRect | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [annoFaultName, setAnnoFaultName] = useState("");
  const [annoConditionType, setAnnoConditionType] = useState<"Faulty" | "Normal" | "Potential Faulty">("Faulty");
  const [annoConfidence, setAnnoConfidence] = useState<string>("");
  const [annoComment, setAnnoComment] = useState<string>("");
  const [savingAnnotation, setSavingAnnotation] = useState(false);

  // Comments state
  const [comments, setComments] = useState<InspectorComment[]>([]);
  const [commentTopic, setCommentTopic] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  // edit/delete comment UI state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState("");
  const [editText, setEditText] = useState("");
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // delete image UI state
  const [isDeletingBaseline, setIsDeletingBaseline] = useState(false);
  const [isDeletingThermal, setIsDeletingThermal] = useState(false);

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

      (res.data.outputs || []).forEach((output: any, outIdx: number) => {
        if (output.predictions?.predictions) {
          output.predictions.predictions.forEach((det: any, i: number) => {
            let tag = "Normal";
            if (det.class === "f") {
              errorCount++;
              tag = `Error ${errorCount}`;
            } else if (det.class === "pf") {
              faultCount++;
              tag = `Fault ${faultCount}`;
            }

            detections.push({
              id: det.id ?? `${outIdx}-${i}`,
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
        text: c.text ?? c.comment ?? c.body ?? "",
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

  // === Delete baseline image ===
  const handleDeleteBaseline = async () => {
    if (!transformerNo) return;
    const ok = window.confirm("Delete the baseline image for this transformer?");
    if (!ok) return;

    try {
      setIsDeletingBaseline(true);
      await axios.delete(
        `http://localhost:8080/api/v1/transformers/${transformerNo}/image`
      );
      setBaselineImage(null);
    } catch (err) {
      console.error("Failed to delete baseline image:", err);
      alert("Failed to delete baseline image.");
    } finally {
      setIsDeletingBaseline(false);
    }
  };

  // === Delete thermal (maintenance) image ===
  const handleDeleteThermal = async () => {
    if (!inspectionNo) return;
    const ok = window.confirm("Delete the maintenance (thermal) image for this inspection?");
    if (!ok) return;

    try {
      setIsDeletingThermal(true);
      await axios.delete(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/image`
      );
      setThermalImage(null);
      setThermalPredictions([]); // clear overlays
    } catch (err) {
      console.error("Failed to delete thermal image:", err);
      alert("Failed to delete thermal image.");
    } finally {
      setIsDeletingThermal(false);
    }
  };

  // === Reupload triggers ===
  const handleReuploadThermal = useCallback(() => {
    thermalInputRef.current?.click();
  }, []);
  const handleReuploadBaseline = useCallback(() => { // NEW
    baselineInputRef.current?.click();
  }, []);

  // Delete flow
  const onOverlayClickForDelete = (idx: number) => {
    if (!deleteMode) return;
    setDeleteTargetIndex(idx);
  };

  const cancelDeleteComment = () => {
    setDeleteTargetIndex(null);
  };

  // Edit flow
  const onOverlayClickForEdit = (idx: number) => {
    if (!editMode || editSelectedIndex != null) return;
    setEditSelectedIndex(idx);
  };

  const onEditDraftChange = (draft: { left: number; top: number; width: number; height: number }) => {
    setEditDraft(draft);
  };

  const cancelEditComment = () => {
    // Close comment modal; remain in edit mode so user can continue adjusting or exit again
    setEditCommentOpen(false);
  };

  const submitEditComment = async (comment: string) => {
    if (editSelectedIndex == null || !inspectionNo) return;
    const original = thermalPredictions[editSelectedIndex];
    if (!original || !editDraft) return;

    setIsSubmittingEditComment(true);

    // Convert draft CSS coords to model center coords
    const newX = editDraft.left + editDraft.width / 2;
    const newY = editDraft.top + editDraft.height / 2;

    // Update UI first
    const updated: Prediction = {
      ...original,
      x: newX,
      y: newY,
      width: editDraft.width,
      height: editDraft.height,
    };
    setThermalPredictions((prev) => prev.map((p, i) => (i === editSelectedIndex ? updated : p)));

    const timestamp = new Date().toISOString();
    const classId = updated.label === "pf" ? 2 : updated.label === "f" ? 1 : 0;
    const payload = {
      id: updated.id ?? original.id,
      annotation_type: "Edit",
      width: updated.width,
      height: updated.height,
      x: updated.x,
      y: updated.y,
      confidence: updated.confidence,
      class_id: classId,
      class: updated.label,
      parent_id: "image",
      user: "Shaveen",
      timestamp,
      tag: updated.tag,
      comment,
      // previous values for audit (optional fields)
      prev_width: original.width,
      prev_height: original.height,
      prev_x: original.x,
      prev_y: original.y,
      prev_confidence: original.confidence,
      prev_class: original.label,
      prev_tag: original.tag,
    } as const;

    // Log to local session list immediately
    setAnnotationsMade((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        action: "Edit",
        comment,
        user: "Shaveen",
        timestamp,
        details: `Edited ${original.tag ?? "box"}`,
      },
      ...prev,
    ]);

    try {
      await axios.post(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/annotations`,
        payload
      );
    } catch (e1) {
      try {
        await axios.post(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}/save-analysis`,
          { ...payload, inspectionId: inspectionNo, action: "Edit" }
        );
      } catch (e2) {
        console.warn("Edit save failed on known endpoints.", { e1, e2, payload });
        try {
          const key = "pendingAnnotationLogs";
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          existing.push({ inspectionNo, payload, ts: Date.now() });
          localStorage.setItem(key, JSON.stringify(existing));
        } catch {}
      }
    } finally {
      setIsSubmittingEditComment(false);
      setEditSelectedIndex(null);
      setEditDraft(null);
      setEditCommentOpen(false);
      setEditMode(false);
    }
  };

  const submitDeleteComment = async (comment: string) => {
    if (deleteTargetIndex == null || !inspectionNo) return;
    const target = thermalPredictions[deleteTargetIndex];
    setIsSubmittingDeleteComment(true);

    // Optimistically remove from UI first
    setThermalPredictions((prev) => prev.filter((_, i) => i !== deleteTargetIndex));
    setDeleteTargetIndex(null);
    setDeleteMode(false);

    const timestamp = new Date().toISOString();
    const classId = target.label === "pf" ? 2 : target.label === "f" ? 1 : 0;
    const payload = {
      id: target.id,
      annotation_type: "Delete",
      width: target.width,
      height: target.height,
      x: target.x,
      y: target.y,
      confidence: target.confidence,
      class_id: classId,
      class: target.label,
      parent_id: "image",
      user: "Shaveen",
      timestamp,
      tag: target.tag,
      comment,
    } as const;

    // Log to local session list immediately
    setAnnotationsMade((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        action: "Delete",
        comment,
        user: "Shaveen",
        timestamp,
        details: `Deleted ${target?.tag ?? "box"}`,
      },
      ...prev,
    ]);

    try {
      // Try primary endpoint
      await axios.post(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/annotations`,
        payload
      );
    } catch (e1) {
      try {
        // Fallback: save analysis log if supported (not visible in Comments section)
        await axios.post(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}/save-analysis`,
          { ...payload, inspectionId: inspectionNo, action: "Delete" }
        );
      } catch (e2) {
        console.warn("Delete save failed on all known endpoints.", { e1, e2, payload });
        // Keep UI updated; optionally queue to localStorage for later retry
        try {
          const key = "pendingAnnotationLogs";
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          existing.push({ inspectionNo, payload, ts: Date.now() });
          localStorage.setItem(key, JSON.stringify(existing));
        } catch {}
      }
    } finally {
      setIsSubmittingDeleteComment(false);
    }
  };

  // When user finishes drawing a rect on the thermal image
  const handleBBoxDrawn = (rect: DrawnRect) => {
    setPendingRect(rect);
    // Open details modal
    setDetailsModalOpen(true);
  };

  const resetAnnoState = () => {
    setIsAddMode(false);
    setPendingRect(null);
    setDetailsModalOpen(false);
    setCommentModalOpen(false);
    setAnnoFaultName("");
    setAnnoConditionType("Faulty");
    setAnnoConfidence("");
    setAnnoComment("");
  };

  // Save details -> update UI list and open comment modal
  const saveDetailsAndAskComment = () => {
    if (!pendingRect) return;
    const name = annoFaultName.trim();
    const confVal = parseFloat(annoConfidence);
    if (!name || isNaN(confVal)) {
      alert("Please enter Fault Name and a numeric Confidence (as percentage).");
      return;
    }

    const label =
      annoConditionType === "Faulty" ? "pf" : annoConditionType === "Potential Faulty" ? "f" : "normal";
    const confidenceFraction = Math.max(0, Math.min(100, confVal)) / 100;

    // Update the list/overlays immediately
    setThermalPredictions((prev) => [
      ...prev,
      {
        x: pendingRect.x,
        y: pendingRect.y,
        width: pendingRect.width,
        height: pendingRect.height,
        confidence: confidenceFraction,
        label,
        tag: name,
      },
    ]);

    // Now ask for comment
    setDetailsModalOpen(false);
    setCommentModalOpen(true);
  };

  // Persist annotation audit with comment
  const saveAnnotationWithComment = async (comment: string) => {
    if (!inspectionNo || !pendingRect) return;
    setSavingAnnotation(true);
    try {
      const cls =
        annoConditionType === "Faulty" ? "pf" :
        annoConditionType === "Potential Faulty" ? "f" : "normal";
      const classId = cls === "pf" ? 2 : cls === "f" ? 1 : 0;
      const confidencePercent = Math.max(0, Math.min(100, parseFloat(annoConfidence) || 0));
      const confidence = confidencePercent / 100;
      const timestamp = new Date().toISOString();

      const payload = {
        annotation_type: "Add",
        width: pendingRect.width,
        height: pendingRect.height,
        x: pendingRect.x,
        y: pendingRect.y,
        confidence,
        class_id: classId,
        class: cls,
        parent_id: "image",
        user: "Shaveen",
        timestamp,
        tag: annoFaultName.trim(),
        comment,
      } as const;

      // Log to local session list immediately
      setAnnotationsMade((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          action: "Add",
          comment,
          user: "Shaveen",
          timestamp,
          details: `Added ${payload.tag} (${annoConditionType}, ${confidencePercent}%)`,
        },
        ...prev,
      ]);
      await axios.post(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/annotations`,
        payload
      );
    } catch (err) {
      console.warn("Saving annotation failed. UI kept in sync.", err);
      // Try alternative endpoints if available as a fallback
      try {
        await axios.post(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}/save-analysis`,
          {
            inspectionId: inspectionNo,
            predictions: thermalPredictions,
            comment: `Annotation(Add) by Shaveen at ${new Date().toLocaleString()}\n` + comment,
          }
        );
      } catch {}
    } finally {
      setSavingAnnotation(false);
      resetAnnoState();
    }
  };

  // === Upload Progress Modal ===
  const ProgressModal = () => {
    if (!uploadProgress.isVisible) return null;

    const isBaseline = uploadProgress.type?.toLowerCase() === 'baseline';
    const isPredicting = uploadProgress.progress >= 100 && !isBaseline; // only for thermal
    const isDoneBaseline = uploadProgress.progress >= 100 && isBaseline;

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="upload-title"
        aria-describedby="upload-desc"
      >
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-[min(92vw,560px)]">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Upload className="text-blue-600" size={28} />
            </div>

            <h3 id="upload-title" className="text-xl font-bold tracking-tight">
              {isPredicting
                ? `Uploading ${uploadProgress.type} Image Done`
                : isDoneBaseline
                ? `Baseline Image Uploading...`
                : `Uploading ${uploadProgress.type} Image…`}
            </h3>

            <p id="upload-desc" className="text-gray-600 mt-1 mb-4 truncate">
              {uploadProgress.fileName}
            </p>
          </div>

          {/* Stepper: show 1 step for baseline, 2 steps for thermal */}
          {!isBaseline ? (
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                  ${!isPredicting ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>
                <span className="inline-block h-2 w-2 rounded-full bg-current"></span>
                Uploading
              </div>
              <div className="h-px w-8 bg-gray-200" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                  ${isPredicting ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-500'}`}>
                <span className={`inline-block h-2 w-2 rounded-full ${isPredicting ? 'bg-white' : 'bg-current'}`}></span>
                Prediction
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-blue-600 text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-white"></span>
                Uploading
              </div>
            </div>
          )}

          {/* Progress / Status */}
          {!isPredicting ? (
            <div>
              <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-300
                            bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                  style={{ width: `${Math.min(uploadProgress.progress, 100)}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(uploadProgress.progress, 100)}
                />
              </div>

              {/* Labels change when baseline hits 100% */}
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span>
                  {isDoneBaseline ? 'Upload complete' : `${uploadProgress.progress}% completed`}
                </span>
                <span className="tabular-nums">{uploadProgress.progress}/100</span>
              </div>

              {/* Baseline "done" row with check */}
              {isDoneBaseline && (
                <div className="flex items-center justify-center mt-4 text-emerald-600" aria-live="polite">
                  <Check size={18} className="mr-2" />
                  <span className="font-semibold">Baseline image uploaded successfully.</span>
                </div>
              )}
            </div>
          ) : (
            // Thermal only: indeterminate prediction bar and spinner
            <div>
              <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 w-1/3 h-full rounded-full
                            bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
                            animate-[slide_1.4s_ease-in-out_infinite]"
                />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700" aria-live="polite">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="font-semibold">Prediction in progress…</span>
              </div>

              <p className="mt-2 text-center text-sm text-gray-500">
                Analyzing patterns and generating results.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">Do not close this window until the process completes.</p>
          </div>
        </div>

        {/* Keyframes for the indeterminate bar */}
        <style>{`
          @keyframes slide {
            0%   { transform: translateX(-120%); }
            50%  { transform: translateX(20%); }
            100% { transform: translateX(120%); }
          }
        `}</style>
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

  // === Comments (create/edit/delete) ===
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
        { topic, author: "Shaveen", comment: text }
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

  const startEdit = (c: InspectorComment) => {
    setEditingId(c.id || "");
    setEditTopic(c.topic);
    setEditText(c.text);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTopic("");
    setEditText("");
  };

  const saveEdit = async (commentId: string) => {
    if (!inspectionNo || !commentId) return;
    const newTopic = editTopic.trim();
    const newText = editText.trim();
    if (!newTopic || !newText) {
      alert("Please enter both topic and comment.");
      return;
    }

    setSavingEditId(commentId);

    const prevComments = comments;
    setComments((list) =>
      list.map((c) =>
        (c.id || "") === commentId ? { ...c, topic: newTopic, text: newText } : c
      )
    );

    try {
      await axios.put(
        `http://localhost:8080/api/v1/inspections/comments/${commentId}`,
        { topic: newTopic, comment: newText }
      );
    } catch {
      try {
        await axios.post(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}/update-comment`,
          { id: commentId, topic: newTopic, comment: newText }
        );
      } catch (err) {
        console.error("❌ Failed to update comment:", err);
        setComments(prevComments);
        alert("Failed to update comment.");
      }
    } finally {
      setSavingEditId(null);
      cancelEdit();
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!inspectionNo || !commentId) return;

    setDeletingId(commentId);
    const prevComments = comments;

    setComments((list) => list.filter((c) => (c.id || "") !== commentId));

    try {
      await axios.delete(
        `http://localhost:8080/api/v1/inspections/comments/${commentId}`
      );
    } catch {
      try {
        await axios.post(
          `http://localhost:8080/api/v1/inspections/${inspectionNo}/delete-comment`,
          { id: commentId }
        );
      } catch (err) {
        console.error("❌ Failed to delete comment:", err);
        setComments(prevComments);
        alert("Failed to delete comment.");
      }
    } finally {
      setDeletingId(null);
    }
  };

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
          <h2 className="text-4xl font-bold text-gray-800">
            Transformer Inspection No - {inspectionNo}
          </h2>
          {transformerNo && (
            <p className="text-3xl font-bold text-gray-500">
              Transformer No - {transformerNo}
            </p>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {baselineImage ? (
          <div className="relative">
            {isDeletingBaseline && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Deleting…
                </div>
              </div>
            )}
            <ImageDisplayCard
              image={baselineImage}
              type="baseline"
              onReuploadBaseline={handleReuploadBaseline} // NEW
              onDeleteBaseline={handleDeleteBaseline}
            />
          </div>
        ) : (
          <ImageUploadCard type="baseline" />
        )}

        {thermalImage ? (
          <div className="relative">
            {isDeletingThermal && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Deleting…
                </div>
              </div>
            )}
            <ImageDisplayCard
              image={thermalImage}
              type="thermal"
              predictions={thermalPredictions}
              onReuploadThermal={handleReuploadThermal}
              onDeleteThermal={handleDeleteThermal}
              enableBBoxDrawing={isAddMode}
              onBBoxDrawn={handleBBoxDrawn}
              deleteMode={deleteMode}
              onOverlayClick={deleteMode ? onOverlayClickForDelete : onOverlayClickForEdit}
              editMode={editMode}
              editSelectedIndex={editSelectedIndex}
              onEditDraftChange={onEditDraftChange}
            />

            {/* Add/Edit/Delete controls (Step 1: Add) */}
            <div className="mt-3 flex items-center gap-3">
              <button
                className={`px-4 py-2 rounded-lg text-white font-semibold ${
                  isAddMode ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-50`}
                onClick={() => setIsAddMode((v) => !v)}
                disabled={!thermalImage}
                title="Add a new bounding box"
              >
                {isAddMode ? "Adding… Click & drag" : "Add"}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${editMode ? "bg-amber-600 text-white" : "border hover:bg-amber-50 text-amber-700"}`}
                title={editMode ? "Exit Edit (will ask for comment if changes present)" : "Edit a bounding box"}
                onClick={() => {
                  if (!editMode) {
                    // Enter edit mode
                    setEditMode(true);
                    setIsAddMode(false);
                    setDeleteMode(false);
                  } else {
                    // Attempt to exit edit mode; if changes exist, open comment modal instead
                    if (editSelectedIndex != null && editDraft) {
                      setEditCommentOpen(true);
                    } else {
                      // No changes to save; just exit
                      setEditMode(false);
                      setEditSelectedIndex(null);
                      setEditDraft(null);
                    }
                  }
                }}
              >
                {editMode ? "Exit Edit" : "Edit"}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${deleteMode ? "bg-red-600 text-white" : "border hover:bg-red-50 text-red-700"}`}
                title={deleteMode ? "Click a box to delete" : "Delete a bounding box"}
                onClick={() => {
                  setDeleteMode((m) => !m);
                  if (!deleteMode) setIsAddMode(false);
                }}
              >
                {deleteMode ? "Exit Delete" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <ImageUploadCard type="thermal" />
        )}
      </div>

      {/* Annotations Made */}
      <section className="mt-8">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-3xl font-bold tracking-tight text-blue-700">Annotations Made</h3>
            <span className="text-sm text-gray-500">{annotationsMade.length} change{annotationsMade.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="p-6">
            {annotationsMade.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600 font-semibold">
                No annotations have been made in this session.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="px-4 py-2 text-base">Change</th>
                      <th className="px-4 py-2 text-base">Comment</th>
                      <th className="px-4 py-2 text-base">User</th>
                      <th className="px-4 py-2 text-base">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annotationsMade.map((a) => (
                      <tr key={a.id} className="border-t">
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                            a.action === "Add"
                              ? "bg-blue-100 text-blue-700"
                              : a.action === "Edit"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {a.action}
                          </span>
                          {a.details && (
                            <div className="mt-1 text-gray-800 text-base">{a.details}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-800 text-base whitespace-pre-wrap">{a.comment || "—"}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold text-base">{a.user}</td>
                        <td className="px-4 py-3 text-gray-700 text-base">{formatDateTime(a.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Analysis */}
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
                          <span className="text-2xl font-bold text-gray-900">
                            {pred.tag}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-2xl font-semibold
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

                        <p className="mt-1 text-2xl text-gray-700">
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
                Comments by Inspector
              </h4>

              {comments.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-gray-200 to-transparent hidden sm:block" />
                  <ul className="space-y-4 mb-10">
                    {comments.map((c, i) => {
                      const isEditing = editingId === (c.id || "");
                      const isSavingThis = savingEditId === (c.id || "");
                      const isDeletingThis = deletingId === (c.id || "");
                      return (
                        <li key={c.id ?? `${c.timestamp}-${i}`} className="relative">
                          <span className="hidden sm:block absolute -left-0.5 top-5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                          <div className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 bg-gradient-to-r from-gray-50 to-white">
                              <div className="flex items-center gap-2 min-w-0">
                                <Tag className="h-5 w-5 text-gray-400 shrink-0" />
                                {isEditing ? (
                                  <input
                                    value={editTopic}
                                    onChange={(e) => setEditTopic(e.target.value)}
                                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-lg font-semibold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                                  />
                                ) : (
                                  <h5 className="text-lg md:text-2xl font-bold text-black-900 truncate">
                                    {c.topic}
                                  </h5>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-lg text-black-600">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-6 w-6" />
                                  <span className="text-xl font-bold">
                                    {formatDateTime(c.timestamp)}
                                  </span>
                                </span>
                                {c.author && (
                                  <span className="inline-flex items-center gap-2">
                                    <UserIcon className="h-8 w-8" />
                                    <span className="text-xl font-bold">{c.author}</span>
                                  </span>
                                )}

                                <div className="flex items-center gap-2 ml-2">
                                  {!isEditing ? (
                                    <>
                                      <button
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-sm hover:bg-gray-50"
                                        onClick={() => startEdit(c)}
                                        title="Edit"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-sm hover:bg-red-50 ${
                                          isDeletingThis ? "opacity-60 pointer-events-none" : ""
                                        }`}
                                        onClick={() => deleteComment(c.id || "")}
                                        title="Delete"
                                      >
                                        {isDeletingThis ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4 text-white-600" />
                                        )}
                                        <span className="text-white-700">Delete</span>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm text-white ${
                                          isSavingThis
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                        onClick={() => saveEdit(c.id || "")}
                                        disabled={isSavingThis}
                                        title="Save"
                                      >
                                        {isSavingThis ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Save className="h-4 w-4" />
                                        )}
                                        Save
                                      </button>
                                      <button
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-sm hover:bg-gray-50"
                                        onClick={cancelEdit}
                                        title="Cancel"
                                      >
                                        <X className="h-4 w-4" />
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="px-5 py-4">
                              {isEditing ? (
                                <div className="relative">
                                  <MessageSquareText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full min-h-36 rounded-2xl border-2 border-gray-200 pl-10 pr-4 py-3
                                               text-lg leading-relaxed shadow-sm placeholder:text-gray-400
                                               focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                                  />
                                </div>
                              ) : (
                                <p className="text-xl md:text-2xl leading-relaxed text-gray-800 whitespace-pre-wrap">
                                  {c.text}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
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
                    <label className="block text-lg md:text-2xl font-bold text-gray-800 mb-2">
                      Topic
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                      <input
                        type="text"
                        className="w-full rounded-2xl border-2 border-gray-200 pl-12 pr-4 py-4 text-2xl
                                   shadow-sm placeholder:text-gray-400 focus:border-blue-500
                                   focus:ring-4 focus:ring-blue-100 outline-none"
                        placeholder="Enter Topic..."
                        value={commentTopic}
                        onChange={(e) => setCommentTopic(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg md:text-2xl font-bold text-gray-800 mb-2">
                      Comment
                    </label>
                    <div className="relative">
                      <MessageSquareText className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                      <textarea
                        className="w-full min-h-40 rounded-2xl border-2 border-gray-200 pl-12 pr-4 py-4
                                   text-2xl leading-relaxed shadow-sm placeholder:text-gray-400
                                   focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                        rows={5}
                        placeholder="Write your detailed observations…"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-left">
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

      {/* --------- Details Modal (Fault Name, Condition, Confidence) --------- */}
      <ModalShell
        open={detailsModalOpen}
        onClose={resetAnnoState}
        title="Add Annotation Details"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Fault Name</label>
            <input
              value={annoFaultName}
              onChange={(e) => setAnnoFaultName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Hotspot near bushing"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Condition Type</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={annoConditionType}
                onChange={(e) => setAnnoConditionType(e.target.value as any)}
              >
                <option>Faulty</option>
                <option>Normal</option>
                <option>Potential Faulty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Confidence (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={annoConfidence}
                onChange={(e) => setAnnoConfidence(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 92.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="px-4 py-2 rounded-lg border" onClick={resetAnnoState}>
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              onClick={saveDetailsAndAskComment}
            >
              Save
            </button>
          </div>
        </div>
      </ModalShell>

      {/* ------------------------ Comment confirmation modal ------------------------ */}
      <ModalShell
        open={commentModalOpen}
        onClose={resetAnnoState}
        title="Add a comment"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Please add a comment to confirm this annotation. This will be saved with
            annotation type, user, and timestamp.
          </p>
          <textarea
            className="w-full min-h-28 border rounded-lg px-3 py-2"
            value={annoComment}
            onChange={(e) => setAnnoComment(e.target.value)}
            placeholder="Comment about why this box was added"
          />
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-lg border" onClick={resetAnnoState}>
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-white ${
                savingAnnotation ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={savingAnnotation}
              onClick={() => saveAnnotationWithComment(annoComment)}
            >
              {savingAnnotation ? "Saving…" : "Save Comment"}
            </button>
          </div>
        </div>
      </ModalShell>
      {/* Delete comment modal */}
      <CommentModal
        open={deleteMode && deleteTargetIndex != null}
        title="Confirm Deletion"
        subtitle="Please enter a brief reason for deleting this annotation."
        placeholder="Reason for deletion…"
        onCancel={cancelDeleteComment}
        onSubmit={submitDeleteComment}
        isSubmitting={isSubmittingDeleteComment}
      />

      {/* Edit comment modal */}
      <CommentModal
        open={editCommentOpen}
        title="Confirm Edit"
        subtitle="Please enter a brief comment describing the modification."
        placeholder="Reason for edit…"
        onCancel={cancelEditComment}
        onSubmit={submitEditComment}
        isSubmitting={isSubmittingEditComment}
      />
    </PageLayout>
  );
};

// ---------- Modals for Annotation Details and Comment ----------

const ModalShell: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
      <div className="bg-white w-[min(92vw,560px)] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button className="p-1 rounded hover:bg-gray-100" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// We extend the default export to render the modals at the end of the tree
const WrappedInspectionUploadPage: React.FC = () => {
  // We need access to inner state, so render the original component and portals
  // But since the page component already contains states, we can't easily wrap here without refactor.
  // Therefore, this wrapper is a no-op. The modals are rendered inline within the page above.
  return <></>;
};

export default InspectionUploadPage;

// Hoisted function component used above in JSX
type CommentModalProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  defaultValue?: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (comment: string) => void | Promise<void>;
};

function CommentModal({
  open,
  title = "Add a comment",
  subtitle,
  placeholder = "Type your comment…",
  defaultValue = "",
  isSubmitting = false,
  onCancel,
  onSubmit,
}: CommentModalProps) {
  const [value, setValue] = React.useState<string>(defaultValue);
  React.useEffect(() => {
    if (open) setValue(defaultValue || "");
  }, [open, defaultValue]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    await onSubmit(value.trim());
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40">
      <div className="bg-white w-[min(92vw,560px)] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">{title}</h3>
          <button className="p-1 rounded hover:bg-gray-100" onClick={onCancel} aria-label="Close">
            <X />
          </button>
        </div>
        {subtitle && <p className="text-sm text-gray-600 mb-3">{subtitle}</p>}
        <textarea
          className="w-full min-h-28 border rounded-lg px-3 py-2"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Comment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}