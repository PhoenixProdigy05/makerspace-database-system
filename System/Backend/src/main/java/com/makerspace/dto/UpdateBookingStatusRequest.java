package com.makerspace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBookingStatusRequest {
    @NotNull
    private String status; // PENDING | APPROVED | REJECTED
    
    // Explicit getter to ensure compilation works
    public String getStatus() {
        return status;
    }
}
