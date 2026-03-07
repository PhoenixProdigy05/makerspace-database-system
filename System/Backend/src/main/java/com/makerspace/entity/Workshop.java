package com.makerspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workshops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workshop {

    public enum Status { SCHEDULED, CANCELLED, COMPLETED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "workshop_id")
    private UUID workshopId;

    @Column(nullable = false)
    private String title;

    private String instructor;

    private LocalDateTime date;

    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Explicit getters and builder method to ensure compilation works
    public UUID getWorkshopId() {
        return workshopId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public String getInstructor() {
        return instructor;
    }
    
    public LocalDateTime getDate() {
        return date;
    }
    
    public Integer getCapacity() {
        return capacity;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
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
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
