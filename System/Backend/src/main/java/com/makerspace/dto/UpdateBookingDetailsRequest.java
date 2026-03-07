package com.makerspace.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateBookingDetailsRequest {
    private String appointmentTime; // ISO date-time optional
    private String notes;
    private String appointmentType;
    private String projectDescription;
    private String equipmentId; // UUID string optional
    private BigDecimal equipmentQuantity; // optional
    
    // Explicit getters to ensure compilation works
    public String getAppointmentTime() {
        return appointmentTime;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public String getAppointmentType() {
        return appointmentType;
    }
    
    public String getProjectDescription() {
        return projectDescription;
    }
    
    public String getEquipmentId() {
        return equipmentId;
    }
    
    public BigDecimal getEquipmentQuantity() {
        return equipmentQuantity;
    }
}
