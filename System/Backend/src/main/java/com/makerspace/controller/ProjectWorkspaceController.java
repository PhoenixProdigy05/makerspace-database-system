package com.makerspace.controller;

import com.makerspace.dto.ProjectWorkspaceResponse;
import com.makerspace.dto.ProjectTaskResponse;
import com.makerspace.entity.User;
import com.makerspace.repository.UserRepository;
import com.makerspace.service.ProjectWorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectWorkspaceController {

    @Autowired
    private ProjectWorkspaceService projectWorkspaceService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProjectWorkspace(@PathVariable UUID bookingId, Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            ProjectWorkspaceResponse response = projectWorkspaceService.getProjectWorkspace(bookingId, current.getUserId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch project workspace"));
        }
    }

    @PostMapping("/{bookingId}/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTask(
            @PathVariable UUID bookingId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            ProjectTaskResponse response = projectWorkspaceService.createTask(
                    bookingId, current.getUserId(), request.getDescription(), request.getOrderIndex());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create task"));
        }
    }

    @PutMapping("/tasks/{taskId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            ProjectTaskResponse response = projectWorkspaceService.updateTaskStatus(
                    taskId, current.getUserId(), request.getIsCompleted());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update task status"));
        }
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteTask(@PathVariable UUID taskId, Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            projectWorkspaceService.deleteTask(taskId, current.getUserId());
            return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete task"));
        }
    }

    // DTOs for request bodies
    public static class CreateTaskRequest {
        private String description;
        private Integer orderIndex;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getOrderIndex() { return orderIndex; }
        public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    }

    public static class UpdateTaskStatusRequest {
        private Boolean isCompleted;

        public Boolean getIsCompleted() { return isCompleted; }
        public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }
    }
}
