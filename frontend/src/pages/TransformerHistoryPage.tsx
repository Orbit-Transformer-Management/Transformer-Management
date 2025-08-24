import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/common/PageLayout";
import { Star, MoreVertical, ChevronLeft } from "lucide-react";
import AddInspectionModal from '../components/AddInspectionModal';

interface TransformerInfo {
  id: string;
  transformerNumber : string;
  region: string;
  poleNumber: string;
  capacity: string;
  type: string;
  feeders: number;
  lastInspected: string;
}

interface Inspection {
  inspectionNumber: string;
  inspectionDate: string;
  maintenanceDate: string;
  status: string;
  isFavorite?: boolean;
}

const TransformerInspectionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transformerInfo, setTransformerInfo] = useState<TransformerInfo | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  // Fetch transformer details + inspections
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Transformer details
        const transformerRes = await axios.get(
          `http://localhost:8080/api/v1/transformers/${id}`
        );
        setTransformerInfo(transformerRes.data);

        // Inspections
        const inspectionRes = await axios.get(
          `http://localhost:8080/api/v1/transformers/${id}/inspections`
        );

        // Add isFavorite flag (default false unless you have it in API)
        const formattedInspections = inspectionRes.data.map((insp: Inspection) => ({
          ...insp,
          isFavorite: false,
        }));

        setInspections(formattedInspections);
      } catch (error) {
        console.error("Error fetching transformer or inspections:", error);
      }
    };

    fetchData();
  }, [id]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-red-100 text-red-700";
      case "Completed":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const InfoCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-gray-100 p-2 rounded-md text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  );

  return (
    <PageLayout title={`Transformer Details - ${transformerInfo?.id || ""}`}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{transformerInfo?.id}</h1>
            <p className="text-gray-500">{transformerInfo?.region}</p>
          </div>
        </div>
        <div className="text-right pt-2">
          <p className="text-sm text-gray-500">
            Last Inspected Date: {transformerInfo?.lastInspected || "-"}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      {transformerInfo && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <InfoCard label="Transfomer ID" value={transformerInfo.transformerNumber} />
          <InfoCard label="Pole No" value={transformerInfo.poleNumber} />
          <InfoCard label="Type" value={transformerInfo.type} />
          <InfoCard label="Location" value={transformerInfo.region} />
        </div>
      )}

      {/* Inspections Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Transformer Inspections</h2>
          <button
            onClick={() => {
              // open a modal or navigate to "Add Inspection"
            }}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-semibold shadow transition-colors"
          >
            Add Inspection
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500 px-4 mb-2">
          <div className="col-span-3">Inspection No</div>
          <div className="col-span-3">Inspected Date</div>
          <div className="col-span-3">Maintenance Date</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="space-y-2">
          {inspections.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-md hover:bg-gray-100"
            >
              <div className="col-span-3 flex items-center">
                <Star
                  className={`mr-3 ${
                    item.isFavorite ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                  size={20}
                />
                <span className="font-medium text-gray-800">
                  {item.inspectionNumber}
                </span>
              </div>
              <div className="col-span-3 text-gray-600">{item.inspectionDate}</div>
              <div className="col-span-3 text-gray-600">{item.maintenanceDate}</div>
              <div className="col-span-1">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end space-x-2">
<button
  onClick={() => navigate(`/transformers/${id}/upload`, {
    state: { inspectionNumber: item.inspectionNumber } // optional, pass extra data
  })}
  className="bg-indigo-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-indigo-600"
>
  View
</button>

                <button className="text-gray-400 hover:text-gray-600 p-2">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}

          {inspections.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No inspections found for this transformer.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default TransformerInspectionsPage;
