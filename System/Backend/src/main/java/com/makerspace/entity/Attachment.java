package com.makerspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attachment_id")
    private UUID attachmentId;
    
    @Column(name = "owner_table", nullable = false)
    private String ownerTable;
    
    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;
    
    @Column(name = "filename", nullable = false)
    private String filename;
    
    @Column(name = "file_url", nullable = false)
    private String fileUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
    
    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
    
    // Explicit getters to ensure compilation works
    public UUID getAttachmentId() {
        return attachmentId;
    }
    
    public String getOwnerTable() {
        return ownerTable;
    }
    
    public UUID getOwnerId() {
        return ownerId;
    }
    
    public String getFilename() {
        return filename;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public User getUploadedBy() {
        return uploadedBy;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setAttachmentId(UUID attachmentId) {
        this.attachmentId = attachmentId;
    }
    
    public void setOwnerTable(String ownerTable) {
        this.ownerTable = ownerTable;
    }
    
    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }
    
    public void setFilename(String filename) {
        this.filename = filename;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}

