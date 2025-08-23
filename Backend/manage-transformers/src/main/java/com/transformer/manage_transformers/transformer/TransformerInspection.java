package com.transformer.manage_transformers.transformer;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name="transformer_inspection")
public class TransformerInspection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String inspectionNo;

    @ManyToOne
    @JoinColumn(name = "transformer_no", nullable = false)
    private Transformer transformer;

    private LocalDate inspectionDate;
    private LocalTime inspectionTime;
    private String branch;
    private LocalDate maintenanceDate;
    private LocalTime maintenanceTime;
    private String status;
    private String inspectionImagePath;

    public TransformerInspection() {
    }

    public TransformerInspection(String inspectionNo, Transformer transformer, LocalDate inspectionDate, LocalTime inspectionTime, String branch, LocalDate maintenanceDate, LocalTime maintenanceTime, String status, String inspectionImagePath) {
        this.inspectionNo = inspectionNo;
        this.transformer = transformer;
        this.inspectionDate = inspectionDate;
        this.inspectionTime = inspectionTime;
        this.branch = branch;
        this.maintenanceDate = maintenanceDate;
        this.maintenanceTime = maintenanceTime;
        this.status = status;
        this.inspectionImagePath = inspectionImagePath;
    }

    public String getInspectionNo() {
        return inspectionNo;
    }

    public void setInspectionNo(String inspectionNo) {
        this.inspectionNo = inspectionNo;
    }

    public Transformer getTransformer() {
        return transformer;
    }

    public void setTransformer(Transformer transformer) {
        this.transformer = transformer;
    }


    public LocalDate getInspectionDate() {
        return inspectionDate;
    }

    public void setInspectionDate(LocalDate inspectionDate) {
        this.inspectionDate = inspectionDate;
    }

    public LocalTime getInspectionTime() {
        return inspectionTime;
    }

    public void setInspectionTime(LocalTime inspectionTime) {
        this.inspectionTime = inspectionTime;
    }

    public String getBranch() { return branch; }

    public void setBranch(String branch) { this.branch = branch; }

    public LocalDate getMaintenanceDate() { return maintenanceDate; }

    public void setMaintenanceDate(LocalDate maintenanceDate) { this.maintenanceDate = maintenanceDate; }

    public LocalTime getMaintenanceTime() { return maintenanceTime; }

    public void setMaintenanceTime(LocalTime maintenanceTime) { this.maintenanceTime = maintenanceTime; }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInspectionImagePath() {
        return inspectionImagePath;
    }

    public void setInspectionImagePath(String inspectionImagePath) {
        this.inspectionImagePath = inspectionImagePath;
    }
}