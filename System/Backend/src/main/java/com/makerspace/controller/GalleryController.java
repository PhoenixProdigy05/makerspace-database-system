package com.makerspace.controller;

import com.makerspace.dto.GalleryDtos;
import com.makerspace.service.GalleryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/gallery")
@CrossOrigin(origins = "http://localhost:3000")
public class GalleryController {

    @Autowired
    private GalleryService galleryService;

    @GetMapping("/test")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Gallery controller is working");
    }

    @GetMapping("/public")
    public ResponseEntity<?> listPublic() {
        try {
            List<GalleryDtos.GalleryResponse> list = galleryService.list();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch gallery items"));
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> list() {
        try {
            List<GalleryDtos.GalleryResponse> list = galleryService.list();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch gallery items"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(galleryService.get(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch gallery item"));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> create(@RequestParam("title") String title,
                                 @RequestParam(value = "description", required = false) String description,
                                 @RequestParam(value = "imageUrl", required = false) String imageUrl,
                                 @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            GalleryDtos.CreateGalleryRequest req = new GalleryDtos.CreateGalleryRequest();
            req.setTitle(title);
            req.setDescription(description);
            
            // Handle file upload
            if (file != null && !file.isEmpty()) {
                // Create uploads directory if it doesn't exist
                String uploadDir = "uploads/gallery/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                // Generate unique filename
                String fileName = "gallery_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                String filePath = uploadDir + fileName;
                
                // Save file to filesystem
                Path targetPath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), targetPath);
                
                // Set the imageUrl to the relative path
                req.setImageUrl("/uploads/gallery/" + fileName);
            } else {
                req.setImageUrl(imageUrl);
            }
            
            return ResponseEntity.ok(galleryService.create(req));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create gallery item: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> update(@PathVariable UUID id, @Valid @RequestBody GalleryDtos.UpdateGalleryRequest req) {
        try {
            return ResponseEntity.ok(galleryService.update(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update gallery item"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            galleryService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete gallery item"));
        }
    }

    @PutMapping("/{id}/order")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> updateOrder(@PathVariable UUID id, @RequestBody GalleryDtos.UpdateOrderRequest req) {
        try {
            return ResponseEntity.ok(galleryService.updateOrder(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update gallery item order"));
        }
    }
}
