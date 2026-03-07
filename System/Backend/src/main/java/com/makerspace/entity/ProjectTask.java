package com.makerspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "task_id")
    private UUID taskId;
    
    @Column(name = "description", nullable = false, length = 500)
    private String description;
    
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;
    
    @Column(name = "order_index")
    private Integer orderIndex;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Explicit getters to ensure compilation works
    public UUID getTaskId() {
        return taskId;
    }
    
    public String getDescription() {
        return description;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public Integer getOrderIndex() {
        return orderIndex;
    }
    
    public Booking getBooking() {
        return booking;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
    
    public void setBooking(Booking booking) {
        this.booking = booking;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
