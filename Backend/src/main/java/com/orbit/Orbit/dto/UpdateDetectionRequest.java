// dto/UpdateDetectionRequest.java
package com.orbit.Orbit.dto;

import lombok.Data;

@Data
public class UpdateDetectionRequest {
    //private Long id;            // DB PK you’re updating (or omit if you update by path id)
    //private String detectionId; // if you update by business id
    private Double width, height, x, y, confidence;
    private Integer classId;
    private String className, parentId;

    // timeline
    private String author;
    private String comment;
}
