package com.makerspace.service;

import com.makerspace.dto.AttachmentResponse;
import com.makerspace.entity.Attachment;
import com.makerspace.entity.User;
import com.makerspace.repository.AttachmentRepository;
import com.makerspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {
    
    @Autowired
    private AttachmentRepository attachmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    private Path getUploadPath() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            return uploadPath;
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }
    
    @Transactional
    public AttachmentResponse uploadFile(MultipartFile file, String ownerTable, UUID ownerId, UUID uploadedBy) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }
            
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                throw new RuntimeException("Filename is empty");
            }
            
            // Generate unique filename
            String fileExtension = "";
            int lastDotIndex = originalFilename.lastIndexOf('.');
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex);
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path uploadPath = getUploadPath();
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Get user
            User user = userRepository.findById(uploadedBy)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Create attachment record
            Attachment attachment = Attachment.builder()
                    .ownerTable(ownerTable)
                    .ownerId(ownerId)
                    .filename(originalFilename)
                    .fileUrl(uniqueFilename)
                    .uploadedBy(user)
                    .build();
            
            Attachment savedAttachment = attachmentRepository.save(attachment);
            return convertToResponse(savedAttachment);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
    
    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = getUploadPath().resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + filename, e);
        }
    }
    
    public List<AttachmentResponse> getAttachmentsByOwner(String ownerTable, UUID ownerId) {
        return attachmentRepository.findAll().stream()
                .filter(att -> att.getOwnerTable().equals(ownerTable) && att.getOwnerId().equals(ownerId))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public AttachmentResponse getAttachmentById(UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        return convertToResponse(attachment);
    }
    
    @Transactional
    public void deleteAttachment(UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        
        // Delete file from filesystem
        try {
            Path filePath = getUploadPath().resolve(attachment.getFileUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but continue with database deletion
        }
        
        // Delete from database
        attachmentRepository.delete(attachment);
    }
    
    private AttachmentResponse convertToResponse(Attachment attachment) {
        return AttachmentResponse.builder()
                .attachmentId(attachment.getAttachmentId())
                .ownerTable(attachment.getOwnerTable())
                .ownerId(attachment.getOwnerId())
                .filename(attachment.getFilename())
                .fileUrl(attachment.getFileUrl())
                .uploadedBy(attachment.getUploadedBy() != null ? attachment.getUploadedBy().getUserId() : null)
                .uploadedByName(attachment.getUploadedBy() != null ? attachment.getUploadedBy().getFullName() : null)
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}

