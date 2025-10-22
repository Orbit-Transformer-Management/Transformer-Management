package com.orbit.Orbit.dto;

public class DetectionResponse {
    private Long detectId;
    private String inspectionNumber;
    private double width;
    private double height;
    private double x;
    private double y;
    private double confidence;
    private int classId;
    private String className;
    private String detectionId;
    private String parentId;

    public DetectionResponse() {
    }

    public DetectionResponse(Long detectId, String inspectionNumber, double width, double height, 
                           double x, double y, double confidence, int classId, String className, 
                           String detectionId, String parentId) {
        this.detectId = detectId;
        this.inspectionNumber = inspectionNumber;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.confidence = confidence;
        this.classId = classId;
        this.className = className;
        this.detectionId = detectionId;
        this.parentId = parentId;
    }

    // Getters and Setters
    public Long getDetectId() {
        return detectId;
    }

    public void setDetectId(Long detectId) {
        this.detectId = detectId;
    }

    public String getInspectionNumber() {
        return inspectionNumber;
    }

    public void setInspectionNumber(String inspectionNumber) {
        this.inspectionNumber = inspectionNumber;
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
}
