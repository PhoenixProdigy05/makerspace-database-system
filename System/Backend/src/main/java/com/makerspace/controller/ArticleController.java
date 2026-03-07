package com.makerspace.controller;

import com.makerspace.dto.ArticleDtos;
import com.makerspace.service.ArticleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "http://localhost:3000")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> list() {
        try {
            List<ArticleDtos.ArticleResponse> list = articleService.list();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch articles"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(articleService.get(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch article"));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> create(@Valid @RequestBody ArticleDtos.CreateArticleRequest req) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(articleService.create(req));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to create article"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> update(@PathVariable UUID id, @Valid @RequestBody ArticleDtos.UpdateArticleRequest req) {
        try {
            return ResponseEntity.ok(articleService.update(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to update article"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            articleService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete article"));
        }
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> publish(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(articleService.publish(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to publish"));
        }
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> unpublish(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(articleService.unpublish(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to unpublish"));
        }
    }
}
