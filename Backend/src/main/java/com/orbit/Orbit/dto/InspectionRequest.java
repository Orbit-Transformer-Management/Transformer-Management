package com.orbit.Orbit.dto;

public record InspectionRequest(
        String inspectionNumber,
        String transformerNumber,
        String inspectionDate,
        String inspectionTime,
        String branch,
        String maintenanceDate,
        String maintenanceTime,
        String status
) {} // Getters and setters generated automatically
