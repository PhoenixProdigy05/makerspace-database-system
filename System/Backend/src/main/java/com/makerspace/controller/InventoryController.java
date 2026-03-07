package com.makerspace.controller;

import com.makerspace.dto.CreateInventoryItemRequest;
import com.makerspace.dto.InventoryItemResponse;
import com.makerspace.dto.UpdateInventoryItemRequest;
import com.makerspace.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InventoryItemResponse>> getAllItems() {
        try {
            List<InventoryItemResponse> items = inventoryService.getAllItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<List<InventoryItemResponse>> getLowStockItems() {
        try {
            List<InventoryItemResponse> items = inventoryService.getLowStockItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InventoryItemResponse> getItemById(@PathVariable UUID id) {
        try {
            InventoryItemResponse item = inventoryService.getItemById(id);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<InventoryItemResponse> createItem(@Valid @RequestBody CreateInventoryItemRequest request) {
        try {
            InventoryItemResponse item = inventoryService.createItem(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<InventoryItemResponse> updateItem(@PathVariable UUID id, 
                                                             @Valid @RequestBody UpdateInventoryItemRequest request) {
        try {
            InventoryItemResponse item = inventoryService.updateItem(id, request);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<Void> deleteItem(@PathVariable UUID id) {
        try {
            inventoryService.deleteItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

