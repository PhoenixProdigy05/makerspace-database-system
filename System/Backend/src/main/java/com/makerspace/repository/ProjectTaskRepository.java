package com.makerspace.repository;

import com.makerspace.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, UUID> {
    
    List<ProjectTask> findByBooking_BookingIdOrderByOrderIndexAsc(UUID bookingId);
    
    @Query("SELECT COUNT(pt) FROM ProjectTask pt WHERE pt.booking.bookingId = :bookingId AND pt.isCompleted = true")
    Long countCompletedTasksByBookingId(@Param("bookingId") UUID bookingId);
    
    @Query("SELECT COUNT(pt) FROM ProjectTask pt WHERE pt.booking.bookingId = :bookingId")
    Long countTotalTasksByBookingId(@Param("bookingId") UUID bookingId);
    
    void deleteByBooking_BookingId(UUID bookingId);
}
