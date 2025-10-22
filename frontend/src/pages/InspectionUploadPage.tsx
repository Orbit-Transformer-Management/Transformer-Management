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
  Download,
  ChevronDown,
  ChevronUp,
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
  detectId?: number; // Backend ID for edit/delete
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
  anotationId: number; // Backend ID from InspectionDetectsTimeline
  type: string; // "add" | "edit" | "delete"
  comment: string;
  author: string;
  createdAt: string; // ISO
  faultName?: string; // Fault name from the bounding box
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

// Export annotations to CSV
const exportAnnotationsToCSV = (annotations: AnnotationEntry[], inspectionNo: string, transformerId: string) => {
  if (annotations.length === 0) {
    alert("No annotations to export!");
    return;
  }

  // Define CSV headers
  const headers = ["Image ID", "Transformer ID", "Action Taken", "Fault Name", "Comment", "User", "Timestamp"];
  
  // Convert annotations to CSV rows
  const rows = annotations.map((a) => {
    return [
      inspectionNo,
      transformerId,
      a.type.charAt(0).toUpperCase() + a.type.slice(1),
      a.faultName || "—",
      a.comment || "—",
      a.author,
      formatDateTime(a.createdAt)
    ].map(field => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = String(field).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inspection_${inspectionNo}_annotations_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Export annotations to JSON
const exportAnnotationsToJSON = (annotations: AnnotationEntry[], inspectionNo: string, transformerId: string) => {
  if (annotations.length === 0) {
    alert("No annotations to export!");
    return;
  }

  // Convert annotations to JSON format (same structure as CSV)
  const jsonData = annotations.map((a) => ({
    "Image ID": inspectionNo,
    "Transformer ID": transformerId,
    "Action Taken": a.type.charAt(0).toUpperCase() + a.type.slice(1),
    "Fault Name": a.faultName || "—",
    "Comment": a.comment || "—",
    "User": a.author,
    "Timestamp": formatDateTime(a.createdAt)
  }));

  // Create blob and download
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inspection_${inspectionNo}_annotations_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Export Feedback Log to JSON - FR3.3: Feedback Integration for Model Improvement
const exportFeedbackLogToJSON = (
  predictions: Prediction[], 
  annotations: AnnotationEntry[], 
  inspectionNo: string,
  addedDetectIds: Set<number>,
  deletedDetectIds: Set<number>
) => {
  if (predictions.length === 0 && annotations.length === 0) {
    alert("No detection data to export!");
    return;
  }

  const feedbackLog: any[] = [];

  // Process current predictions
  predictions.forEach((pred) => {
    const isUserAdded = pred.detectId ? addedDetectIds.has(pred.detectId) : false;
    const isDeleted = pred.detectId ? deletedDetectIds.has(pred.detectId) : false;
    
    // Find annotation history for this detection
    const relatedAnnotations = annotations.filter(a => a.anotationId === pred.detectId);
    const editAnnotation = relatedAnnotations.find(a => a.type === "edit");
    const deleteAnnotation = relatedAnnotations.find(a => a.type === "delete");
    const addAnnotation = relatedAnnotations.find(a => a.type === "add");
    
    if (isUserAdded) {
      // User-added anomaly: only one entry
      feedbackLog.push({
        imageId: inspectionNo,
        "predicted by": "annotator",
        confidence: 1,
        type: pred.label,
        accepted: true,
        boundingBox: {
          x: pred.x,
          y: pred.y,
          width: pred.width,
          height: pred.height
        },
        "annotator metadata": addAnnotation ? {
          user: addAnnotation.author,
          time: addAnnotation.createdAt,
          comment: addAnnotation.comment
        } : null
      });
    } else {
      // Model-generated anomaly: always keep original
      
      if (editAnnotation) {
        // EDITED: Keep original model prediction with accepted=false
        // We need to find the original bounding box before edit
        // Since we only have current state, we'll mark the model prediction as not accepted
        feedbackLog.push({
          imageId: inspectionNo,
          "predicted by": "Model",
          confidence: pred.confidence,
          type: pred.label,
          accepted: false,
          boundingBox: {
            x: pred.x,
            y: pred.y,
            width: pred.width,
            height: pred.height
          },
          "annotator metadata": null
        });
        
        // Add new entry with edited position
        feedbackLog.push({
          imageId: inspectionNo,
          "predicted by": "annotator",
          confidence: 1,
          type: pred.label,
          accepted: true,
          boundingBox: {
            x: pred.x,
            y: pred.y,
            width: pred.width,
            height: pred.height
          },
          "annotator metadata": {
            user: editAnnotation.author,
            time: editAnnotation.createdAt,
            comment: editAnnotation.comment
          }
        });
      } else if (isDeleted || deleteAnnotation) {
        // DELETED: Keep original model prediction with accepted=false
        feedbackLog.push({
          imageId: inspectionNo,
          "predicted by": "Model",
          confidence: pred.confidence,
          type: pred.label,
          accepted: false,
          boundingBox: {
            x: pred.x,
            y: pred.y,
            width: pred.width,
            height: pred.height
          },
          "annotator metadata": deleteAnnotation ? {
            user: deleteAnnotation.author,
            time: deleteAnnotation.createdAt,
            comment: deleteAnnotation.comment
          } : null
        });
      } else {
        // UNCHANGED: Keep original model prediction with accepted=true
        feedbackLog.push({
          imageId: inspectionNo,
          "predicted by": "Model",
          confidence: pred.confidence,
          type: pred.label,
          accepted: true,
          boundingBox: {
            x: pred.x,
            y: pred.y,
            width: pred.width,
            height: pred.height
          },
          "annotator metadata": null
        });
      }
    }
  });

  // Add deleted model predictions that are no longer in the predictions array
  const deletedAnnotations = annotations.filter(a => 
    a.type === "delete" && !predictions.find(p => p.detectId === a.anotationId)
  );
  
  deletedAnnotations.forEach(delAnnotation => {
    feedbackLog.push({
      imageId: inspectionNo,
      "predicted by": "Model",
      confidence: 0,
      type: "deleted",
      accepted: false,
      boundingBox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      "annotator metadata": {
        user: delAnnotation.author,
        time: delAnnotation.createdAt,
        comment: delAnnotation.comment
      }
    });
  });

  // Create blob and download
  const blob = new Blob([JSON.stringify(feedbackLog, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `feedback_log_${inspectionNo}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Export Feedback Log to CSV - FR3.3: Feedback Integration for Model Improvement
const exportFeedbackLogToCSV = (
  predictions: Prediction[], 
  annotations: AnnotationEntry[], 
  inspectionNo: string,
  addedDetectIds: Set<number>,
  deletedDetectIds: Set<number>
) => {
  if (predictions.length === 0 && annotations.length === 0) {
    alert("No detection data to export!");
    return;
  }

  const feedbackLog: any[] = [];

  // Process current predictions (same logic as JSON export)
  predictions.forEach((pred) => {
    const isUserAdded = pred.detectId ? addedDetectIds.has(pred.detectId) : false;
    const isDeleted = pred.detectId ? deletedDetectIds.has(pred.detectId) : false;
    
    const relatedAnnotations = annotations.filter(a => a.anotationId === pred.detectId);
    const editAnnotation = relatedAnnotations.find(a => a.type === "edit");
    const deleteAnnotation = relatedAnnotations.find(a => a.type === "delete");
    const addAnnotation = relatedAnnotations.find(a => a.type === "add");
    
    if (isUserAdded) {
      feedbackLog.push({
        imageId: inspectionNo,
        predictedBy: "annotator",
        confidence: 1,
        type: pred.label,
        accepted: true,
        boundingBoxX: pred.x,
        boundingBoxY: pred.y,
        boundingBoxWidth: pred.width,
        boundingBoxHeight: pred.height,
        annotatorUser: addAnnotation?.author || "",
        annotatorTime: addAnnotation?.createdAt || "",
        annotatorComment: addAnnotation?.comment || ""
      });
    } else {
      if (editAnnotation) {
        feedbackLog.push({
          imageId: inspectionNo,
          predictedBy: "Model",
          confidence: pred.confidence,
          type: pred.label,
          accepted: false,
          boundingBoxX: pred.x,
          boundingBoxY: pred.y,
          boundingBoxWidth: pred.width,
          boundingBoxHeight: pred.height,
          annotatorUser: "",
          annotatorTime: "",
          annotatorComment: ""
        });
        
        feedbackLog.push({
          imageId: inspectionNo,
          predictedBy: "annotator",
          confidence: 1,
          type: pred.label,
          accepted: true,
          boundingBoxX: pred.x,
          boundingBoxY: pred.y,
          boundingBoxWidth: pred.width,
          boundingBoxHeight: pred.height,
          annotatorUser: editAnnotation.author,
          annotatorTime: editAnnotation.createdAt,
          annotatorComment: editAnnotation.comment
        });
      } else if (isDeleted || deleteAnnotation) {
        feedbackLog.push({
          imageId: inspectionNo,
          predictedBy: "Model",
          confidence: pred.confidence,
          type: pred.label,
          accepted: false,
          boundingBoxX: pred.x,
          boundingBoxY: pred.y,
          boundingBoxWidth: pred.width,
          boundingBoxHeight: pred.height,
          annotatorUser: deleteAnnotation?.author || "",
          annotatorTime: deleteAnnotation?.createdAt || "",
          annotatorComment: deleteAnnotation?.comment || ""
        });
      } else {
        feedbackLog.push({
          imageId: inspectionNo,
          predictedBy: "Model",
          confidence: pred.confidence,
          type: pred.label,
          accepted: true,
          boundingBoxX: pred.x,
          boundingBoxY: pred.y,
          boundingBoxWidth: pred.width,
          boundingBoxHeight: pred.height,
          annotatorUser: "",
          annotatorTime: "",
          annotatorComment: ""
        });
      }
    }
  });

  // CSV headers
  const headers = [
    "Image ID",
    "Predicted By",
    "Confidence",
    "Type",
    "Accepted",
    "Bounding Box X",
    "Bounding Box Y",
    "Bounding Box Width",
    "Bounding Box Height",
    "Annotator User",
    "Annotator Time",
    "Annotator Comment"
  ];

  // Convert to CSV rows
  const rows = feedbackLog.map((entry) => {
    return [
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
    ].map(field => {
      const escaped = String(field).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    });
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `feedback_log_${inspectionNo}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Utility to clear localStorage for an inspection (useful when backend is fixed)
const clearInspectionLocalStorage = (inspectionNo: string) => {
  localStorage.removeItem(`addedDetectIds_${inspectionNo}`);
  localStorage.removeItem(`deletedDetectIds_${inspectionNo}`);
  localStorage.removeItem(`localTimeline_${inspectionNo}`);
  console.log("🗑️ Cleared localStorage for inspection:", inspectionNo);
};

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
                      key={pred.detectId ?? idx}
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
                    key={pred.detectId ?? idx}
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
  const thermalPredictionsRef = useRef<Prediction[]>([]);
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
  
  // Collapsible state for annotations table
  const [isAnnotationsExpanded, setIsAnnotationsExpanded] = useState(false);
  
  // Collapsible state for comments section
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  // Export dropdown state
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  
  // Feedback Log export dropdown state
  const [isFeedbackExportDropdownOpen, setIsFeedbackExportDropdownOpen] = useState(false);

  // Track which detectIds were added in this session (workaround for backend bug)
  const [addedDetectIds, setAddedDetectIds] = useState<Set<number>>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`addedDetectIds_${inspectionNo}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  
  const [deletedDetectIds, setDeletedDetectIds] = useState<Set<number>>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`deletedDetectIds_${inspectionNo}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  
  // Local timeline entries that backend doesn't save (Add and Delete operations)
  const [localTimelineEntries, setLocalTimelineEntries] = useState<AnnotationEntry[]>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`localTimeline_${inspectionNo}`);
    return stored ? JSON.parse(stored) : [];
  });
  
  // Use ref to track latest localTimelineEntries for fetchAnnotations
  const localTimelineEntriesRef = useRef(localTimelineEntries);
  useEffect(() => {
    localTimelineEntriesRef.current = localTimelineEntries;
  }, [localTimelineEntries]);

  // Use ref to track latest thermalPredictions for fetchAnnotations
  useEffect(() => {
    thermalPredictionsRef.current = thermalPredictions;
  }, [thermalPredictions]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExportDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setIsExportDropdownOpen(false);
        }
      }
      if (isFeedbackExportDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setIsFeedbackExportDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExportDropdownOpen, isFeedbackExportDropdownOpen]);

  // Persist to localStorage whenever these change
  useEffect(() => {
    if (inspectionNo) {
      localStorage.setItem(`addedDetectIds_${inspectionNo}`, JSON.stringify([...addedDetectIds]));
      console.log("💾 Saved addedDetectIds to localStorage:", [...addedDetectIds]);
    }
  }, [addedDetectIds, inspectionNo]);

  useEffect(() => {
    if (inspectionNo) {
      localStorage.setItem(`deletedDetectIds_${inspectionNo}`, JSON.stringify([...deletedDetectIds]));
      console.log("💾 Saved deletedDetectIds to localStorage:", [...deletedDetectIds]);
    }
  }, [deletedDetectIds, inspectionNo]);

  useEffect(() => {
    if (inspectionNo) {
      localStorage.setItem(`localTimeline_${inspectionNo}`, JSON.stringify(localTimelineEntries));
      console.log("💾 Saved localTimeline to localStorage:", localTimelineEntries.length, "entries");
    }
  }, [localTimelineEntries, inspectionNo]);

  // Load from localStorage on component mount
  useEffect(() => {
    if (inspectionNo) {
      const storedAdded = localStorage.getItem(`addedDetectIds_${inspectionNo}`);
      const storedDeleted = localStorage.getItem(`deletedDetectIds_${inspectionNo}`);
      const storedTimeline = localStorage.getItem(`localTimeline_${inspectionNo}`);
      
      console.log("📂 Loaded from localStorage:");
      console.log("  - addedDetectIds:", storedAdded ? JSON.parse(storedAdded).length : 0);
      console.log("  - deletedDetectIds:", storedDeleted ? JSON.parse(storedDeleted).length : 0);
      console.log("  - localTimeline:", storedTimeline ? JSON.parse(storedTimeline).length : 0, "entries");
    }
  }, [inspectionNo]);

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
type InspectionModelDetects = {
  detectId: number;
  detectName?: string | null; // Fault name from backend
  width: number;
  height: number;
  x: number;
  y: number;
  confidence: number;
  classId: number;
  className: string | null;
  detectionId?: string | null;
  parentId?: string | null;
};

const fetchPredictions = async () => {
  if (!inspectionNo) return;
  try {
    setIsAnalyzing(true);

    const { data } = await axios.get<InspectionModelDetects[]>(
      `http://localhost:8080/api/v1/inspections/${inspectionNo}/analyze`
    );

    // Filter out deleted detections first (backend bug workaround)
    const filteredData = (data || []).filter((det) => {
      if (deletedDetectIds.has(det.detectId)) {
        console.log(`🗑️ Filtering out deleted detectId ${det.detectId} from predictions`);
        return false;
      }
      return true;
    });

    console.log(`📊 Loaded ${data?.length || 0} predictions from backend, ${filteredData.length} after filtering deleted`);

    // Count existing detections by type for proper numbering
    let faultCount = 0;
    let potentialFaultCount = 0;
    let normalCount = 0;

    const detections: Prediction[] = filteredData.map((det) => {
      const label = (det.className ?? "").trim();
      
      // Use detectName from backend if available, otherwise check existing prediction, otherwise auto-generate
      let tag: string;
      
      if (det.detectName && det.detectName.trim()) {
        // Backend has a fault name saved - use it
        tag = det.detectName.trim();
        console.log(`✅ Using backend fault name "${tag}" for detectId ${det.detectId}`);
      } else {
        // Check if this detection already exists in current predictions with a custom name
        const existing = thermalPredictions.find(p => p.detectId === det.detectId);
        
        if (existing && existing.tag) {
          // Preserve the existing custom name (user-entered or previously set)
          tag = existing.tag;
          console.log(`✅ Preserving custom name "${tag}" for detectId ${det.detectId}`);
        } else {
          // New detection from backend without detectName - use auto-generated name
          if (label.toLowerCase() === "pf") {
            faultCount += 1;
            tag = `Fault ${faultCount}`;
          } else if (label.toLowerCase() === "f") {
            potentialFaultCount += 1;
            tag = `Potentially Fault ${potentialFaultCount}`;
          } else {
            normalCount += 1;
            tag = `Normal ${normalCount}`;
          }
        }
      }

      return {
        detectId: det.detectId,
        x: det.x,
        y: det.y,
        width: det.width,
        height: det.height,
        confidence: det.confidence,
        label,
        tag,
      };
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

  // === Fetch Annotations Timeline ===
  const fetchAnnotations = useCallback(async () => {
    if (!inspectionNo) return;
    try {
      console.log("📥 Fetching annotations timeline for inspection:", inspectionNo);
      const res = await axios.get(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/analyze/timeline`
      );
      const backendList = Array.isArray(res.data) ? res.data : [];
      console.log("✅ Backend timeline received:", backendList.length, "entries");
      
      // Filter backend entries for deleted detections
      // Keep historical entries (Add/Edit from before deletion)
      // Filter out ONLY the most recent "edit" entry if it matches the delete comment (backend bug)
      const filteredBackendList = backendList.filter((entry: any) => {
        const detectId = entry.detect?.detectId;
        
        if (detectId && deletedDetectIds.has(detectId)) {
          // This detection was deleted
          // Backend bug: it creates an "edit" entry when deleting
          // Keep historical entries (Add/Edit from before deletion)
          // Filter out only the fake "edit" entry that was created during delete
          
          if (entry.type === "edit") {
            // Check if this is the fake edit created during delete
            // Find the local delete entry for this detectId
            const localDeleteEntry = localTimelineEntriesRef.current.find(
              (local) => local.type === "delete" && local.anotationId === Date.now()
            );
            
            // If this edit entry has the same comment as our delete entry and similar timestamp,
            // it's likely the fake entry created by the backend bug
            const hasMatchingDeleteEntry = localTimelineEntriesRef.current.some(
              (local) => {
                if (local.type !== "delete") return false;
                
                const backendComment = (entry.comment || "").trim();
                const localComment = (local.comment || "").trim();
                
                // Match by comment
                if (backendComment === localComment) {
                  // Also check timestamps are close (within 10 seconds)
                  const backendTime = new Date(entry.createdAt).getTime();
                  const localTime = new Date(local.createdAt).getTime();
                  const timeDiff = Math.abs(backendTime - localTime);
                  
                  if (timeDiff < 10000) {
                    console.log(`🗑️ Filtering out fake "edit" entry for deleted detectId ${detectId} (matched by comment & time)`);
                    return true;
                  }
                }
                
                return false;
              }
            );
            
            if (hasMatchingDeleteEntry) {
              return false; // Filter out this fake edit
            }
          }
          
          // Keep all other entries (historical Add/Edit entries from before deletion)
          console.log(`✅ Keeping historical "${entry.type}" entry for deleted detectId ${detectId}`);
        }
        
        return true;
      });
      
      console.log("✅ Backend timeline after filtering:", filteredBackendList.length, "entries");
      
      // Group backend entries by detectId and type to understand what we have
      const backendEntriesByDetectId = new Map<number, Set<string>>();
      filteredBackendList.forEach((entry: any) => {
        const detectId = entry.detect?.detectId;
        if (detectId) {
          if (!backendEntriesByDetectId.has(detectId)) {
            backendEntriesByDetectId.set(detectId, new Set());
          }
          backendEntriesByDetectId.get(detectId)!.add(entry.type || "");
        }
      });
      
      // Keep local "Add" entries ONLY if backend doesn't have an "add" type for that detectId
      // This allows both Add and Edit entries to coexist for the same detectId
      const relevantLocalEntries = localTimelineEntriesRef.current.filter((local) => {
        const detectId = local.anotationId;
        const backendTypes = backendEntriesByDetectId.get(detectId);
        
        if (local.type === "add" && backendTypes?.has("add")) {
          // Backend has saved the Add entry, remove local duplicate
          console.log(`⚠️ Backend has "add" entry for detectId ${detectId}, removing local duplicate`);
          return false;
        }
        
        // Keep all other local entries (Add without backend, Delete, etc.)
        return true;
      });
      
      console.log("✅ Local timeline entries:", relevantLocalEntries.length);
      
      // Merge backend and local entries, sort by timestamp (newest first)
      const mergedList = [
        ...relevantLocalEntries,
        ...filteredBackendList.map((entry: any) => {
          // Extract fault name from detect object if available
          const detectId = entry.detect?.detectId;
          let faultName: string | undefined;
          
          if (detectId) {
            // PRIORITY 1: Use detectName from backend if saved
            if (entry.detect?.detectName && entry.detect.detectName.trim()) {
              faultName = entry.detect.detectName.trim();
              console.log(`✅ Using backend detectName "${faultName}" for timeline entry detectId ${detectId}`);
            } else {
              // PRIORITY 2: Try to find matching prediction to get the fault name
              const matchingPrediction = thermalPredictionsRef.current.find(p => p.detectId === detectId);
              if (matchingPrediction) {
                faultName = matchingPrediction.tag;
                console.log(`✅ Using prediction tag "${faultName}" for timeline entry detectId ${detectId}`);
              } else {
                // PRIORITY 3: If no matching prediction, use className from backend as fallback
                const className = entry.detect?.className;
                if (className) {
                  faultName = className === "pf" ? "Potential Fault" : className === "f" ? "Fault" : "Normal";
                  console.log(`✅ Using className fallback "${faultName}" for timeline entry detectId ${detectId}`);
                }
              }
            }
          }
          
          return {
            ...entry,
            faultName
          };
        })
      ].sort((a, b) => {
        // Ensure we have valid timestamps
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        
        // Sort descending (newest first)
        const result = dateB - dateA;
        
        if (result !== 0) {
          return result;
        }
        
        // If timestamps are equal, sort by type priority: Delete > Edit > Add
        const typePriority: { [key: string]: number } = { delete: 3, edit: 2, add: 1 };
        const priorityA = typePriority[a.type] || 0;
        const priorityB = typePriority[b.type] || 0;
        return priorityB - priorityA;
      });
      
      console.log("✅ Total merged timeline entries:", mergedList.length);
      console.log("📊 Timeline sorted (newest first):", mergedList.map(e => `${e.type} @ ${e.createdAt}`));
      
      setAnnotationsMade(mergedList);
    } catch (err) {
      console.error("❌ Failed to fetch annotations timeline:", err);
      // Still show local entries even if backend fails
      setAnnotationsMade(localTimelineEntriesRef.current);
    }
  }, [inspectionNo, deletedDetectIds]);

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
    fetchAnnotations();
  }, [fetchComments, fetchAnnotations]);

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
    if (!original || !editDraft || !original.detectId) return;

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

    const classId = updated.label === "pf" ? 2 : updated.label === "f" ? 1 : 0;
    const payload = {
      width: updated.width,
      height: updated.height,
      x: updated.x,
      y: updated.y,
      confidence: updated.confidence,
      classId: classId,
      className: updated.label,
      parentId: "image",
      author: "Shaveen",
      comment,
      faultName: updated.tag // Send fault name to backend
    };

    try {
      // CRITICAL: Backend repository expects String ID, but model has Long detectId
      // Convert detectId to String for the URL
      const detectIdStr = String(original.detectId);
      console.log("📤 Sending EDIT request for detectId:", detectIdStr, "(converted from", original.detectId, ")");
      console.log("📤 EDIT payload with fault name:", payload);
      
      const response = await axios.put(
        `http://localhost:8080/api/v1/inspections/analyze/${detectIdStr}`,
        payload
      );
      console.log("✅ EDIT response:", response.data);
      // Refresh predictions and timeline to show the edit entry properly sorted
      await fetchPredictions();
      await fetchAnnotations();
      
      // Refresh the page after successful edit
      window.location.reload();
    } catch (e1) {
      console.error("❌ Edit save failed:", e1);
      if (axios.isAxiosError(e1)) {
        console.error("❌ Error details:", e1.response?.data);
        console.error("❌ Error status:", e1.response?.status);
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
    
    console.log("🔍 Delete target:", target);
    console.log("🔍 Delete target detectId:", target.detectId, "Type:", typeof target.detectId);
    
    if (!target.detectId) {
      console.error("❌ Cannot delete: detectId is missing!");
      alert("Cannot delete: Detection ID is missing. Please refresh the page and try again.");
      setDeleteTargetIndex(null);
      setDeleteMode(false);
      setIsSubmittingDeleteComment(false);
      return;
    }
    
    setIsSubmittingDeleteComment(true);

    // Immediately remove from UI (optimistic update)
    setThermalPredictions(prev => prev.filter((_, i) => i !== deleteTargetIndex));

    // Track as deleted (persists in localStorage)
    if (target.detectId) {
      setDeletedDetectIds(prev => new Set(prev).add(target.detectId!));
      
      // Create a local timeline entry for Delete
      const now = new Date().toISOString();
      const localEntry: AnnotationEntry = {
        anotationId: Date.now(), // Temporary ID
        type: "delete",
        comment: comment,
        author: "Shaveen",
        createdAt: now,
        faultName: target.tag || "Unknown"
      };
      
      // Add to local timeline entries and sort immediately
      setLocalTimelineEntries(prev => {
        const updated = [localEntry, ...prev];
        // Sort by timestamp immediately (newest first)
        return updated.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      });
      console.log("✅ Created local timeline entry for Delete operation:", localEntry);
    }

    // ⚠️ BACKEND DELETE IS BROKEN - See BACKEND_FIXES_NEEDED.md
    // Backend has type mismatch: Repository expects String but Model has Long detectId
    // This causes 500 Internal Server Error when trying to delete
    // Solution: Frontend-only delete until backend is fixed
    
    console.warn("⚠️ Backend DELETE endpoint is broken (type mismatch bug)");
    console.warn("⚠️ Detection removed from UI only - backend database still has it");
    console.warn("⚠️ See BACKEND_FIXES_NEEDED.md for fix instructions");
    
    // Try to call backend anyway (will likely fail, but won't affect UI)
    const classId = target.label === "pf" ? 2 : target.label === "f" ? 1 : 0;
    const payload = {
      width: target.width,
      height: target.height,
      x: target.x,
      y: target.y,
      confidence: target.confidence,
      classId: classId,
      className: target.label,
      parentId: "image",
      author: "Shaveen",
      comment,
      faultName: target.tag || "Unknown" // Send fault name to backend
    };

    try {
      const detectIdStr = String(target.detectId);
      console.log("📤 Attempting DELETE request for detectId:", detectIdStr);
      console.log("📤 DELETE payload with fault name:", payload);
      
      const response = await axios.delete(
        `http://localhost:8080/api/v1/inspections/analyze/${detectIdStr}`,
        { 
          data: payload,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("✅ DELETE succeeded (unexpected!):", response.status, response.data);
    } catch (e1) {
      console.warn("⚠️ Backend DELETE failed (expected due to type mismatch bug):", 
        axios.isAxiosError(e1) ? e1.response?.data : e1);
      // DON'T show error alert - this is expected
      console.log("✅ Detection removed from UI, will stay removed via deletedDetectIds filter");
    }
    
    // Refresh annotations timeline to show the delete entry
    await fetchAnnotations();
    
    // Refresh the page after successful delete
    window.location.reload();
  };

  // When user finishes drawing a rect on the thermal image
  const handleBBoxDrawn = (rect: DrawnRect) => {
    setPendingRect(rect);
    // Open comment modal directly (skip details modal)
    setCommentModalOpen(true);
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

  // Persist annotation audit with comment
  const saveAnnotationWithComment = async (comment: string) => {
    if (!inspectionNo || !pendingRect) return;
    setSavingAnnotation(true);
    try {
      const cls =
        annoConditionType === "Faulty" ? "pf" :
        annoConditionType === "Potential Faulty" ? "f" : "normal";
      const classId = cls === "pf" ? 2 : cls === "f" ? 1 : 0;
      
      // Auto-generate fault name based on condition type and count
      const existingCount = thermalPredictions.filter(p => p.label === cls).length;
      const autoFaultName = annoConditionType === "Faulty" ? `Faulty ${existingCount + 1}` : 
                           annoConditionType === "Potential Faulty" ? `Potential Fault ${existingCount + 1}` : 
                           `Normal ${existingCount + 1}`;
      
      // Default confidence to 0.95 (95%)
      const confidence = 0.95;

      // Update the list/overlays immediately with auto-generated fault name
      setThermalPredictions((prev) => [
        ...prev,
        {
          x: pendingRect.x,
          y: pendingRect.y,
          width: pendingRect.width,
          height: pendingRect.height,
          confidence: confidence,
          label: cls,
          tag: autoFaultName,
        },
      ]);

      const payload = {
        width: pendingRect.width,
        height: pendingRect.height,
        x: pendingRect.x,
        y: pendingRect.y,
        confidence,
        classId: classId,
        className: cls,
        parentId: "image",
        author: "Shaveen",
        comment,
        faultName: autoFaultName // Send auto-generated fault name to backend
      };

      console.log("📤 Sending ADD request with fault name:", payload);
      const response = await axios.post(
        `http://localhost:8080/api/v1/inspections/${inspectionNo}/analyze`,
        payload
      );
      console.log("✅ ADD response:", response.data);

      // Update the last added prediction with the detectId from response
      if (response.data?.detectId) {
        console.log("✅ Setting detectId:", response.data.detectId);
        console.log("✅ Auto-generated fault name:", autoFaultName);
        console.log("✅ Backend response detectName:", response.data.detectName);
        
        const detectId = response.data.detectId;
        const now = new Date().toISOString();
        
        // Track this as an added detectId (workaround for backend bug)
        setAddedDetectIds(prev => new Set(prev).add(detectId));
        
        // Create a local timeline entry since backend doesn't save Add operations
        // Use the fault name from backend response (should match what we sent)
        const savedFaultName = response.data.detectName || autoFaultName;
        const localEntry: AnnotationEntry = {
          anotationId: detectId, // Use detectId as temporary ID
          type: "add",
          comment: comment,
          author: "Shaveen",
          createdAt: now,
          faultName: savedFaultName // Use backend's saved name
        };
        
        // Add to local timeline entries
        setLocalTimelineEntries(prev => {
          const updated = [localEntry, ...prev];
          // Sort by timestamp immediately (newest first)
          return updated.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        });
        console.log("✅ Created local timeline entry for Add operation:", localEntry);
        
        // Update the prediction we just added with the complete backend response
        setThermalPredictions((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            const lastIndex = updated.length - 1;
            // Update with all details from backend response
            updated[lastIndex] = {
              ...updated[lastIndex],
              detectId: detectId,
              tag: savedFaultName, // Use the saved fault name from backend
              // Update other fields from backend if present
              x: response.data.x ?? updated[lastIndex].x,
              y: response.data.y ?? updated[lastIndex].y,
              width: response.data.width ?? updated[lastIndex].width,
              height: response.data.height ?? updated[lastIndex].height,
              confidence: response.data.confidence ?? updated[lastIndex].confidence,
              label: response.data.className ?? updated[lastIndex].label,
            };
            console.log("✅ Updated prediction with backend data:", updated[lastIndex]);
          }
          return updated;
        });
      } else {
        console.warn("⚠️ No detectId in response!");
      }

      // Refresh annotations timeline to show the new entry
      await fetchAnnotations();
      
      // Refresh the page after successful annotation addition
      window.location.reload();
    } catch (err) {
      console.error("❌ Saving annotation failed:", err);
      if (axios.isAxiosError(err)) {
        console.error("❌ Error details:", err.response?.data);
      }
      alert("Failed to save annotation. Check console for details.");
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
      
      // Refresh the page after successful comment addition
      window.location.reload();
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setCommentTopic(topic);
      setCommentText(text);
      alert("Failed to save comment. Please try again.");
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
      
      // Refresh the page after successful comment edit
      window.location.reload();
    } catch (err) {
      console.error("❌ Failed to update comment:", err);
      setComments(prevComments);
      alert("Failed to update comment.");
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
      
      // Refresh the page after successful comment deletion
      window.location.reload();
    } catch (err) {
      console.error("❌ Failed to delete comment:", err);
      setComments(prevComments);
      alert("Failed to delete comment.");
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
              <span className="text-2xl font-bold text-red-600">
                Annotate  
              </span>
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
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-visible">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAnnotationsExpanded(!isAnnotationsExpanded)}
                className="p-2 bg-gray-700 hover:bg-gray-800 rounded-xl transition-colors shadow-sm"
                title={isAnnotationsExpanded ? "Collapse" : "Expand"}
              >
                {isAnnotationsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </button>
              <h3 className="text-3xl font-bold tracking-tight text-red-700">Annotations Made</h3>
              <span className="text-sm text-gray-500">{annotationsMade.length} change{annotationsMade.length !== 1 ? "s" : ""}</span>
            </div>
            {annotationsMade.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors shadow-sm"
                  title="Export annotations"
                >
                  <Download className="h-5 w-5" />
                  Export
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl border border-gray-200 z-[9999] py-1">
                    <button
                      onClick={() => {
                        exportAnnotationsToCSV(annotationsMade, inspectionNo || "", transformerNo || "");
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <Download className="h-4 w-4 text-gray-500" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        exportAnnotationsToJSON(annotationsMade, inspectionNo || "", transformerNo || "");
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <Download className="h-4 w-4 text-gray-500" />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {isAnnotationsExpanded && (
            <div className="p-6">
              {annotationsMade.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Tag className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">No annotations have been made yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Annotations will appear here when you add, edit, or delete detections.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <th className="px-6 py-6 text-left text-xl font-bold text-gray-700 uppercase tracking-wider">Image ID</th>
                        <th className="px-6 py-6 text-left text-xl font-bold text-gray-700 uppercase tracking-wider">Transformer ID</th>
                        <th className="px-6 py-6 text-left text-xl font-bold text-gray-700 uppercase tracking-wider">Action Taken</th>
                        <th className="px-6 py-6 text-left text-xl font-bold text-gray-700 uppercase tracking-wider">Fault Name</th>
                        <th className="px-6 py-6 text-left text-xl font-bold text-gray-700 uppercase tracking-wider">Comment</th>
                        <th className="px-6 py-6 text-left text-xl font-bold text-gray-700 uppercase tracking-wider">User</th>
                        <th className="px-6 py-6 text-left text-xl font-bold text-gray-700 uppercase tracking-wider">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {annotationsMade.map((a, idx) => (
                        <tr 
                          key={a.anotationId || `local-${idx}`} 
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span className="text-xl font-semibold text-gray-900">
                              {inspectionNo}
                            </span>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span className="text-xl font-semibold text-gray-900">
                              {transformerNo || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-lg font-semibold shadow-sm ${
                              a.type.toLowerCase() === "add"
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : a.type.toLowerCase() === "edit"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : "bg-red-50 text-red-700 ring-1 ring-red-200"
                            }`}>
                              {a.type.toLowerCase() === "add" && (
                                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                              )}
                              {a.type.toLowerCase() === "edit" && (
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                              )}
                              {a.type.toLowerCase() === "delete" && (
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                              )}
                              {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-xl font-semibold text-gray-900">
                              {a.faultName || <span className="text-gray-400">—</span>}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="max-w-2xl">
                              <p className="text-xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {a.comment || <span className="text-gray-400 italic">No comment</span>}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {a.author.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xl font-medium text-gray-900">{a.author}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg font-medium text-gray-900">
                                {new Date(a.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                              <span className="text-base text-gray-500">
                                {new Date(a.createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Detected Issues */}
      <section className="mt-10">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold tracking-tight text-red-600">
                Detected Issues
              </h3>
              {!isAnalyzing && (
                <span className="text-sm text-gray-500">
                  {thermalPredictions.length} item
                  {thermalPredictions.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
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

                    // Check if this detection was added by inspector (vs AI model)
                    const isInspectorDetected = pred.detectId ? addedDetectIds.has(pred.detectId) : false;

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

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
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
                            {/* Source badge */}
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold
                              ${
                                isInspectorDetected
                                  ? "bg-purple-100 text-purple-700 ring-1 ring-purple-200"
                                  : "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                              }`}
                            >
                              {isInspectorDetected ? "Inspector Detected" : "Model Generated"}
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
            </div>
        </div>
      </section>

      {/* Feedback Log */}
      <section className="mt-10">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-visible">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between relative z-10">
            <h3 className="text-3xl font-bold tracking-tight text-red-600">
              Feedback Log
            </h3>
            <div className="relative">
              <button
                onClick={() => setIsFeedbackExportDropdownOpen(!isFeedbackExportDropdownOpen)}
                disabled={thermalPredictions.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                          disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg 
                          font-semibold transition-colors shadow-sm"
              >
                <Download className="h-5 w-5" />
                Export
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isFeedbackExportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl border border-gray-200 z-[9999] py-1">
                  <button
                    onClick={() => {
                      exportFeedbackLogToCSV(thermalPredictions, annotationsMade, inspectionNo || "", addedDetectIds, deletedDetectIds);
                      setIsFeedbackExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <Download className="h-4 w-4 text-gray-500" />
                    <span>Export as CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      exportFeedbackLogToJSON(thermalPredictions, annotationsMade, inspectionNo || "", addedDetectIds, deletedDetectIds);
                      setIsFeedbackExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <Download className="h-4 w-4 text-gray-500" />
                    <span>Export as JSON</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comments by Inspector */}
      <section className="mt-10">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                className="p-2 bg-gray-700 hover:bg-gray-800 rounded-xl transition-colors shadow-sm"
                title={isCommentsExpanded ? "Collapse" : "Expand"}
              >
                {isCommentsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </button>
              <h3 className="text-3xl font-bold tracking-tight text-red-600">
                Comments by Inspector
              </h3>
              <span className="text-sm text-gray-500">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Collapsible Comments List */}
            {isCommentsExpanded && (
              <>
                {comments.length > 0 ? (
                  <div className="relative mb-10">
                    <ul className="space-y-5">
                    {comments.map((c, i) => {
                      const isEditing = editingId === (c.id || "");
                      const isSavingThis = savingEditId === (c.id || "");
                      const isDeletingThis = deletingId === (c.id || "");
                      return (
                        <li key={c.id ?? `${c.timestamp}-${i}`} className="relative">
                          <div className="group rounded-xl border border-gray-200 bg-white shadow-lg hover:shadow-xl hover:border-blue-400 transition-all duration-300 overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-gray-200">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="p-2.5 bg-blue-500 rounded-lg shadow-sm shrink-0">
                                  <Tag className="h-5 w-5 text-white" />
                                </div>
                                {isEditing ? (
                                  <input
                                    value={editTopic}
                                    onChange={(e) => setEditTopic(e.target.value)}
                                    className="w-full rounded-lg border-2 border-blue-300 px-4 py-2.5 text-xl font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white shadow-sm"
                                  />
                                ) : (
                                  <h5 className="text-xl md:text-2xl font-bold text-gray-900">
                                    {c.topic}
                                  </h5>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                  <Clock className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    {formatDateTime(c.timestamp)}
                                  </span>
                                </div>
                                {c.author && (
                                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm">
                                    <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                                      <UserIcon className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-bold text-white">{c.author}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  {!isEditing ? (
                                    <>
                                      <button
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                        onClick={() => startEdit(c)}
                                        title="Edit"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors ${
                                          isDeletingThis ? "opacity-60 pointer-events-none" : ""
                                        }`}
                                        onClick={() => deleteComment(c.id || "")}
                                        title="Delete"
                                      >
                                        {isDeletingThis ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm ${
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
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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

                            <div className="px-6 py-6 bg-white">
                              {isEditing ? (
                                <div className="relative">
                                  <MessageSquareText className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full min-h-40 rounded-lg border-2 border-gray-300 pl-12 pr-4 py-4
                                               text-lg leading-relaxed shadow-sm placeholder:text-gray-400
                                               focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                  />
                                </div>
                              ) : (
                                <p className="text-lg md:text-xl leading-relaxed text-gray-700 whitespace-pre-wrap">
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
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <MessageSquareText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-700 mb-1">
                    No Comments Yet
                  </p>
                  <p className="text-base text-gray-500">
                    Add your first inspection comment below
                  </p>
                </div>
              )}
              </>
            )}

            {/* Composer - Always Visible */}
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
      </section>

      {/* --------- Details Modal (Fault Name, Condition, Confidence) --------- */}
      {/* ------------------------ Comment modal with condition type ------------------------ */}
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
          
          {/* Condition Type */}
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
          
          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold mb-1">Comment</label>
            <textarea
              className="w-full min-h-28 border rounded-lg px-3 py-2"
              value={annoComment}
              onChange={(e) => setAnnoComment(e.target.value)}
              placeholder="Comment about why this box was added"
            />
          </div>
          
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