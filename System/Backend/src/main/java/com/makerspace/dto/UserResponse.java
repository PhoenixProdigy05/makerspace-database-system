package com.makerspace.dto;

import com.makerspace.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private User.Role role;
    private User.StaffType staffType;
    private String assignedArea;
    private User.Status status;
    private Boolean notifyBookingUpdates;
    private Boolean notifyWorkshopReminders;
    private Boolean notifyApprovalUpdates;
    private Boolean notifyProjectUpdates;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Explicit setters to ensure compilation works
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public void setRole(User.Role role) {
        this.role = role;
    }
    
    public void setStaffType(User.StaffType staffType) {
        this.staffType = staffType;
    }
    
    public void setAssignedArea(String assignedArea) {
        this.assignedArea = assignedArea;
    }
    
    public void setStatus(User.Status status) {
        this.status = status;
    }
    
    public void setNotifyBookingUpdates(Boolean notifyBookingUpdates) {
        this.notifyBookingUpdates = notifyBookingUpdates;
    }
    
    public void setNotifyWorkshopReminders(Boolean notifyWorkshopReminders) {
        this.notifyWorkshopReminders = notifyWorkshopReminders;
    }
    
    public void setNotifyApprovalUpdates(Boolean notifyApprovalUpdates) {
        this.notifyApprovalUpdates = notifyApprovalUpdates;
    }
    
    public void setNotifyProjectUpdates(Boolean notifyProjectUpdates) {
        this.notifyProjectUpdates = notifyProjectUpdates;
    }
    
    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
