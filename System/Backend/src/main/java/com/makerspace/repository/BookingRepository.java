package com.makerspace.repository;

import com.makerspace.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.user WHERE b.user.userId = :userId")
    List<Booking> findByUser_UserId(UUID userId);
    
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.user")
    List<Booking> findAllWithUser();
}
