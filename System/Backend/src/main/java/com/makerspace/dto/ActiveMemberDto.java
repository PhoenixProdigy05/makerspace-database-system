package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveMemberDto {
    private String userId;
    private String fullName;
    private String email;
    private int bookingCount;
    private int workshopCount;
    private LocalDateTime lastActivity;
    private double activityScore;
    
    // Explicit getters to ensure compilation works
    public String getUserId() {
        return userId;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public int getBookingCount() {
        return bookingCount;
    }
    
    public int getWorkshopCount() {
        return workshopCount;
    }
    
    public LocalDateTime getLastActivity() {
        return lastActivity;
    }
    
    public double getActivityScore() {
        return activityScore;
    }
    
    // Explicit setters to ensure compilation works
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setBookingCount(int bookingCount) {
        this.bookingCount = bookingCount;
    }
    
    public void setWorkshopCount(int workshopCount) {
        this.workshopCount = workshopCount;
    }
    
    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }
    
    public void setActivityScore(double activityScore) {
        this.activityScore = activityScore;
    }
}
