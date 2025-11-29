import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import { Save, Trash2, Plus, X, Download, FileText, ArrowLeft, Printer } from 'lucide-react';

interface MaintenanceFormData {
  transformerNumber: string;
  inspectorName: string;
  transformerStatus: string;
  voltage: number | '';
  current: number | '';
  recommendedAction: string;
  additionalRemarks: string;
  otherNotes: string;
  inspectionsNumbers: string[];
}

interface MaintenanceRecord {
  id?: number;
  inspectorName: string;
  transformerStatus: string;
  voltage: number;
  current: number;
  recommendedAction: string;
  additionalRemarks: string;
  otherNotes: string;
  transformer?: any;
  inspections?: InspectionDetail[];
}

interface InspectionDetail {
  inspectionNumber: string;
  transformerNumber: string;
  inspectionDate: string;
  inspectionTime: string;
  branch: string;
  maintenanceDate: string;
  maintenanceTime: string;
  status: string;
}

interface Detection {
  detectId: number;
  inspectionNumber: string;
  detectName: string;
  className: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Comment {
  id: number;
  author: string;
  topic: string;
  comment: string;
  createdAt: string;
}

interface TransformerDetails {
  transformerNumber: string;
  poleNumber: string;
  region: string;
  type: string;
  locationDetails: string;
}

const MaintenanceRecordForm: React.FC = () => {
  const { transformerNumber } = useParams<{ transformerNumber: string }>();
  const navigate = useNavigate();
  
  const technicianSignatureRef = useRef<SignatureCanvas>(null);
  const supervisorSignatureRef = useRef<SignatureCanvas>(null);

  // Helper function to draw bounding boxes on image
  const drawBoundingBoxesOnImage = async (imageBlob: Blob, detections: Detection[]): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Draw bounding boxes
          detections.forEach((detection) => {
            const left = detection.x - detection.width / 2;
            const top = detection.y - detection.height / 2;
            
            // Set color based on className
            let color = 'limegreen';
            if (detection.className === 'pf') color = 'red';
            else if (detection.className === 'f') color = 'orange';
            
            // Draw rectangle
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(left, top, detection.width, detection.height);
            
            // Draw label background - use detectName if available, otherwise className
            const label = detection.detectName || detection.className || 'Unknown';
            ctx.font = 'bold 16px Arial';
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = color;
            ctx.fillRect(left, top - 25, textWidth + 10, 25);
            
            // Draw label text
            ctx.fillStyle = 'white';
            ctx.fillText(label, left + 5, top - 7);
          });
        }
        
