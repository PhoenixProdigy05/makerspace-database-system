package com.makerspace.service;

import com.makerspace.dto.BookingResponse;
import com.makerspace.dto.CreateBookingRequest;
import com.makerspace.dto.UpdateBookingProgressRequest;
import com.makerspace.dto.UpdateBookingStatusRequest;
import com.makerspace.dto.UpdateBookingDetailsRequest;
import com.makerspace.entity.Booking;
import com.makerspace.entity.User;
import com.makerspace.entity.InventoryItem;
import com.makerspace.repository.BookingRepository;
import com.makerspace.repository.UserRepository;
import com.makerspace.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .bookingId(b.getBookingId() != null ? b.getBookingId().toString() : null)
                .tools(b.getTools() != null ? b.getTools() : "")
                .materials(b.getMaterials() != null ? b.getMaterials() : "")
                .durationMinutes(b.getDurationMinutes() != null ? b.getDurationMinutes() : 0)
                .appointmentTime(b.getAppointmentTime() != null ? b.getAppointmentTime().toString() : null)
                .appointmentType(b.getAppointmentType() != null ? b.getAppointmentType().name() : null)
                .notes(b.getNotes())
                .status(b.getStatus() != null ? b.getStatus().name() : Booking.Status.PENDING.name())
                .progress(b.getProgress() == null ? 0 : b.getProgress())
                .projectDescription(b.getProjectDescription())
                .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null)
                // Include member information
                .userId(b.getUser() != null && b.getUser().getUserId() != null ? b.getUser().getUserId().toString() : null)
                .memberName(b.getUser() != null ? b.getUser().getFullName() : null)
                .memberEmail(b.getUser() != null ? b.getUser().getEmail() : null)
                .build();
    }

    public BookingResponse createBooking(UUID userId, CreateBookingRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setTools(req.getTools());
        booking.setMaterials(req.getMaterials());
        booking.setDurationMinutes(req.getDurationMinutes());
        booking.setNotes(req.getNotes());
        booking.setProjectDescription(req.getProjectDescription());
        booking.setStatus(Booking.Status.PENDING);
        booking.setProgress(0);
        if (req.getAppointmentType() != null && !req.getAppointmentType().isBlank()) {
            booking.setAppointmentType(Booking.AppointmentType.valueOf(req.getAppointmentType()));
        }
        if (req.getAppointmentTime() != null && !req.getAppointmentTime().isBlank()) {
            booking.setAppointmentTime(LocalDateTime.parse(req.getAppointmentTime(), DateTimeFormatter.ISO_DATE_TIME));
        }
        if (req.getEquipmentId() != null && !req.getEquipmentId().isBlank()) {
            InventoryItem item = inventoryItemRepository.findById(UUID.fromString(req.getEquipmentId()))
                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));
            booking.setEquipment(item);
            booking.setEquipmentQuantity(req.getEquipmentQuantity());
        }
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public List<BookingResponse> getBookingsForUser(UUID userId) {
        return bookingRepository.findByUser_UserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse updateStatus(UUID bookingId, UpdateBookingStatusRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        Booking.Status status = Booking.Status.valueOf(req.getStatus());
        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponse updateMemberBookingStatus(UUID bookingId, UpdateBookingStatusRequest req, UUID staffUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Validate that booking belongs to a member (not staff or admin)
        if (booking.getUser() == null || booking.getUser().getRole() != User.Role.Member) {
            throw new IllegalArgumentException("Staff can only update booking status for member bookings");
        }
        
        Booking.Status status = Booking.Status.valueOf(req.getStatus());
        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponse updateProgress(UUID bookingId, UpdateBookingProgressRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setProgress(req.getProgress());
        booking.setProjectDescription(req.getProjectDescription());
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public List<BookingResponse> listAllBookings() {
        return bookingRepository.findAllWithUser().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse updateDetails(UUID bookingId, UpdateBookingDetailsRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (req.getAppointmentTime() != null) {
            if (req.getAppointmentTime().isBlank()) {
                booking.setAppointmentTime(null);
            } else {
                booking.setAppointmentTime(LocalDateTime.parse(req.getAppointmentTime(), DateTimeFormatter.ISO_DATE_TIME));
            }
        }
        if (req.getNotes() != null) {
            booking.setNotes(req.getNotes());
        }
        if (req.getAppointmentType() != null) {
            if (req.getAppointmentType().isBlank()) {
                booking.setAppointmentType(null);
            } else {
                booking.setAppointmentType(Booking.AppointmentType.valueOf(req.getAppointmentType()));
            }
        }
        if (req.getProjectDescription() != null) {
            booking.setProjectDescription(req.getProjectDescription());
        }
        if (req.getEquipmentId() != null) {
            if (req.getEquipmentId().isBlank()) {
                booking.setEquipment(null);
                booking.setEquipmentQuantity(null);
            } else {
                InventoryItem item = inventoryItemRepository.findById(UUID.fromString(req.getEquipmentId()))
                        .orElseThrow(() -> new RuntimeException("Inventory item not found"));
                booking.setEquipment(item);
                if (req.getEquipmentQuantity() != null) {
                    booking.setEquipmentQuantity(req.getEquipmentQuantity());
                }
            }
        } else if (req.getEquipmentQuantity() != null) {
            // If only quantity provided, update it
            booking.setEquipmentQuantity(req.getEquipmentQuantity());
        }
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponse cancelBooking(UUID userId, UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getUser() == null || booking.getUser().getUserId() == null || !booking.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("You are not allowed to cancel this booking");
        }
        Booking.Status status = booking.getStatus();
        if (status == Booking.Status.CANCELLED || status == Booking.Status.COMPLETED || status == Booking.Status.OVERDUE) {
            throw new IllegalArgumentException("Booking cannot be cancelled in its current status");
        }
        booking.setStatus(Booking.Status.CANCELLED);
        Booking savedCancel = bookingRepository.save(booking);
        return toResponse(savedCancel);
    }

    public BookingResponse returnBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(Booking.Status.COMPLETED);
        // Adjust inventory if equipment is tracked on this booking
        if (booking.getEquipment() != null && booking.getEquipmentQuantity() != null) {
            InventoryItem item = booking.getEquipment();
            item.setQuantity(item.getQuantity().add(booking.getEquipmentQuantity()));
            inventoryItemRepository.save(item);
        }
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }
}
