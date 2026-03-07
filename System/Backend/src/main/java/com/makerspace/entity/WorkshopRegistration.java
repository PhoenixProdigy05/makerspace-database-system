package com.makerspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workshop_registrations", uniqueConstraints = @UniqueConstraint(columnNames = {"workshop_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkshopRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "registration_id")
    private UUID registrationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;
    
    // Explicit getters and setters to ensure compilation works
    public UUID getRegistrationId() {
        return registrationId;
    }
    
    public Workshop getWorkshop() {
        return workshop;
    }
    
    public void setWorkshop(Workshop workshop) {
        this.workshop = workshop;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }
}
