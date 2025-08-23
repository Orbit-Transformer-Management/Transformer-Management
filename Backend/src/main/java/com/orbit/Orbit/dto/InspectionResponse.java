package com.orbit.Orbit.dto;

import com.orbit.Orbit.model.Inspection;

public record InspectionResponse(
        String inspectionNumber,
        String transformerNumber,
        String inspectionDate,
        String inspectionTime,
        String branch,
        String maintenanceDate,
        String maintenanceTime,
        String status
) {
    // Custom constructor that maps from entity -> record
    public InspectionResponse(Inspection inspection) {
        this(
                inspection.getInspectionNumber(),
                inspection.getTransformer().getTransformerNumber(),
                inspection.getInspectionDate(),
                inspection.getInspectionTime(),
                inspection.getBranch(),
                inspection.getMaintenanceDate(),
                inspection.getMaintenanceTime(),
                inspection.getStatus()
        );
    }
}
