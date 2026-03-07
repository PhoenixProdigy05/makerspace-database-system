package com.makerspace.service;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToResponse(user);
    }
    
    @Transactional
    public UserResponse createUser(CreateUserRequest request, User currentUser) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        // Only Admin can create Admin or Staff users. Staff can only create Members
        if ((request.getRole() == User.Role.Admin || request.getRole() == User.Role.Staff)
                && currentUser.getRole() != User.Role.Admin) {
            throw new RuntimeException("Only Admin can create Admin or Staff users");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        user.setStaffType(request.getRole() == User.Role.Staff ? request.getStaffType() : null);
        user.setAssignedArea(request.getAssignedArea());
        user.setCreatedBy(currentUser);
        
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }
    
    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserRequest request, User currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only Admin can update other users' roles, or users can update their own info
        if (currentUser.getRole() != User.Role.Admin && !user.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("You don't have permission to update this user");
        }
        
        // Only Admin can change roles
        if (request.getRole() != null && currentUser.getRole() != User.Role.Admin) {
            throw new RuntimeException("Only Admin can change user roles");
        }
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getRole() != null && currentUser.getRole() == User.Role.Admin) {
            user.setRole(request.getRole());
        }
        if (request.getStaffType() != null) {
            user.setStaffType(request.getStaffType());
        }
        if (request.getAssignedArea() != null) {
            user.setAssignedArea(request.getAssignedArea());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getNotifyBookingUpdates() != null) {
            user.setNotifyBookingUpdates(request.getNotifyBookingUpdates());
        }
        if (request.getNotifyWorkshopReminders() != null) {
            user.setNotifyWorkshopReminders(request.getNotifyWorkshopReminders());
        }
        if (request.getNotifyApprovalUpdates() != null) {
            user.setNotifyApprovalUpdates(request.getNotifyApprovalUpdates());
        }
        if (request.getNotifyProjectUpdates() != null) {
            user.setNotifyProjectUpdates(request.getNotifyProjectUpdates());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    @Transactional
    public void deleteUser(UUID userId, User currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only Admin can delete users
        if (currentUser.getRole() != User.Role.Admin) {
            throw new RuntimeException("Only Admin can delete users");
        }
        
        // Don't allow deleting yourself
        if (user.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("You cannot delete your own account");
        }
        
        // For now, we'll just delete. In production, you might want to soft delete
        userRepository.delete(user);
    }
    
    @Transactional
    public UserResponse suspendUser(UUID userId, User currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only Admin can suspend users
        if (currentUser.getRole() != User.Role.Admin) {
            throw new RuntimeException("Only Admin can suspend users");
        }
        
        // Don't allow suspending yourself
        if (user.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("You cannot suspend your own account");
        }
        
        // Don't allow suspending other admins
        if (user.getRole() == User.Role.Admin) {
            throw new RuntimeException("You cannot suspend another admin");
        }
        
        // Only members can be suspended
        if (user.getRole() != User.Role.Member) {
            throw new RuntimeException("Only members can be suspended");
        }
        
        user.setStatus(User.Status.SUSPENDED);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    @Transactional
    public UserResponse unsuspendUser(UUID userId, User currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only Admin can unsuspend users
        if (currentUser.getRole() != User.Role.Admin) {
            throw new RuntimeException("Only Admin can unsuspend users");
        }
        
        // User must be suspended to unsuspend
        if (user.getStatus() != User.Status.SUSPENDED) {
            throw new RuntimeException("User is not suspended");
        }
        
        user.setStatus(User.Status.ACTIVE);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setStaffType(user.getStaffType());
        response.setAssignedArea(user.getAssignedArea());
        response.setStatus(user.getStatus());
        response.setNotifyBookingUpdates(user.isNotifyBookingUpdates());
        response.setNotifyWorkshopReminders(user.isNotifyWorkshopReminders());
        response.setNotifyApprovalUpdates(user.isNotifyApprovalUpdates());
        response.setNotifyProjectUpdates(user.isNotifyProjectUpdates());
        response.setCreatedBy(user.getCreatedBy() != null ? user.getCreatedBy().getUserId() : null);
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
    
    public List<MemberActivityDto> getActivityTrends(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        return startDate.datesUntil(endDate.plusDays(1))
                .map(date -> {
                    int activeMembers = userRepository.countActiveUsersByDate(date);
                    int newMembers = userRepository.countNewUsersByDate(date);
                    int suspendedMembers = userRepository.countSuspendedUsersByDate(date);
                    int totalBookings = 5; // Mock data - would need BookingRepository
                    
                    MemberActivityDto activity = new MemberActivityDto();
                    activity.setDate(date);
                    activity.setActiveMembers(activeMembers);
                    activity.setNewMembers(newMembers);
                    activity.setSuspendedMembers(suspendedMembers);
                    activity.setTotalBookings(totalBookings);
                    return activity;
                })
                .collect(Collectors.toList());
    }
    
    public List<ActiveMemberDto> getMostActiveMembers(int limit) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.Member && user.getStatus() == User.Status.ACTIVE)
                .map(user -> {
                    // Mock activity data - would need to calculate from actual bookings/workshops
                    int bookingCount = (int) (Math.random() * 20);
                    int workshopCount = (int) (Math.random() * 5);
                    LocalDateTime lastActivity = LocalDateTime.now().minusHours((long) (Math.random() * 72));
                    double activityScore = bookingCount * 2.0 + workshopCount * 3.0;
                    
                    ActiveMemberDto member = new ActiveMemberDto();
                    member.setUserId(user.getUserId().toString());
                    member.setFullName(user.getFullName());
                    member.setEmail(user.getEmail());
                    member.setBookingCount(bookingCount);
                    member.setWorkshopCount(workshopCount);
                    member.setLastActivity(lastActivity);
                    member.setActivityScore(activityScore);
                    return member;
                })
                .sorted((a, b) -> Double.compare(b.getActivityScore(), a.getActivityScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    public List<MemberBookingHistoryDto> getMemberBookingHistory(UUID userId) {
        // Mock booking history data - would need to integrate with actual booking system
        return java.util.stream.IntStream.range(0, (int) (Math.random() * 10) + 5)
                .mapToObj(i -> {
                    LocalDateTime startTime = LocalDateTime.now().minusDays((long) (Math.random() * 30));
                    LocalDateTime endTime = startTime.plusMinutes((long) (Math.random() * 240) + 60);
                    
                    MemberBookingHistoryDto booking = new MemberBookingHistoryDto();
                    booking.setBookingId("BK" + String.format("%06d", i + 1000));
                    booking.setStartTime(startTime);
                    booking.setEndTime(endTime);
                    booking.setEquipment("3D Printer, Laser Cutter");
                    booking.setMaterials("PLA Filament, Wood");
                    booking.setStatus(i % 4 == 0 ? "CANCELLED" : "COMPLETED");
                    booking.setProjectDescription("Custom " + (i % 2 == 0 ? "Phone Case" : "Art Project"));
                    booking.setDurationMinutes((int) java.time.Duration.between(startTime, endTime).toMinutes());
                    booking.setNotes("Project completed successfully");
                    return booking;
                })
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                .collect(Collectors.toList());
    }
    
    public List<MemberProjectParticipationDto> getMemberProjectParticipation(UUID userId) {
        // Mock project participation data - would need to integrate with actual project system
        return java.util.stream.IntStream.range(0, (int) (Math.random() * 5) + 2)
                .mapToObj(i -> {
                    LocalDateTime startDate = LocalDateTime.now().minusDays((long) (Math.random() * 60));
                    LocalDateTime endDate = i % 3 == 0 ? startDate.plusDays((long) (Math.random() * 14) + 7) : null;
                    
                    MemberProjectParticipationDto project = new MemberProjectParticipationDto();
                    project.setProjectId("PR" + String.format("%06d", i + 500));
                    project.setProjectName("Project " + (i + 1));
                    project.setDescription("Community " + (i % 2 == 0 ? "Garden" : "Tech") + " Initiative");
                    project.setStartDate(startDate);
                    project.setEndDate(endDate);
                    project.setStatus(endDate != null ? "COMPLETED" : "IN_PROGRESS");
                    project.setRole(i == 0 ? "LEAD" : "CONTRIBUTOR");
                    project.setHoursSpent((int) (Math.random() * 40) + 10);
                    project.setSkills("3D Printing, Design, Assembly");
                    project.setOutcome(endDate != null ? "Successfully delivered" : "In progress");
                    return project;
                })
                .sorted((a, b) -> b.getStartDate().compareTo(a.getStartDate()))
                .collect(Collectors.toList());
    }
    
    public List<MemberAttendanceRecordDto> getMemberAttendanceRecords(UUID userId) {
        // Mock attendance records - would need to integrate with actual attendance system
        return java.util.stream.IntStream.range(0, (int) (Math.random() * 15) + 10)
                .mapToObj(i -> {
                    LocalDate date = LocalDate.now().minusDays((long) (Math.random() * 90));
                    LocalDateTime checkInTime = date.atTime((int) (Math.random() * 4) + 9, (int) (Math.random() * 60));
                    LocalDateTime checkOutTime = checkInTime.plusHours((long) (Math.random() * 6) + 1);
                    
                    MemberAttendanceRecordDto record = new MemberAttendanceRecordDto();
                    record.setRecordId("AT" + String.format("%06d", i + 2000));
                    record.setDate(date);
                    record.setCheckInTime(checkInTime);
                    record.setCheckOutTime(checkOutTime);
                    record.setEventType(i % 3 == 0 ? "WORKSHOP" : "VISIT");
                    record.setEventName(i % 3 == 0 ? "3D Printing Workshop" : "General Facility Use");
                    record.setDurationMinutes((int) java.time.Duration.between(checkInTime, checkOutTime).toMinutes());
                    record.setNotes("Regular attendance");
                    record.setPresent(true);
                    return record;
                })
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
    }
}
