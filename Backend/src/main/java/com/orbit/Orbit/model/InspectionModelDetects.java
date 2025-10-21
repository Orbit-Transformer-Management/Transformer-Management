package com.orbit.Orbit.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "inspection_model_detects")
public class InspectionModelDetects {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long detectId;
    @ManyToOne
    @JoinColumn(name = "inspection_number", referencedColumnName = "inspectionNumber")
    private Inspection inspection;
    private String detectName;
    private double width;
    private double height;
    private double x;
    private double y;
    private double confidence;
    private int classId;
    private String className; // avoid Java reserved word
    private String detectionId;
    private String parentId;


    public InspectionModelDetects() {

    }

    public InspectionModelDetects(Long detectId, Inspection inspection,String detectName, double width, double height, double x, double y, double confidence, int classId, String className, String detectionId, String parentId) {
        this.detectId = detectId;
        this.inspection = inspection;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.confidence = confidence;
        this.classId = classId;
        this.className = className;
        this.detectionId = detectionId;
        this.parentId = parentId;
        this.detectName = detectName;
    }

    public Long getDetectId() {
        return detectId;
    }

    public void setDetectId(Long detectId) {
        this.detectId = detectId;
    }

    public Inspection getInspection() {
        return inspection;
    }

    public void setInspection(Inspection inspection) {
        this.inspection = inspection;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getDetectionId() {
        return detectionId;
    }

    public void setDetectionId(String detectionId) {
        this.detectionId = detectionId;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getDetectName() {
        return detectName;
    }

    public void setDetectName(String detectName) {
        this.detectName = detectName;
    }
}





