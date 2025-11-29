package com.orbit.Orbit.dto;

import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.model.MaintenanceRecord;

import java.util.List;

public class MaintenceReportResponse {
    private MaintenanceRecord maintenanceRecord;
    private List<Inspection> inspections;

    public MaintenceReportResponse(MaintenanceRecord maintenanceRecord, List<Inspection> inspections) {
        this.maintenanceRecord = maintenanceRecord;
        this.inspections = inspections;
    }

    public MaintenanceRecord getMaintenanceRecord() {
        return maintenanceRecord;
    }

    public void setMaintenanceRecord(MaintenanceRecord maintenanceRecord) {
        this.maintenanceRecord = maintenanceRecord;
    }

    public List<Inspection> getInspections() {
        return inspections;
    }

    public void setInspections(List<Inspection> inspections) {
        this.inspections = inspections;
    }
}
