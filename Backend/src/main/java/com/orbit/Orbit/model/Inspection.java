package com.orbit.Orbit.model;

import java.time.LocalDate;
import java.time.LocalTime;

public class Inspection {
    private String inspectionNumber;
    private String transformerNumber;
    private String inspectionDate;
    private String inspectionTime;
    private String branch;
    private String maintenanceDate;
    private String maintenanceTime;
    private String status;
    private String inspection_image_url;



    public Inspection() {
    }


    public Inspection(String inspectionNumber, String transformerNumber, String inspectionDate, String inspectionTime, String branch, String maintenanceDate, String maintenanceTime, String status) {
        this.inspectionNumber = inspectionNumber;
        this.transformerNumber = transformerNumber;
        this.inspectionDate = inspectionDate;
        this.inspectionTime = inspectionTime;
        this.branch = branch;
        this.maintenanceDate = maintenanceDate;
        this.maintenanceTime = maintenanceTime;
        this.status = status;
    }

    public String getInspectionNumber() {
        return inspectionNumber;
    }

    public void setInspectionNumber(String inspectionNumber) {
        this.inspectionNumber = inspectionNumber;
    }

    public String getTransformerNumber() {
        return transformerNumber;
    }

    public void setTransformerNumber(String transformerNumber) {
        this.transformerNumber = transformerNumber;
    }

    public String getInspectionDate() {
        return inspectionDate;
    }

    public void setInspectionDate(String inspectionDate) {
        this.inspectionDate = inspectionDate;
    }

    public String getInspectionTime() {
        return inspectionTime;
    }

    public void setInspectionTime(String inspectionTime) {
        this.inspectionTime = inspectionTime;
    }

    public String getInspection_image_url() {
        return inspection_image_url;
    }

    public void setInspection_image_url(String inspection_image_url) {
        this.inspection_image_url = inspection_image_url;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(String maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public String getMaintenanceTime() {
        return maintenanceTime;
    }

    public void setMaintenanceTime(String maintenanceTime) {
        this.maintenanceTime = maintenanceTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}



