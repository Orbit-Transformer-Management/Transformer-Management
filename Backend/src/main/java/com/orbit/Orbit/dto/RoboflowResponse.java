package com.orbit.Orbit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class RoboflowResponse {
    //private OutputImage output_image;
    private List<Output> outputs;

    @Data
    public static class Output {
        @JsonProperty("count_objects")
        private int countObjects;

        // we ignore output_image here

        private Predictions predictions;
    }

    @Data
    public static class Predictions {
        private List<Detection> predictions;
    }

    @Data
    public static class Detection {
        private double width;
        private double height;
        private double x;
        private double y;
        private double confidence;

        @JsonProperty("class_id")
        private int classId;

        @JsonProperty("class")
        private String className; // avoid Java reserved word

        @JsonProperty("detection_id")
        private String detectionId;

        @JsonProperty("parent_id")
        private String parentId;
    }
}
