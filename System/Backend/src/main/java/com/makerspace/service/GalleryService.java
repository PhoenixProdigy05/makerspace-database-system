package com.makerspace.service;

import com.makerspace.dto.GalleryDtos;
import com.makerspace.entity.Gallery;
import com.makerspace.repository.GalleryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GalleryService {

    @Autowired
    private GalleryRepository galleryRepository;

    private GalleryDtos.GalleryResponse toResponse(Gallery g) {
        return GalleryDtos.GalleryResponse.builder()
                .galleryId(g.getGalleryId())
                .title(g.getTitle())
                .description(g.getDescription())
                .imageUrl(g.getImageUrl())
                .order(g.getDisplayOrder())
                .createdAt(g.getCreatedAt())
                .updatedAt(g.getUpdatedAt())
                .build();
    }

    public List<GalleryDtos.GalleryResponse> list() {
        return galleryRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GalleryDtos.GalleryResponse get(UUID id) {
        Gallery g = galleryRepository.findById(id).orElseThrow(() -> new RuntimeException("Gallery item not found"));
        return toResponse(g);
    }

    public GalleryDtos.GalleryResponse create(GalleryDtos.CreateGalleryRequest req) {
        // Find the highest current order and increment
        Integer maxOrder = galleryRepository.findAll().stream()
                .mapToInt(Gallery::getDisplayOrder)
                .max()
                .orElse(0);
        
        Gallery g = Gallery.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .displayOrder(maxOrder + 1)
                .build();
        
        Gallery saved = galleryRepository.save(g);
        return toResponse(saved);
    }

    public GalleryDtos.GalleryResponse update(UUID id, GalleryDtos.UpdateGalleryRequest req) {
        Gallery g = galleryRepository.findById(id).orElseThrow(() -> new RuntimeException("Gallery item not found"));
        
        if (req.getTitle() != null) g.setTitle(req.getTitle());
        if (req.getDescription() != null) g.setDescription(req.getDescription());
        if (req.getImageUrl() != null) g.setImageUrl(req.getImageUrl());
        
        Gallery saved = galleryRepository.save(g);
        return toResponse(saved);
    }

    public void delete(UUID id) {
        if (!galleryRepository.existsById(id)) {
            throw new RuntimeException("Gallery item not found");
        }
        galleryRepository.deleteById(id);
    }

    public GalleryDtos.GalleryResponse updateOrder(UUID id, GalleryDtos.UpdateOrderRequest req) {
        Gallery g = galleryRepository.findById(id).orElseThrow(() -> new RuntimeException("Gallery item not found"));
        g.setDisplayOrder(req.getOrder());
        Gallery saved = galleryRepository.save(g);
        return toResponse(saved);
    }
}
