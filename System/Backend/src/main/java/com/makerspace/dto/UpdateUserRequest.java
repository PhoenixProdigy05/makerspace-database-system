package com.makerspace.dto;

import com.makerspace.entity.User;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String fullName;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String phoneNumber;
    
    private User.Role role;
    
    private User.StaffType staffType;
    
    private String assignedArea;
    
    private String password;

    private Boolean notifyBookingUpdates;

    private Boolean notifyWorkshopReminders;

    private Boolean notifyApprovalUpdates;

    private Boolean notifyProjectUpdates;
    
    // Explicit getters to ensure compilation works
    public String getFullName() {
        return fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public User.Role getRole() {
        return role;
    }
    
    public User.StaffType getStaffType() {
        return staffType;
    }
    
    public String getAssignedArea() {
        return assignedArea;
    }
    
    public String getPassword() {
        return password;
    }
    
    public Boolean getNotifyBookingUpdates() {
        return notifyBookingUpdates;
    }
    
    public Boolean getNotifyWorkshopReminders() {
        return notifyWorkshopReminders;
    }
    
    public Boolean getNotifyApprovalUpdates() {
        return notifyApprovalUpdates;
    }
    
    public Boolean getNotifyProjectUpdates() {
        return notifyProjectUpdates;
    }
}
