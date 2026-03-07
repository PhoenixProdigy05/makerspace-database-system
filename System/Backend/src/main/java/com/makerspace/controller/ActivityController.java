package com.makerspace.controller;

import com.makerspace.entity.Activity;
import com.makerspace.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> latest(@RequestParam(value = "limit", required = false) Integer limit) {
        try {
            List<Activity> items = activityService.latest(limit);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch activity"));
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> latestForUser(@PathVariable UUID userId,
                                           @RequestParam(value = "limit", required = false) Integer limit) {
        try {
            List<Activity> items = activityService.latestForUser(userId, limit);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch user activity"));
        }
    }
}
