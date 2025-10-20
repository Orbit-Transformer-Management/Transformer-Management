package com.orbit.Orbit.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "inspection_detects_timeline")
public class InspectionDetectsTimeline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long anotationId;

    @ManyToOne
    @JoinColumn(name = "detect_id", referencedColumnName = "detectID")
    private InspectionModelDetects detect;

    @ManyToOne
    @JoinColumn(name = "inspection_number", referencedColumnName = "inspectionNumber")
    private Inspection inspection;

    private String type;
    private String author; // optional: inspector name
    private String comment;
    private LocalDateTime createdAt;

    public InspectionDetectsTimeline() {}

    public InspectionDetectsTimeline(InspectionModelDetects detect, String author, String comment,String type) {
        this.detect = detect;
        this.inspection = detect.getInspection();
        this.author = author;
        this.comment = comment;
        this.type = type;
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getAnotationId() {
        return anotationId;
    }

    public void setAnotationId(Long anotationId) {
        this.anotationId = anotationId;
    }

    public InspectionModelDetects getDetect() {
        return detect;
    }

    public void setDetect(InspectionModelDetects detect) {
        this.detect = detect;
    }

    public Inspection getInspection() {
        return inspection;
    }

    public void setInspection(Inspection inspection) {
        this.inspection = inspection;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
