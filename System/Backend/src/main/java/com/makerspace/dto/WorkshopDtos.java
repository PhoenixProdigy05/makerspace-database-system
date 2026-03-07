package com.makerspace.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class WorkshopDtos {
    @Data
    public static class CreateWorkshopRequest {
        private String title;
        private String instructor;
        private String date; // ISO date-time
        private Integer capacity;
        
        // Explicit getters to ensure compilation works
        public String getTitle() {
            return title;
        }
        
        public String getInstructor() {
            return instructor;
        }
        
        public String getDate() {
            return date;
        }
        
        public Integer getCapacity() {
            return capacity;
        }
    }

    @Data
    public static class UpdateWorkshopRequest {
        private String title;
        private String instructor;
        private String date; // ISO date-time
        private Integer capacity;
        private String status; // SCHEDULED | CANCELLED | COMPLETED
        
        // Explicit getters to ensure compilation works
        public String getTitle() {
            return title;
        }
        
        public String getInstructor() {
            return instructor;
        }
        
        public String getDate() {
            return date;
        }
        
        public Integer getCapacity() {
            return capacity;
        }
        
        public String getStatus() {
            return status;
        }
    }

    @Data
    public static class WorkshopResponse {
        private UUID workshopId;
        private String title;
        private String instructor;
        private LocalDateTime date;
        private Integer capacity;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // Explicit setters to ensure compilation works
        public void setWorkshopId(UUID workshopId) {
            this.workshopId = workshopId;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public void setInstructor(String instructor) {
            this.instructor = instructor;
        }
        
        public void setDate(LocalDateTime date) {
            this.date = date;
        }
        
        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
        
        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }
    }

    @Data
    public static class RegistrationResponse {
        private UUID workshopId;
        private UUID memberId;
        private LocalDateTime registeredAt;
        
        // Explicit getters to ensure compilation works
        public UUID getWorkshopId() {
            return workshopId;
        }
        
        public UUID getMemberId() {
            return memberId;
        }
        
        public LocalDateTime getRegisteredAt() {
            return registeredAt;
        }
        
        // Explicit setters to ensure compilation works
        public void setWorkshopId(UUID workshopId) {
            this.workshopId = workshopId;
        }
        
        public void setMemberId(UUID memberId) {
            this.memberId = memberId;
        }
        
        public void setRegisteredAt(LocalDateTime registeredAt) {
            this.registeredAt = registeredAt;
        }
    }
}
