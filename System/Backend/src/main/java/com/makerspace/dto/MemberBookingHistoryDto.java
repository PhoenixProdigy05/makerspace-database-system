package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberBookingHistoryDto {
    private String bookingId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String equipment;
    private String materials;
    private String status;
    private String projectDescription;
    private Integer durationMinutes;
    private String notes;
    
    // Explicit getters to ensure compilation works
    public String getBookingId() {
        return bookingId;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public String getEquipment() {
        return equipment;
    }
    
    public String getMaterials() {
        return materials;
    }
    
    public String getStatus() {
        return status;
    }
    
    public String getProjectDescription() {
        return projectDescription;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public String getNotes() {
        return notes;
    }
    
    // Explicit setters to ensure compilation works
    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }
    
    public void setMaterials(String materials) {
        this.materials = materials;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}