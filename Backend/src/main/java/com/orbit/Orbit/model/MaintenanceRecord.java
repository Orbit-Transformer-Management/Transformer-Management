package com.orbit.Orbit.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class MaintenanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inspectorName;

    private String transformerStatus;

    // Electrical Readings
    private Double voltage;
    private Double current;

    // Outcomes
    private String recommendedAction;
    private String additionalRemarks;
    private String otherNotes;

    @ManyToOne
    @JoinColumn(name = "transformer_id")
    private Transformer transformer;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "record_inspections", // Name of the join table in the DB
            joinColumns = @JoinColumn(name = "maintenance_record_id"), // FK to this class
            inverseJoinColumns = @JoinColumn(name = "inspection_id")   // FK to the Inspection class
    )
    private List<Inspection> inspections;



    public MaintenanceRecord() {
    }

    public MaintenanceRecord(Long id, String inspectorName, String transformerStatus, Double voltage, Double current, String recommendedAction, String additionalRemarks, String otherNotes, Transformer transformer, List<Inspection> inspections) {
        this.id = id;
        this.inspectorName = inspectorName;
        this.transformerStatus = transformerStatus;
        this.voltage = voltage;
        this.current = current;
        this.recommendedAction = recommendedAction;
        this.additionalRemarks = additionalRemarks;
        this.otherNotes = otherNotes;
        this.transformer = transformer;
        this.inspections = inspections;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInspectorName() {
        return inspectorName;
    }

    public void setInspectorName(String inspectorName) {
        this.inspectorName = inspectorName;
    }

    public String getTransformerStatus() {
        return transformerStatus;
    }

    public void setTransformerStatus(String transformerStatus) {
        this.transformerStatus = transformerStatus;
    }

    public Double getVoltage() {
        return voltage;
    }

    public void setVoltage(Double voltage) {
        this.voltage = voltage;
    }

    public Double getCurrent() {
        return current;
    }

    public void setCurrent(Double current) {
        this.current = current;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getAdditionalRemarks() {
        return additionalRemarks;
    }

    public void setAdditionalRemarks(String additionalRemarks) {
        this.additionalRemarks = additionalRemarks;
    }

    public String getOtherNotes() {
        return otherNotes;
    }

    public void setOtherNotes(String otherNotes) {
        this.otherNotes = otherNotes;
    }

    public Transformer getTransformer() {
        return transformer;
    }

    public void setTransformer(Transformer transformer) {
        this.transformer = transformer;
    }

    public List<Inspection> getInspections() {
        return inspections;
    }

    public void setInspections(List<Inspection> inspections) {
        this.inspections = inspections;
    }
}