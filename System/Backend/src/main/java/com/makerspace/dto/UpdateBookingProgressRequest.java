package com.makerspace.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateBookingProgressRequest {
    @Min(0)
    @Max(100)
    private int progress;

    private String projectDescription;
    
    // Explicit getters to ensure compilation works
    public int getProgress() {
        return progress;
    }
    
    public String getProjectDescription() {
        return projectDescription;
    }
}
