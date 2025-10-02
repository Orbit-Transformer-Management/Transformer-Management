package com.orbit.Orbit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoboflowRequest {
    private String api_key;
    private Inputs inputs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Inputs {
        private Image image;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Image {
        private String type;   // "url" or "base64"
        private String value;  // image URL or base64 string
    }
}
