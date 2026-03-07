package com.makerspace.service;

import com.makerspace.dto.CreateInventoryItemRequest;
import com.makerspace.dto.InventoryItemResponse;
import com.makerspace.dto.UpdateInventoryItemRequest;
import com.makerspace.entity.InventoryItem;
import com.makerspace.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InventoryService {
    
    @Autowired
    private InventoryItemRepository inventoryItemRepository;
    
    public List<InventoryItemResponse> getAllItems() {
        return inventoryItemRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<InventoryItemResponse> getLowStockItems() {
        return inventoryItemRepository.findAll().stream()
                .filter(item -> item.getIsActive() && 
                        item.getQuantity().compareTo(item.getThreshold()) <= 0)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public InventoryItemResponse getItemById(UUID itemId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        return convertToResponse(item);
    }
    
    @Transactional
    public InventoryItemResponse createItem(CreateInventoryItemRequest request) {
        // Check if SKU already exists
        if (request.getSku() != null && !request.getSku().isEmpty()) {
            inventoryItemRepository.findAll().stream()
                    .filter(item -> request.getSku().equals(item.getSku()))
                    .findFirst()
                    .ifPresent(item -> {
                        throw new RuntimeException("SKU already exists");
                    });
        }
        
        InventoryItem item = new InventoryItem();
        item.setName(request.getName());
        item.setSku(request.getSku());
        item.setUnit(request.getUnit());
        item.setQuantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ZERO);
        item.setThreshold(request.getThreshold() != null ? request.getThreshold() : BigDecimal.ZERO);
        item.setLocation(request.getLocation());
        item.setSupplier(request.getSupplier());
        item.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        InventoryItem savedItem = inventoryItemRepository.save(item);
        return convertToResponse(savedItem);
    }
    
    @Transactional
    public InventoryItemResponse updateItem(UUID itemId, UpdateInventoryItemRequest request) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        if (request.getName() != null) {
            item.setName(request.getName());
        }
        if (request.getSku() != null && !request.getSku().equals(item.getSku())) {
            // Check if new SKU already exists
            inventoryItemRepository.findAll().stream()
                    .filter(i -> request.getSku().equals(i.getSku()) && !i.getItemId().equals(itemId))
                    .findFirst()
                    .ifPresent(i -> {
                        throw new RuntimeException("SKU already exists");
                    });
            item.setSku(request.getSku());
        }
        if (request.getUnit() != null) {
            item.setUnit(request.getUnit());
        }
        if (request.getQuantity() != null) {
            item.setQuantity(request.getQuantity());
        }
        if (request.getThreshold() != null) {
            item.setThreshold(request.getThreshold());
        }
        if (request.getLocation() != null) {
            item.setLocation(request.getLocation());
        }
        if (request.getSupplier() != null) {
            item.setSupplier(request.getSupplier());
        }
        if (request.getIsActive() != null) {
            item.setIsActive(request.getIsActive());
        }
        
        InventoryItem updatedItem = inventoryItemRepository.save(item);
        return convertToResponse(updatedItem);
    }
    
    @Transactional
    public void deleteItem(UUID itemId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        inventoryItemRepository.delete(item);
    }
    
    private InventoryItemResponse convertToResponse(InventoryItem item) {
        boolean isLowStock = item.getIsActive() && 
                item.getQuantity().compareTo(item.getThreshold()) <= 0;
        
        InventoryItemResponse response = new InventoryItemResponse();
        response.setItemId(item.getItemId());
        response.setName(item.getName());
        response.setSku(item.getSku());
        response.setUnit(item.getUnit());
        response.setQuantity(item.getQuantity());
        response.setThreshold(item.getThreshold());
        response.setLocation(item.getLocation());
        response.setSupplier(item.getSupplier());
        response.setIsActive(item.getIsActive());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        response.setIsLowStock(isLowStock);
        return response;
    }
}

