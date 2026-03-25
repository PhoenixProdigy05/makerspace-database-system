package com.makerspace.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class GalleryDtos {
    @Data
    public static class CreateGalleryRequest {
        private String title;
        private String description;
        private String imageData; // Base64 encoded image data
    }

    @Data
    public static class UpdateGalleryRequest {
        private String title;
        private String description;
        private String imageData; // Base64 encoded image data
    }

    @Data
    @Builder
    public static class GalleryResponse {
        private UUID galleryId;
        private String title;
        private String description;
        private String imageData; // Base64 encoded image data
        private Integer order;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class UpdateOrderRequest {
        private Integer order;
    }
}