        // Convert canvas to blob URL
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(URL.createObjectURL(imageBlob)); // Fallback to original
          }
        }, 'image/jpeg', 0.95);
      };
      
      img.onerror = () => {
        resolve(URL.createObjectURL(imageBlob)); // Fallback to original
      };
      
      img.src = URL.createObjectURL(imageBlob);
    });
  };

  const [formData, setFormData] = useState<MaintenanceFormData>({
    transformerNumber: transformerNumber || '',
    inspectorName: '',
    transformerStatus: 'Operational',
    voltage: '',
    current: '',
    recommendedAction: '',
    additionalRemarks: '',
    otherNotes: '',
    inspectionsNumbers: []
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingRecords, setExistingRecords] = useState<MaintenanceRecord[]>([]);
  const [showRecordsList, setShowRecordsList] = useState(false);
  const [availableInspections, setAvailableInspections] = useState<InspectionDetail[]>([]);
  const [inspectionImages, setInspectionImages] = useState<Map<string, string>>(new Map());
  const [transformerDetails, setTransformerDetails] = useState<TransformerDetails | null>(null);
  const [inspectionDetections, setInspectionDetections] = useState<Map<string, Detection[]>>(new Map());
  const [inspectionComments, setInspectionComments] = useState<Map<string, Comment[]>>(new Map());

  // Fetch existing maintenance records and available inspections
  useEffect(() => {
    const fetchData = async () => {
      if (!transformerNumber) return;
      
      try {
        // Fetch transformer details
        const transformerResponse = await axios.get(
          `http://localhost:8080/api/v1/transformers/${transformerNumber}`
        );
        setTransformerDetails(transformerResponse.data);

        // Fetch maintenance records
        const recordsResponse = await axios.get(
          `http://localhost:8080/api/v1/transformers/${transformerNumber}/maintenance-report`
        );
        setExistingRecords(recordsResponse.data);

        // Fetch inspections for this transformer
        const inspectionsResponse = await axios.get(
          `http://localhost:8080/api/v1/transformers/${transformerNumber}/inspections`
        );
        const inspections = inspectionsResponse.data;
        setAvailableInspections(inspections);

        // Fetch detections for all inspections first
        const detectionPromises = inspections.map(async (inspection: InspectionDetail) => {
          try {
            const response = await axios.get(
              `http://localhost:8080/api/v1/inspections/${inspection.inspectionNumber}/analyze`
            );
            return {
              inspectionNumber: inspection.inspectionNumber,
              detections: response.data
            };
          } catch (err) {
            console.error(`Error loading detections for ${inspection.inspectionNumber}:`, err);
            return {
              inspectionNumber: inspection.inspectionNumber,
              detections: []
            };
          }
        });

        const detectionsData = await Promise.all(detectionPromises);
        const detectionsMap = new Map();
        detectionsData.forEach(data => {
          detectionsMap.set(data.inspectionNumber, data.detections);
        });
        setInspectionDetections(detectionsMap);

        // Fetch comments for all inspections
        const commentPromises = inspections.map(async (inspection: InspectionDetail) => {
          try {
            const response = await axios.get(
              `http://localhost:8080/api/v1/inspections/${inspection.inspectionNumber}/comments`
            );
            return {
              inspectionNumber: inspection.inspectionNumber,
              comments: response.data
            };
          } catch (err) {
            console.error(`Error loading comments for ${inspection.inspectionNumber}:`, err);
            return {
              inspectionNumber: inspection.inspectionNumber,
              comments: []
            };
          }
        });

        const commentsData = await Promise.all(commentPromises);
        const commentsMap = new Map();
        commentsData.forEach(data => {
          commentsMap.set(data.inspectionNumber, data.comments);
          console.log(`Comments for ${data.inspectionNumber}:`, data.comments);
        });
        setInspectionComments(commentsMap);
        console.log('All comments loaded:', commentsMap);

        // Fetch images and draw bounding boxes on them
        const imagePromises = inspections.map(async (inspection: InspectionDetail) => {
          try {
            const response = await axios.get(
              `http://localhost:8080/api/v1/inspections/${inspection.inspectionNumber}/image`,
              { responseType: 'blob' }
            );
            
            // Get detections for this inspection
            const detections = detectionsMap.get(inspection.inspectionNumber) || [];
            
            // Draw bounding boxes on image
            const annotatedImageUrl = await drawBoundingBoxesOnImage(response.data, detections);
            
            return {
              inspectionNumber: inspection.inspectionNumber,
              imageUrl: annotatedImageUrl
            };
          } catch (err) {
            console.error(`Error loading image for ${inspection.inspectionNumber}:`, err);
            return null;
          }
        });

        const images = await Promise.all(imagePromises);
        const imageMap = new Map();
        images.forEach(img => {
          if (img) imageMap.set(img.inspectionNumber, img.imageUrl);
        });
        setInspectionImages(imageMap);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [transformerNumber]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const clearSignature = (ref: React.RefObject<SignatureCanvas | null>) => {
    ref.current?.clear();
  };

  const loadExistingRecord = (record: MaintenanceRecord) => {
    setFormData({
      transformerNumber: transformerNumber || '',
      inspectorName: record.inspectorName,
      transformerStatus: record.transformerStatus,
      voltage: record.voltage || '',
      current: record.current || '',
      recommendedAction: record.recommendedAction,
      additionalRemarks: record.additionalRemarks,
      otherNotes: record.otherNotes,
      inspectionsNumbers: record.inspections?.map(i => i.inspectionNumber) || []
    });
    setShowRecordsList(false);
  };

  const printExistingReport = async (record: MaintenanceRecord) => {
    try {
      // Temporarily load the record data
      const originalFormData = { ...formData };
      
      // Set form data to the record
      setFormData({
        transformerNumber: transformerNumber || '',
        inspectorName: record.inspectorName,
        transformerStatus: record.transformerStatus,
        voltage: record.voltage || '',
        current: record.current || '',
        recommendedAction: record.recommendedAction,
        additionalRemarks: record.additionalRemarks,
        otherNotes: record.otherNotes,
        inspectionsNumbers: record.inspections?.map(i => i.inspectionNumber) || []
      });

      // Generate PDF with record data (detections are already loaded in state)
      setTimeout(async () => {
        const pdfBlob = await generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        
        // Open in new window for printing
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 250);
          };
        }
        
        // Restore original form data after a delay
        setTimeout(() => {
          setFormData(originalFormData);
          URL.revokeObjectURL(url);
        }, 500);
      }, 100);
    } catch (err) {
      console.error('Error printing report:', err);
      alert('Failed to print report');
    }
  };

  const generatePDF = async (): Promise<Blob> => {
    const doc = new jsPDF();
    let yPosition = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    // Helper function to add a new page with header
    const addNewPage = () => {
      doc.addPage();
      yPosition = 15;
      // Add page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);
    };

    // Add border to first page
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);

    // Header with blue background
    doc.setFillColor(41, 128, 185); // Blue color
    doc.rect(margin, yPosition, contentWidth, 20, 'F');
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text
    doc.text('MAINTENANCE RECORD REPORT', pageWidth / 2, yPosition + 13, { align: 'center' });
    yPosition += 28;

    // Report date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generated: ${reportDate}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 12;

    // Reset text color for content
    doc.setTextColor(0, 0, 0);

    // Transformer Information Section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('TRANSFORMER INFORMATION', margin + 2, yPosition + 6);
    yPosition += 12;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    
    // Two-column layout for transformer info
    const col1X = margin + 5;
    const col2X = pageWidth / 2 + 5;
    
    doc.text('Transformer Number:', col1X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(formData.transformerNumber || 'N/A'), col1X + 50, yPosition);
    
    if (transformerDetails?.poleNumber) {
      doc.setFont('helvetica', 'bold');
      doc.text('Pole Name:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(String(transformerDetails.poleNumber), col2X + 30, yPosition);
    }
    yPosition += 7;
    
    if (transformerDetails?.type) {
      doc.setFont('helvetica', 'bold');
      doc.text('Type:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(String(transformerDetails.type), col1X + 50, yPosition);
    }
    
    if (transformerDetails?.region) {
      doc.setFont('helvetica', 'bold');
      doc.text('Region:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(String(transformerDetails.region), col2X + 30, yPosition);
    }
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', col1X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(formData.transformerStatus || 'N/A'), col1X + 50, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Inspector:', col2X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(formData.inspectorName || 'N/A'), col2X + 30, yPosition);
    yPosition += 12;

    // Electrical Readings Section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('ELECTRICAL READINGS', margin + 2, yPosition + 6);
    yPosition += 12;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Voltage:', col1X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formData.voltage || 'N/A'} V`, col1X + 50, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Current:', col2X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formData.current || 'N/A'} A`, col2X + 30, yPosition);
    yPosition += 12;

    // Recommended Action Section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('RECOMMENDED ACTION', margin + 2, yPosition + 6);
    yPosition += 12;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const actionLines = doc.splitTextToSize(formData.recommendedAction || 'N/A', contentWidth - 10);
    doc.text(actionLines, margin + 5, yPosition);
    yPosition += actionLines.length * 5 + 10;

    // Additional Remarks Section
    if (formData.additionalRemarks) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('ADDITIONAL REMARKS', margin + 2, yPosition + 6);
      yPosition += 12;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      const remarksLines = doc.splitTextToSize(formData.additionalRemarks || '', contentWidth - 10);
      doc.text(remarksLines, margin + 5, yPosition);
      yPosition += remarksLines.length * 5 + 10;
    }

    // Other Notes Section
    if (formData.otherNotes) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('OTHER NOTES', margin + 2, yPosition + 6);
      yPosition += 12;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(formData.otherNotes || '', contentWidth - 10);
      doc.text(notesLines, margin + 5, yPosition);
      yPosition += notesLines.length * 5 + 10;
    }

    // Related Inspections Section
    if (availableInspections.length > 0) {
      try {
        if (yPosition > 240) {
          addNewPage();
        }
        
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition, contentWidth, 8, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text(`RELATED INSPECTIONS (${availableInspections.length})`, margin + 2, yPosition + 6);
        yPosition += 12;
        
        for (const inspection of availableInspections) {
          // Check if we need a new page
          if (yPosition > 240) {
            addNewPage();
          }

          // Inspection box with border
          doc.setDrawColor(41, 128, 185);
          doc.setLineWidth(0.5);
          doc.rect(margin + 3, yPosition, contentWidth - 6, 25);
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`Inspection: ${String(inspection.inspectionNumber || 'N/A')}`, margin + 6, yPosition + 6);
          
          // Status badge
          const statusX = pageWidth - margin - 35;
          const statusText = String(inspection.status || 'N/A');
          if (inspection.status === 'Completed') {
            doc.setFillColor(76, 175, 80);
          } else if (inspection.status === 'Pending') {
            doc.setFillColor(255, 193, 7);
          } else {
            doc.setFillColor(158, 158, 158);
          }
          doc.roundedRect(statusX, yPosition + 2, 30, 6, 2, 2, 'F');
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text(statusText, statusX + 15, yPosition + 6, { align: 'center' });
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          doc.text(`Date: ${String(inspection.inspectionDate || 'N/A')} at ${String(inspection.inspectionTime || 'N/A')}`, margin + 6, yPosition + 12);
          doc.text(`Branch: ${String(inspection.branch || 'N/A')}`, margin + 6, yPosition + 17);
          if (inspection.maintenanceDate) {
            doc.text(`Maintenance: ${String(inspection.maintenanceDate)} at ${String(inspection.maintenanceTime || 'N/A')}`, margin + 6, yPosition + 22);
          }
          yPosition += 28;

          // Add detected issues
          const detections = inspectionDetections.get(inspection.inspectionNumber);
          if (detections && detections.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(200, 0, 0);
            doc.text(`Detected Issues (${detections.length}):`, margin + 6, yPosition);
            yPosition += 6;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            detections.forEach((detection) => {
              if (yPosition > 250) {
                addNewPage();
              }
              const detectionName = detection.detectName || detection.className;
              doc.text(`- ${String(detectionName)} (${(detection.confidence * 100).toFixed(1)}% confidence)`, margin + 10, yPosition);
              yPosition += 5;
            });
            yPosition += 1;
          }

          // Add comments if available
          const comments = inspectionComments.get(inspection.inspectionNumber);
          console.log(`PDF: Comments for ${inspection.inspectionNumber}:`, comments);
          if (comments && comments.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text(`Comments:`, margin + 6, yPosition);
            yPosition += 6;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            comments.forEach((comment) => {
              if (yPosition > 250) {
                addNewPage();
              }
              doc.setFont('helvetica', 'bold');
              doc.text(`- ${String(comment.topic || 'N/A')}`, margin + 10, yPosition);
              yPosition += 4;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              const commentLines = doc.splitTextToSize(String(comment.comment || ''), contentWidth - 30);
              doc.text(commentLines, margin + 12, yPosition);
              yPosition += commentLines.length * 4;
              doc.setFontSize(8);
              doc.setTextColor(120, 120, 120);
              doc.text(`By: ${String(comment.author || 'Unknown')} - ${String(comment.createdAt || '')}`, margin + 12, yPosition);
              yPosition += 5;
              doc.setFontSize(10);
              doc.setTextColor(60, 60, 60);
            });
            yPosition += 1;
          }

          // Add inspection image if available
          const imageUrl = inspectionImages.get(inspection.inspectionNumber);
          if (imageUrl) {
            try {
              // Check if we need a new page for the image
              if (yPosition > 160) {
                addNewPage();
              }
              
              // Add image title
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(60, 60, 60);
              doc.text('Annotated Image with Detections:', margin + 6, yPosition);
              yPosition += 5;
              
              // Create a temporary image to ensure it's loaded
              const img = new Image();
              img.src = imageUrl;
              
              // Wait for image to load or timeout after 1 second
              await new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(() => resolve(), 1000);
              });
              
              // Image with border
              const imageWidth = 120;
              const imageHeight = 70;
              const imageX = margin + (contentWidth - imageWidth) / 2; // Center the image
              doc.setDrawColor(180, 180, 180);
              doc.setLineWidth(0.3);
              doc.addImage(imageUrl, 'JPEG', imageX, yPosition, imageWidth, imageHeight);
              doc.rect(imageX, yPosition, imageWidth, imageHeight);
              yPosition += imageHeight + 2;
            } catch (err) {
              console.error('Error adding image to PDF:', err);
              doc.setTextColor(150, 150, 150);
              doc.setFontSize(10);
              doc.text('(Image could not be loaded)', margin + 5, yPosition);
              yPosition += 3;
            }
          } else {
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(10);
            doc.text('(No image available)', margin + 5, yPosition);
            yPosition += 3;
          }
          
          yPosition += 3;
        }
      } catch (err) {
        console.error('Error in inspections section:', err);
        // Continue with PDF generation even if inspections fail
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.text('(Error loading inspections)', margin + 5, yPosition);
        yPosition += 10;
      }
    }

    // Signatures Section
    if (yPosition > 200) {
      addNewPage();
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('SIGNATURES', margin + 2, yPosition + 6);
    yPosition += 15;

    doc.setTextColor(0, 0, 0);
    const sigWidth = 65;
    const sigHeight = 25;
    const sig1X = margin + 10;
    const sig2X = pageWidth / 2 + 10;

    // Technician signature
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(sig1X, yPosition, sigWidth, sigHeight);
    
    if (technicianSignatureRef.current && !technicianSignatureRef.current.isEmpty()) {
      const techSigImage = technicianSignatureRef.current.toDataURL();
      doc.addImage(techSigImage, 'PNG', sig1X + 2, yPosition + 2, sigWidth - 4, sigHeight - 4);
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Technician Signature', sig1X + sigWidth / 2, yPosition + sigHeight + 6, { align: 'center' });
    
    // Supervisor signature
    doc.rect(sig2X, yPosition, sigWidth, sigHeight);
    
    if (supervisorSignatureRef.current && !supervisorSignatureRef.current.isEmpty()) {
      const supSigImage = supervisorSignatureRef.current.toDataURL();
      doc.addImage(supSigImage, 'PNG', sig2X + 2, yPosition + 2, sigWidth - 4, sigHeight - 4);
    }
    
    doc.text('Supervisor Signature', sig2X + sigWidth / 2, yPosition + sigHeight + 6, { align: 'center' });

    // Footer
    yPosition = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('This is a computer-generated maintenance report', pageWidth / 2, yPosition, { align: 'center' });

    return doc.output('blob');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare request body matching MaintenanceReportRequest DTO
      const requestBody = {
        transformerNumber: formData.transformerNumber,
        inspectorName: formData.inspectorName,
        voltage: formData.voltage === '' ? null : Number(formData.voltage),
        current: formData.current === '' ? null : Number(formData.current),
        recommendedAction: formData.recommendedAction,
        additionalRemarks: formData.additionalRemarks,
        otherNotes: formData.otherNotes,
        inspectionsNumbers: availableInspections.map(i => i.inspectionNumber)
      };

      // Submit to backend
      await axios.post(
        `http://localhost:8080/api/v1/transformers/${formData.transformerNumber}/maintenance-report`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Maintenance report submitted successfully!');
      navigate(`/transformers/${formData.transformerNumber}/history`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit maintenance report');
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFPreview = async () => {
    try {
      const pdfBlob = await generatePDF();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance-report-${formData.transformerNumber}-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error generating PDF preview:', err);
      alert(`Failed to generate PDF preview: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200">
      <div className="mb-8 pb-6 border-b-2 border-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 text-lg bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200 hover:shadow-md"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Maintenance Record Form</h1>
          </div>
        </div>
        <p className="text-lg text-gray-600 ml-16">Complete all required fields and submit the maintenance report</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-lg">{error}</p>
        </div>
      )}

      {/* Existing Records Section */}
      {existingRecords.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-700 rounded-lg">
                <FileText size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Existing Maintenance Records
                <span className="ml-2 text-lg font-normal text-gray-500">({existingRecords.length})</span>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowRecordsList(!showRecordsList)}
              className="px-6 py-2.5 text-lg border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
            >
              {showRecordsList ? 'Hide Records' : 'Show Records'}
            </button>
          </div>

          {showRecordsList && (
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {existingRecords.map((record, index) => (
                <div
                  key={record.id || index}
                  className="p-4 bg-white border border-gray-300 rounded-md hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-base font-medium text-gray-500">ID</p>
                          <p className="text-lg font-semibold text-gray-900">#{record.id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-500">Inspector</p>
                          <p className="text-lg font-semibold text-gray-900">{record.inspectorName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-500">Status</p>
                          <span className={`inline-block px-2 py-1 text-base font-semibold rounded-full ${
                            record.transformerStatus === 'Operational' ? 'bg-green-100 text-green-800' :
                            record.transformerStatus === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.transformerStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Readings</p>
                          <p className="text-base font-semibold text-gray-900">
                            {record.voltage || 'N/A'}V / {record.current || 'N/A'}A
                          </p>
                        </div>
                      </div>
                      {record.recommendedAction && (
                        <p className="text-base text-gray-600 line-clamp-2 mb-2">
                          <span className="font-medium">Action: </span>
                          {record.recommendedAction}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => printExistingReport(record)}
                        className="flex items-center gap-1 px-3 py-1.5 border-2 border-gray-300 text-gray-700 text-base rounded-md hover:bg-gray-50 transition-colors"
                        title="Print Report"
                      >
                        <Printer size={16} />
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() => loadExistingRecord(record)}
                        className="px-3 py-1.5 border-2 border-gray-300 text-gray-700 text-base rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Basic Information */}
      <section className="mb-8 pb-8 border-b border-gray-200 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-300">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Transformer Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="transformerNumber"
              value={formData.transformerNumber}
              onChange={handleInputChange}
              required
              readOnly
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Pole Name
            </label>
            <input
              type="text"
              value={transformerDetails?.poleNumber || 'Loading...'}
              readOnly
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Type
            </label>
            <input
              type="text"
              value={transformerDetails?.type || 'Loading...'}
              readOnly
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Region
            </label>
            <input
              type="text"
              value={transformerDetails?.region || 'Loading...'}
              readOnly
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Inspector Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="inspectorName"
              value={formData.inspectorName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Transformer Status</label>
            <select
              name="transformerStatus"
              value={formData.transformerStatus}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="Operational">Operational</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Out of Service">Out of Service</option>
              <option value="Faulty">Faulty</option>
            </select>
          </div>
        </div>
      </section>

      {/* Electrical Readings */}
      <section className="mb-8 pb-8 border-b border-gray-200 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-300">Electrical Readings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Voltage (V)</label>
            <input
              type="number"
              step="0.01"
              name="voltage"
              value={formData.voltage}
              onChange={handleInputChange}
              placeholder="e.g., 230.5"
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Current (A)</label>
            <input
              type="number"
              step="0.01"
              name="current"
              value={formData.current}
              onChange={handleInputChange}
              placeholder="e.g., 15.3"
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
      </section>

      {/* Recommended Action */}
      <section className="mb-8 pb-8 border-b border-gray-200 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-300">Recommended Action</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Recommended Action <span className="text-red-500">*</span>
            </label>
            <textarea
              name="recommendedAction"
              value={formData.recommendedAction}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe the recommended actions..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
      </section>

      {/* Additional Remarks */}
      <section className="mb-8 pb-8 border-b border-gray-200 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-300">Additional Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Additional Remarks</label>
            <textarea
              name="additionalRemarks"
              value={formData.additionalRemarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional remarks..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Other Notes</label>
            <textarea
              name="otherNotes"
              value={formData.otherNotes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any other notes..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
      </section>

      {/* Related Inspections */}
      <section className="mb-8 pb-8 border-b border-gray-200 bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 pb-3 border-b-2 border-gray-300">
            Related Inspections
            <span className="ml-3 text-lg font-normal text-gray-500">
              ({availableInspections.length} inspection{availableInspections.length !== 1 ? 's' : ''})
            </span>
          </h2>
          <p className="text-lg text-gray-600 mt-2">All inspections for this transformer will be included in the report</p>
        </div>

        {availableInspections.length > 0 ? (
          <div className="space-y-2">
            {availableInspections.map((inspection) => (
              <div
                key={inspection.inspectionNumber}
                className="p-4 border-2 border-gray-200 bg-white rounded-lg shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {inspection.inspectionNumber}
                      </h3>
                      <span className={`px-2 py-0.5 text-base font-medium rounded-full ${
                        inspection.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        inspection.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inspection.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-base mb-3">
                      <div>
                        <p className="text-gray-500 text-base">Inspection Date</p>
                        <p className="font-medium text-gray-900 text-lg">{inspection.inspectionDate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-base">Inspection Time</p>
                        <p className="font-medium text-gray-900 text-lg">{inspection.inspectionTime || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-base">Branch</p>
                        <p className="font-medium text-gray-900 text-lg">{inspection.branch || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-base">Maintenance Date</p>
                        <p className="font-medium text-gray-900 text-lg">{inspection.maintenanceDate || 'N/A'}</p>
                      </div>
                    </div>
                    {/* Detected Issues */}
                    {inspectionDetections.get(inspection.inspectionNumber) && 
                     inspectionDetections.get(inspection.inspectionNumber)!.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-base font-medium text-gray-700 mb-2">Detected Issues ({inspectionDetections.get(inspection.inspectionNumber)!.length}):</p>
                        <div className="space-y-1">
                          {inspectionDetections.get(inspection.inspectionNumber)!.map((detection, idx) => (
                            <div key={detection.detectId} className="flex items-center gap-2 text-base">
                              <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="font-medium text-gray-700">{detection.detectName || detection.className}</span>
                              <span className="text-gray-500">({(detection.confidence * 100).toFixed(1)}% confidence)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Comments */}
                    {inspectionComments.get(inspection.inspectionNumber) && 
                     inspectionComments.get(inspection.inspectionNumber)!.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-base font-medium text-gray-700 mb-2">Comments:</p>
                        <div className="space-y-2">
                          {inspectionComments.get(inspection.inspectionNumber)!.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-800 text-base">{comment.topic}</span>
                                <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-base text-gray-700 mb-1">{comment.comment}</p>
                              <p className="text-sm text-gray-500">By: {comment.author}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Inspection Image */}
                    {inspectionImages.get(inspection.inspectionNumber) && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-base font-medium text-gray-500 mb-2">Annotated Image with Detections:</p>
                        <img
                          src={inspectionImages.get(inspection.inspectionNumber)}
                          alt={`Inspection ${inspection.inspectionNumber}`}
                          className="w-full max-w-md h-auto rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No inspections available for this transformer</p>
          </div>
        )}
      </section>

      {/* Signatures */}
      <section className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-300">Signatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Technician Signature</label>
            <div className="border-2 border-gray-300 rounded-md bg-white">
              <SignatureCanvas
                ref={technicianSignatureRef}
                canvasProps={{
                  className: 'w-full h-40',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => clearSignature(technicianSignatureRef)}
              className="mt-2 flex items-center gap-2 px-3 py-1 text-base text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Supervisor Signature</label>
            <div className="border-2 border-gray-300 rounded-md bg-white">
              <SignatureCanvas
                ref={supervisorSignatureRef}
                canvasProps={{
                  className: 'w-full h-40',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => clearSignature(supervisorSignatureRef)}
              className="mt-2 flex items-center gap-2 px-3 py-1 text-base text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6">
        <button
          type="button"
          onClick={downloadPDFPreview}
          className="flex items-center gap-2 px-8 py-3.5 text-lg border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <Download size={22} />
          Preview PDF
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-8 py-3.5 text-lg border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3.5 text-lg border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <Save size={22} />
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceRecordForm;
