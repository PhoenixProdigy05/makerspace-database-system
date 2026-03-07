package com.makerspace.service;

import com.makerspace.dto.*;
import com.makerspace.entity.Booking;
import com.makerspace.entity.ProjectTask;
import com.makerspace.entity.Attachment;
import com.makerspace.entity.InventoryItem;
import com.makerspace.repository.BookingRepository;
import com.makerspace.repository.ProjectTaskRepository;
import com.makerspace.repository.AttachmentRepository;
import com.makerspace.repository.InventoryItemRepository;
import com.makerspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectWorkspaceService {

    // Service for managing project workspace data
    // Handles booking, task, and attachment operations

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ProjectTaskRepository projectTaskRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    private ProjectTaskResponse toTaskResponse(ProjectTask task) {
        return ProjectTaskResponse.builder()
                .taskId(task.getTaskId() != null ? task.getTaskId().toString() : null)
                .description(task.getDescription())
                .isCompleted(task.getIsCompleted() != null ? task.getIsCompleted() : false)
                .orderIndex(task.getOrderIndex())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private AttachmentResponse toAttachmentResponse(Attachment attachment) {
        return AttachmentResponse.builder()
                .attachmentId(attachment.getAttachmentId())
                .filename(attachment.getFilename())
                .fileUrl(attachment.getFileUrl())
                .uploadedAt(attachment.getUploadedAt())
                .uploadedByName(attachment.getUploadedBy() != null ? attachment.getUploadedBy().getFullName() : null)
                .build();
    }

    private InventoryItemResponse toInventoryResponse(InventoryItem item) {
        return new InventoryItemResponse(
                item.getItemId(),
                item.getName(),
                item.getSku(),
                item.getUnit(),
                item.getQuantity(),
                item.getThreshold(),
                item.getLocation(),
                item.getSupplier(),
                item.getIsActive(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.getQuantity() != null && item.getThreshold() != null && item.getQuantity().compareTo(item.getThreshold()) <= 0
        );
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .bookingId(booking.getBookingId() != null ? booking.getBookingId().toString() : null)
                .tools(booking.getTools() != null ? booking.getTools() : "")
                .materials(booking.getMaterials() != null ? booking.getMaterials() : "")
                .durationMinutes(booking.getDurationMinutes() != null ? booking.getDurationMinutes() : 0)
                .appointmentTime(booking.getAppointmentTime() != null ? booking.getAppointmentTime().toString() : null)
                .appointmentType(booking.getAppointmentType() != null ? booking.getAppointmentType().name() : null)
                .notes(booking.getNotes())
                .status(booking.getStatus() != null ? booking.getStatus().name() : Booking.Status.PENDING.name())
                .progress(booking.getProgress() == null ? 0 : booking.getProgress())
                .projectDescription(booking.getProjectDescription())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .userId(booking.getUser() != null && booking.getUser().getUserId() != null ? booking.getUser().getUserId().toString() : null)
                .memberName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .memberEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .build();
    }

    public ProjectWorkspaceResponse getProjectWorkspace(UUID bookingId, UUID currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify user has access to this booking
        if (booking.getUser() == null || booking.getUser().getUserId() == null || !booking.getUser().getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("You don't have access to this project");
        }

        // Get tasks
        List<ProjectTask> tasks = projectTaskRepository.findByBooking_BookingIdOrderByOrderIndexAsc(bookingId);
        List<ProjectTaskResponse> taskResponses = tasks.stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());

        // Get attachments
        List<Attachment> attachments = attachmentRepository.findByOwnerTableAndOwnerId("bookings", bookingId);
        List<AttachmentResponse> attachmentResponses = attachments.stream()
                .map(this::toAttachmentResponse)
                .collect(Collectors.toList());

        // Get machine info
        InventoryItemResponse machineResponse = null;
        if (booking.getEquipment() != null) {
            machineResponse = toInventoryResponse(booking.getEquipment());
        }

        // Get task counts
        Long completedTasksCount = projectTaskRepository.countCompletedTasksByBookingId(bookingId);
        Long totalTasksCount = projectTaskRepository.countTotalTasksByBookingId(bookingId);

        // Get booking response
        BookingResponse bookingResponse = toBookingResponse(booking);

        return ProjectWorkspaceResponse.builder()
                .bookingId(bookingResponse.getBookingId())
                .tools(bookingResponse.getTools())
                .materials(bookingResponse.getMaterials())
                .durationMinutes(bookingResponse.getDurationMinutes())
                .appointmentTime(bookingResponse.getAppointmentTime())
                .appointmentType(bookingResponse.getAppointmentType())
                .notes(bookingResponse.getNotes())
                .status(bookingResponse.getStatus())
                .progress(bookingResponse.getProgress())
                .projectDescription(bookingResponse.getProjectDescription())
                .createdAt(bookingResponse.getCreatedAt())
                .userId(bookingResponse.getUserId())
                .memberName(bookingResponse.getMemberName())
                .memberEmail(bookingResponse.getMemberEmail())
                .tasks(taskResponses)
                .attachments(attachmentResponses)
                .machine(machineResponse)
                .completedTasksCount(completedTasksCount.intValue())
                .totalTasksCount(totalTasksCount.intValue())
                .build();
    }

    public ProjectTaskResponse createTask(UUID bookingId, UUID currentUserId, String description, Integer orderIndex) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify user has access to this booking
        if (booking.getUser() == null || booking.getUser().getUserId() == null || !booking.getUser().getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("You don't have access to this project");
        }

        ProjectTask task = ProjectTask.builder()
                .description(description)
                .isCompleted(false)
                .orderIndex(orderIndex)
                .booking(booking)
                .build();

        ProjectTask saved = projectTaskRepository.save(task);
        return toTaskResponse(saved);
    }

    public ProjectTaskResponse updateTaskStatus(UUID taskId, UUID currentUserId, Boolean isCompleted) {
        ProjectTask task = projectTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify user has access to this booking
        if (task.getBooking() == null || task.getBooking().getUser() == null || task.getBooking().getUser().getUserId() == null || !task.getBooking().getUser().getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("You don't have access to this project");
        }

        task.setIsCompleted(isCompleted);
        ProjectTask saved = projectTaskRepository.save(task);

        // Update booking progress based on completed tasks
        updateBookingProgressFromTasks(task.getBooking().getBookingId());

        return toTaskResponse(saved);
    }

    public void deleteTask(UUID taskId, UUID currentUserId) {
        ProjectTask task = projectTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify user has access to this booking
        if (task.getBooking() == null || task.getBooking().getUser() == null || task.getBooking().getUser().getUserId() == null || !task.getBooking().getUser().getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("You don't have access to this project");
        }

        projectTaskRepository.delete(task);
        updateBookingProgressFromTasks(task.getBooking().getBookingId());
    }

    private void updateBookingProgressFromTasks(UUID bookingId) {
        Long completedTasks = projectTaskRepository.countCompletedTasksByBookingId(bookingId);
        Long totalTasks = projectTaskRepository.countTotalTasksByBookingId(bookingId);

        if (totalTasks > 0) {
            int progress = (int) ((completedTasks.doubleValue() / totalTasks.doubleValue()) * 100);
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking != null) {
                booking.setProgress(progress);
                
                // Auto-change status to COMPLETED when all tasks are done (progress = 100%)
                if (progress == 100 && booking.getStatus() == Booking.Status.APPROVED) {
                    booking.setStatus(Booking.Status.COMPLETED);
                }
                
                bookingRepository.save(booking);
            }
        }
    }
}
