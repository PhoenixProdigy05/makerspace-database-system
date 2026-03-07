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
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    public enum Status {
        PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED, OVERDUE
    }

    public enum AppointmentType {
        GENERAL_WORKSPACE,
        MACHINE_ROOM,
        ELECTRONICS_LAB,
        THREE_D_PRINTING,
        CNC_ROOM,
        TECHNICAL_ASSISTANCE,
        WOODWORKING_ROOM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "booking_id")
    private UUID bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "tools", nullable = false)
    private String tools;

    @Column(name = "materials", nullable = false)
    private String materials;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_type")
    private AppointmentType appointmentType;

    @Column(name = "appointment_time")
    private LocalDateTime appointmentTime;

    @Column(name = "notes")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_item_id")
    private InventoryItem equipment;

    @Column(name = "equipment_quantity", precision = 10, scale = 2)
    private java.math.BigDecimal equipmentQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    // 0..100
    @Column(name = "progress", nullable = false)
    private Integer progress;

    @Column(name = "project_description")
    private String projectDescription;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Explicit getters to ensure compilation works
    public UUID getBookingId() {
        return bookingId;
    }
    
    public User getUser() {
        return user;
    }
    
    public String getTools() {
        return tools;
    }
    
    public String getMaterials() {
        return materials;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public AppointmentType getAppointmentType() {
        return appointmentType;
    }
    
    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public InventoryItem getEquipment() {
        return equipment;
    }
    
    public java.math.BigDecimal getEquipmentQuantity() {
        return equipmentQuantity;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public Integer getProgress() {
        return progress;
    }
    
    public String getProjectDescription() {
        return projectDescription;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public void setTools(String tools) {
        this.tools = tools;
    }
    
    public void setMaterials(String materials) {
        this.materials = materials;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public void setAppointmentType(AppointmentType appointmentType) {
        this.appointmentType = appointmentType;
    }
    
    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public void setEquipment(InventoryItem equipment) {
        this.equipment = equipment;
    }
    
    public void setEquipmentQuantity(java.math.BigDecimal equipmentQuantity) {
        this.equipmentQuantity = equipmentQuantity;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public void setProgress(Integer progress) {
        this.progress = progress;
    }
    
    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

