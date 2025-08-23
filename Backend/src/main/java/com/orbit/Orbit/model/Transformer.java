package com.orbit.Orbit.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
@Entity
@Table(name = "transformer")
public class Transformer {
    @Id
    private String transformerNumber;
    private String poleNumber;
    private String region;
    private String type;
    private String locationDetails;
    private String content_type;
    private String base_image_url;

    @OneToMany(mappedBy = "transformer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransformerInspection> inspections = new ArrayList<>();

    public Transformer(){

    }

    public Transformer(String transformerNumber, String poleNumber, String region, String type, String locationDetails) {
        this.transformerNumber = transformerNumber;
        this.poleNumber = poleNumber;
        this.region = region;
        this.type = type;
        this.locationDetails = locationDetails;
    }

    public void addInspection(TransformerInspection inspection) {
        inspections.add(inspection);
        inspection.setTransformer(this);
    }

    public void removeInspection(TransformerInspection inspection) {
        inspections.remove(inspection);
        inspection.setTransformer(null);
    }

    public String getTransformerNumber() {
        return transformerNumber;
    }

    public void setTransformerNumber(String transformerNumber) {
        this.transformerNumber = transformerNumber;
    }

    public String getPoleNumber() {
        return poleNumber;
    }

    public void setPoleNumber(String poleNumber) {
        this.poleNumber = poleNumber;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBase_image_url() {
        return base_image_url;
    }

    public void setBase_image_url(String base_image_url) {
        this.base_image_url = base_image_url;
    }

    public String getContent_type() {
        return content_type;
    }

    public void setContent_type(String content_type) {
        this.content_type = content_type;
    }

    public String getLocationDetails() {
        return locationDetails;
    }

    public void setLocationDetails(String locationDetails) {
        this.locationDetails = locationDetails;
    }
}
