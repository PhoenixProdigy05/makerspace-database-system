package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemResponse {
    private UUID itemId;
    private String name;
    private String sku;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal threshold;
    private String location;
    private String supplier;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isLowStock;
    
    // Explicit setters to ensure compilation works
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
    
    public void setIsLowStock(Boolean isLowStock) {
        this.isLowStock = isLowStock;
    }
}

 