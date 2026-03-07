package com.makerspace.repository;

import com.makerspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt <= :date AND u.status = 'ACTIVE'")
    int countActiveUsersByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(u) FROM User u WHERE DATE(u.createdAt) = :date")
    int countNewUsersByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 'SUSPENDED'")
    int countSuspendedUsersByDate(@Param("date") LocalDate date);
}

