package com.makerspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id")
    private UUID itemId;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "sku", unique = true, length = 50)
    private String sku;
    
    @Column(name = "unit", length = 20)
    private String unit;
    
    @Column(name = "quantity", precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ZERO;
    
    @Column(name = "threshold", precision = 10, scale = 2)
    private BigDecimal threshold = BigDecimal.ZERO;
    
    @Column(name = "location", length = 100)
    private String location;
    
    @Column(name = "supplier", length = 100)
    private String supplier;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Explicit getters to ensure compilation works
    public UUID getItemId() {
        return itemId;
    }
    
    public String getName() {
        return name;
    }
    
    public String getSku() {
        return sku;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public BigDecimal getQuantity() {
        return quantity;
    }
    
    public BigDecimal getThreshold() {
        return threshold;
    }
    
    public String getLocation() {
        return location;
    }
    
    public String getSupplier() {
        return supplier;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setItemId(UUID itemId) {
        this.itemId = itemId;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setSku(String sku) {
        this.sku = sku;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }
    
    public void setThreshold(BigDecimal threshold) {
        this.threshold = threshold;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

