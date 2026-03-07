package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberAttendanceRecordDto {
    private String recordId;
    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String eventType; // VISIT, WORKSHOP, EVENT
    private String eventName;
    private int durationMinutes;
    private String notes;
    private boolean present;
    
    // Explicit getters to ensure compilation works
    public String getRecordId() {
        return recordId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }
    
    public LocalDateTime getCheckOutTime() {
        return checkOutTime;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public String getEventName() {
        return eventName;
    }
    
    public int getDurationMinutes() {
        return durationMinutes;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public boolean isPresent() {
        return present;
    }
    
    // Explicit setters to ensure compilation works
    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }
    
    public void setCheckOutTime(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }
    
    public void setEventType(String eventType) {
        this.eventType = eventType;
    }
    
    public void setEventName(String eventName) {
        this.eventName = eventName;
    }
    
    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public void setPresent(boolean present) {
        this.present = present;
    }
}
