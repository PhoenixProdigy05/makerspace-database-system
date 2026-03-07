package com.makerspace.controller;

import com.makerspace.dto.BookingResponse;
import com.makerspace.dto.CreateBookingRequest;
import com.makerspace.dto.UpdateBookingProgressRequest;
import com.makerspace.dto.UpdateBookingStatusRequest;
import com.makerspace.dto.UpdateBookingDetailsRequest;
import com.makerspace.entity.User;
import com.makerspace.repository.UserRepository;
import com.makerspace.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@Valid @RequestBody CreateBookingRequest request,
                                    Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            BookingResponse resp = bookingService.createBooking(current.getUserId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create booking"));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> myBookings(Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            List<BookingResponse> list = bookingService.getBookingsForUser(current.getUserId());
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch bookings"));
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancel(@PathVariable UUID id, Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            BookingResponse resp = bookingService.cancelBooking(current.getUserId(), id);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel booking"));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> listAll() {
        try {
            List<BookingResponse> list = bookingService.listAllBookings();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch bookings"));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id,
                                          @Valid @RequestBody UpdateBookingStatusRequest request) {
        try {
            BookingResponse resp = bookingService.updateStatus(id, request);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update status"));
        }
    }

    @PutMapping("/{id}/status/member")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> updateMemberBookingStatus(@PathVariable UUID id,
                                                   @Valid @RequestBody UpdateBookingStatusRequest request,
                                                   Authentication authentication) {
        try {
            User current = getCurrentUser(authentication);
            BookingResponse resp = bookingService.updateMemberBookingStatus(id, request, current.getUserId());
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update booking status"));
        }
    }

    @PutMapping("/{id}/progress")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> updateProgress(@PathVariable UUID id,
                                            @Valid @RequestBody UpdateBookingProgressRequest request) {
        try {
            BookingResponse resp = bookingService.updateProgress(id, request);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update progress"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> updateDetails(@PathVariable UUID id,
                                           @Valid @RequestBody UpdateBookingDetailsRequest request) {
        try {
            BookingResponse resp = bookingService.updateDetails(id, request);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to update booking"));
        }
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyAuthority('Admin','Staff')")
    public ResponseEntity<?> returnBooking(@PathVariable UUID id) {
        try {
            BookingResponse resp = bookingService.returnBooking(id);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to mark returned"));
        }
    }
}
