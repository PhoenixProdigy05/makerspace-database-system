package com.makerspace.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponse {
    private String bookingId;
    private String tools;
    private String materials;
    private int durationMinutes;
    private String appointmentTime;
    private String appointmentType;
    private String notes;
    private String status;
    private int progress;
    private String projectDescription;
    private String createdAt;
    
    // Member information fields
    private String userId;
    private String memberName;
    private String memberEmail;
    
    // Explicit builder method to ensure compilation works
    public static BookingResponseBuilder builder() {
        return new BookingResponseBuilder();
    }
}
