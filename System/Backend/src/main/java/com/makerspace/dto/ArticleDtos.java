package com.makerspace.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class ArticleDtos {
    @Data
    public static class CreateArticleRequest {
        private String title;
        private String author;
        private String imageUrl;
        private String content;
        private String tags; // comma-separated
    }

    @Data
    public static class UpdateArticleRequest {
        private String title;
        private String author;
        private String imageUrl;
        private String content;
        private String tags; // comma-separated
        private String status; // DRAFT | PUBLISHED (optional general update)
    }

    @Data
    @Builder
    public static class ArticleResponse {
        private UUID articleId;
        private String title;
        private String author;
        private String imageUrl;
        private String content;
        private String tags;
        private String status;
        private LocalDateTime publishedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
