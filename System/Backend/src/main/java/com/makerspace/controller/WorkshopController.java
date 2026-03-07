package com.makerspace.controller;

import com.makerspace.dto.WorkshopDtos;
import com.makerspace.service.WorkshopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workshops")
@CrossOrigin(origins = "http://localhost:3000")
public class WorkshopController {

    @Autowired
    private WorkshopService workshopService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> list() {
        try {
            List<WorkshopDtos.WorkshopResponse> list = workshopService.list();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch workshops"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(workshopService.get(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch workshop"));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> create(@Valid @RequestBody WorkshopDtos.CreateWorkshopRequest req) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(workshopService.create(req));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to create workshop"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> update(@PathVariable UUID id, @Valid @RequestBody WorkshopDtos.UpdateWorkshopRequest req) {
        try {
            return ResponseEntity.ok(workshopService.update(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to update workshop"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            workshopService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete workshop"));
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> cancel(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(workshopService.cancel(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to cancel"));
        }
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> complete(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(workshopService.complete(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to complete"));
        }
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> registrations(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(workshopService.registrations(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch registrations"));
        }
    }

    @PostMapping("/{id}/registrations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addRegistration(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        try {
            System.out.println("Workshop registration request - Workshop ID: " + id + ", Body: " + body);
            String memberIdStr = body.get("memberId");
            System.out.println("Extracted memberId string: " + memberIdStr);
            
            if (memberIdStr == null || memberIdStr.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "memberId is required"));
            }
            
            UUID memberId = UUID.fromString(memberIdStr.trim());
            System.out.println("Parsed memberId UUID: " + memberId);
            
            workshopService.addRegistration(id, memberId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid UUID format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid memberId format: " + e.getMessage()));
        } catch (RuntimeException e) {
            System.out.println("Registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to add registration"));
        }
    }

    @DeleteMapping("/{id}/registrations/{memberId}")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> removeRegistration(@PathVariable UUID id, @PathVariable UUID memberId) {
        try {
            workshopService.removeRegistration(id, memberId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to remove registration"));
        }
    }

    @GetMapping(value = "/{id}/registrations/export", produces = "text/csv")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> exportCsv(@PathVariable UUID id) {
        try {
            String csv = workshopService.exportRegistrationsCsv(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=registrations-" + id + ".csv")
                    .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                    .body(csv);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to export CSV"));
        }
    }
}
