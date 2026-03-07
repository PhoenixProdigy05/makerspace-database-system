package com.makerspace.repository;

import com.makerspace.entity.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkshopRepository extends JpaRepository<Workshop, UUID> {
}
