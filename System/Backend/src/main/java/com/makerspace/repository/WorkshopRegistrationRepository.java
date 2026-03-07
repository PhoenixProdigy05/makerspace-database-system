package com.makerspace.repository;

import com.makerspace.entity.WorkshopRegistration;
import com.makerspace.entity.Workshop;
import com.makerspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkshopRegistrationRepository extends JpaRepository<WorkshopRegistration, UUID> {
    List<WorkshopRegistration> findByWorkshop_WorkshopId(UUID workshopId);
    Optional<WorkshopRegistration> findByWorkshopAndUser(Workshop workshop, User user);
}
