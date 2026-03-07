package com.makerspace.controller;

import com.makerspace.dto.ActiveMemberDto;
import com.makerspace.dto.CreateUserRequest;
import com.makerspace.dto.MemberActivityDto;
import com.makerspace.dto.MemberAttendanceRecordDto;
import com.makerspace.dto.MemberBookingHistoryDto;
import com.makerspace.dto.MemberProjectParticipationDto;
import com.makerspace.dto.UpdateUserRequest;
import com.makerspace.dto.UserResponse;
import com.makerspace.entity.User;
import com.makerspace.repository.UserRepository;
import com.makerspace.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        try {
            List<UserResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id, Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            // Users can view their own profile, Admin/Staff can view any
            if (currentUser.getRole() != User.Role.Admin && 
                currentUser.getRole() != User.Role.Staff && 
                !currentUser.getUserId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            UserResponse user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUserProfile(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            UserResponse user = userService.getUserById(currentUser.getUserId());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateCurrentUserProfile(@Valid @RequestBody UpdateUserRequest request,
                                                                 Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            UserResponse user = userService.updateUser(currentUser.getUserId(), request, currentUser);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request, 
                                                     Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            UserResponse user = userService.createUser(request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            System.err.println("RuntimeException in createUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            System.err.println("Exception in createUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id, 
                                                    @Valid @RequestBody UpdateUserRequest request,
                                                    Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            UserResponse user = userService.updateUser(id, request, currentUser);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id, Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            userService.deleteUser(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<UserResponse> suspendUser(@PathVariable UUID id, Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            UserResponse user = userService.suspendUser(id, currentUser);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}/unsuspend")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<UserResponse> unsuspendUser(@PathVariable UUID id, Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            UserResponse user = userService.unsuspendUser(id, currentUser);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/activity-trends")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<List<MemberActivityDto>> getActivityTrends(@RequestParam(defaultValue = "30") int days) {
        try {
            List<MemberActivityDto> trends = userService.getActivityTrends(days);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/most-active")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<List<ActiveMemberDto>> getMostActiveMembers(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<ActiveMemberDto> activeMembers = userService.getMostActiveMembers(limit);
            return ResponseEntity.ok(activeMembers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}/booking-history")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<List<MemberBookingHistoryDto>> getMemberBookingHistory(@PathVariable UUID id) {
        try {
            List<MemberBookingHistoryDto> bookingHistory = userService.getMemberBookingHistory(id);
            return ResponseEntity.ok(bookingHistory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}/project-participation")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<List<MemberProjectParticipationDto>> getMemberProjectParticipation(@PathVariable UUID id) {
        try {
            List<MemberProjectParticipationDto> projectParticipation = userService.getMemberProjectParticipation(id);
            return ResponseEntity.ok(projectParticipation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}/attendance-records")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<List<MemberAttendanceRecordDto>> getMemberAttendanceRecords(@PathVariable UUID id) {
        try {
            List<MemberAttendanceRecordDto> attendanceRecords = userService.getMemberAttendanceRecords(id);
            return ResponseEntity.ok(attendanceRecords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

