package com.orbit.Orbit.model;

public class Transformer {
    private String transformerNumber;
    private String poleNumber;
    private String region;
    private String type;

    public Transformer(){

    }

    public Transformer(String transformerNumber, String poleNumber, String region, String type) {
        this.transformerNumber = transformerNumber;
        this.poleNumber = poleNumber;
        this.region = region;
        this.type = type;
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
}
