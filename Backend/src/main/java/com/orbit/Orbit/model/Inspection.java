package com.orbit.Orbit.model;

import java.time.LocalDate;
import java.time.LocalTime;

public class Inspection {
    private String inspectionNumber;
    private String transformerNumber;
    private LocalDate inspectionDate;
    private LocalTime inspectionTime;
    private String inspection_image_url;

    public Inspection(String number, String id, String s, LocalDate localDate, LocalTime localTime){

    }

    public Inspection(String inspectionNumber, String transformerNumber, LocalDate inspectionDate, LocalTime inspectionTime) {
        this.inspectionNumber = inspectionNumber;
        this.transformerNumber = transformerNumber;
        this.inspectionDate = inspectionDate;
        this.inspectionTime = inspectionTime;
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

    public String getInspection_image_url() {
        return inspection_image_url;
    }

    public void setInspection_image_url(String inspection_image_url) {
        this.inspection_image_url = inspection_image_url;
    }
}



