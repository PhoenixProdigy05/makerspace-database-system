package com.makerspace.service;

import com.makerspace.dto.CreateInventoryItemRequest;
import com.makerspace.entity.InventoryItem;
import com.makerspace.repository.InventoryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private CreateInventoryItemRequest createRequest;

    @BeforeEach
    void setUp() {
        createRequest = new CreateInventoryItemRequest();
        createRequest.setName("Test Item");
        createRequest.setSku("SKU-001");
        createRequest.setQuantity(BigDecimal.valueOf(100));
        createRequest.setThreshold(BigDecimal.valueOf(10));
    }

    @Test
    void testCreateItem() {
        // Given
        InventoryItem savedItem = new InventoryItem();
        savedItem.setItemId(java.util.UUID.randomUUID());
        savedItem.setName(createRequest.getName());
        savedItem.setSku(createRequest.getSku());
        savedItem.setQuantity(createRequest.getQuantity());
        savedItem.setThreshold(createRequest.getThreshold());

        when(inventoryItemRepository.findAll()).thenReturn(java.util.Collections.emptyList());
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(savedItem);

        // When
        var response = inventoryService.createItem(createRequest);

        // Then
        assertNotNull(response);
        assertEquals(createRequest.getName(), response.getName());
        verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
    }

    @Test
    void testCreateItemWithDuplicateSku() {
        // Given
        InventoryItem existingItem = new InventoryItem();
        existingItem.setSku("SKU-001");

        when(inventoryItemRepository.findAll()).thenReturn(java.util.Collections.singletonList(existingItem));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            inventoryService.createItem(createRequest);
        });
    }
}

