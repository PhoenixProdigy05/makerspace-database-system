package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {
    private UUID attachmentId;
    private String ownerTable;
    private UUID ownerId;
    private String filename;
    private String fileUrl;
    private UUID uploadedBy;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}

