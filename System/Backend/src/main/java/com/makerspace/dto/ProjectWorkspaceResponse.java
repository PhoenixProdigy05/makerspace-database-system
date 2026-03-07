package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectWorkspaceResponse {
    
    private String bookingId;
    private String tools;
    private String materials;
    private Integer durationMinutes;
    private String appointmentTime;
    private String appointmentType;
    private String notes;
    private String status;
    private Integer progress;
    private String projectDescription;
    private String createdAt;
    private String userId;
    private String memberName;
    private String memberEmail;
    
    // Related entities
    private List<ProjectTaskResponse> tasks;
    private List<AttachmentResponse> attachments;
    private InventoryItemResponse machine;
    
    // Computed fields
    private Integer completedTasksCount;
    private Integer totalTasksCount;
}
