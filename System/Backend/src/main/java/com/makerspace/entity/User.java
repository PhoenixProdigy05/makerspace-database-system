package com.makerspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID userId;
    
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private Role role;
    
    @Convert(converter = StaffTypeConverter.class)
    @Column(name = "staff_type", length = 50)
    private StaffType staffType;
    
    @Builder.Default
    @Column(name = "notify_booking_updates", nullable = false)
    private boolean notifyBookingUpdates = true;

    @Builder.Default
    @Column(name = "notify_workshop_reminders", nullable = false)
    private boolean notifyWorkshopReminders = true;

    @Builder.Default
    @Column(name = "notify_approval_updates", nullable = false)
    private boolean notifyApprovalUpdates = true;

    @Builder.Default
    @Column(name = "notify_project_updates", nullable = false)
    private boolean notifyProjectUpdates = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;
    
    public enum Status {
        ACTIVE, SUSPENDED
    }
    
    public enum Role {
        Admin, Staff, Member
    }
    
    public enum StaffType {
        Technician, Manager, Intern, Admin
    }
    
    @Column(name = "assigned_area", length = 50)
    private String assignedArea;
    
    // Explicit getters and setters to ensure compilation works
    public UUID getUserId() {
        return userId;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public Role getRole() {
        return role;
    }
    
    public StaffType getStaffType() {
        return staffType;
    }
    
    public String getAssignedArea() {
        return assignedArea;
    }
    
    public boolean isNotifyBookingUpdates() {
        return notifyBookingUpdates;
    }
    
    public boolean isNotifyWorkshopReminders() {
        return notifyWorkshopReminders;
    }
    
    public boolean isNotifyApprovalUpdates() {
        return notifyApprovalUpdates;
    }
    
    public boolean isNotifyProjectUpdates() {
        return notifyProjectUpdates;
    }
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public void setStaffType(StaffType staffType) {
        this.staffType = staffType;
    }
    
    public void setAssignedArea(String assignedArea) {
        this.assignedArea = assignedArea;
    }
    
    public void setNotifyBookingUpdates(boolean notifyBookingUpdates) {
        this.notifyBookingUpdates = notifyBookingUpdates;
    }
    
    public void setNotifyWorkshopReminders(boolean notifyWorkshopReminders) {
        this.notifyWorkshopReminders = notifyWorkshopReminders;
    }
    
    public void setNotifyApprovalUpdates(boolean notifyApprovalUpdates) {
        this.notifyApprovalUpdates = notifyApprovalUpdates;
    }
    
    public void setNotifyProjectUpdates(boolean notifyProjectUpdates) {
        this.notifyProjectUpdates = notifyProjectUpdates;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

