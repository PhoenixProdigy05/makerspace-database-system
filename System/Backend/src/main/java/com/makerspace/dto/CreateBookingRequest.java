package com.makerspace.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateBookingRequest {
    @NotBlank
    private String tools;

    @NotBlank
    private String materials;

    @Min(15)
    private int durationMinutes;

    // ISO date-time string (optional)
    private String appointmentTime;

    private String notes;

    private String appointmentType;

    private String projectDescription;

    // Optional equipment relation for inventory tracking
    private String equipmentId; // UUID string
    private BigDecimal equipmentQuantity; // amount to be returned
    
    // Explicit getters to ensure compilation works
    public String getTools() {
        return tools;
    }
    
    public String getMaterials() {
        return materials;
    }
    
    public int getDurationMinutes() {
        return durationMinutes;
    }
    
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
