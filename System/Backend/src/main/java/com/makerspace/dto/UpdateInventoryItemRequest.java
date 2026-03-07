package com.makerspace.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateInventoryItemRequest {
    private String name;
    private String sku;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal threshold;
    private String location;
    private String supplier;
    private Boolean isActive;
    
    // Explicit getters to ensure compilation works
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
}

