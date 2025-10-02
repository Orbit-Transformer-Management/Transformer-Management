package com.example.inspection.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class RoboflowResponse {
    private OutputImage output_image;
    private Predictions predictions;

    @Data
    public static class OutputImage {
        private String type;
        private String value; // base64 string
        private VideoMetadata video_metadata;
    }

    @Data
    public static class VideoMetadata {
        private String video_identifier;
        private int frame_number;
        private String frame_timestamp;
        private int fps;
        private Double measured_fps;
        private Boolean comes_from_video_file;
    }

    @Data
    public static class Predictions {
        private ImageMeta image;
        private List<Detection> predictions;
    }

    @Data
    public static class ImageMeta {
        private int width;
        private int height;
    }

    @Data
    public static class Detection {
        private int width;
        private int height;
        private double x;
        private double y;
        private double confidence;
        private int class_id;

        @JsonProperty("class")
        private String className;

        private String detection_id;
        private String parent_id;
    }
}
