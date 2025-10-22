package com.orbit.Orbit.dto;

import java.time.LocalDateTime;

public class TimelineResponse {
    private Long anotationId;
    private Long detectId;
    private String inspectionNumber;
    private String type;
    private String author;
    private String comment;
    private LocalDateTime createdAt;

    public TimelineResponse() {
    }

    public TimelineResponse(Long anotationId, Long detectId, String inspectionNumber, 
                          String type, String author, String comment, LocalDateTime createdAt) {
        this.anotationId = anotationId;
        this.detectId = detectId;
        this.inspectionNumber = inspectionNumber;
        this.type = type;
        this.author = author;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getAnotationId() {
        return anotationId;
    }

    public void setAnotationId(Long anotationId) {
        this.anotationId = anotationId;
    }

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
