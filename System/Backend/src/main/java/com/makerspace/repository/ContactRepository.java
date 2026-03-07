package com.makerspace.repository;

import com.makerspace.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    List<Contact> findByStatus(String status);
    
    List<Contact> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT c FROM Contact c WHERE c.status = :status ORDER BY c.createdAt DESC")
    List<Contact> findByStatusWithSorting(@Param("status") String status);
    
    @Query("SELECT c FROM Contact c WHERE c.createdAt >= :since ORDER BY c.createdAt DESC")
    List<Contact> findRecentContacts(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(c) FROM Contact c WHERE c.status = :status")
    long countByStatus(@Param("status") String status);
    
    @Query("SELECT c FROM Contact c ORDER BY c.createdAt DESC")
    List<Contact> findAllOrderByCreatedAtDesc();
}
