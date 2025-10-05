package com.orbit.Orbit.dto;

import com.orbit.Orbit.model.InspectionComment;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private String author;
    private String topic;
    private String comment;
    private LocalDateTime createdAt;

    public CommentResponse(InspectionComment comment) {
        this.id = comment.getId();
        this.author = comment.getAuthor();
        this.topic = comment.getTopic();
        this.comment = comment.getComment();
        this.createdAt = comment.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getAuthor() {
        return author;
    }

    public String getTopic() {
        return topic;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
