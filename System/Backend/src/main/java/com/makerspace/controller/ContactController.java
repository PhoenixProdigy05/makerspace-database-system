package com.makerspace.controller;

import com.makerspace.entity.Contact;
import com.makerspace.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contacts")
@Tag(name = "Contact Management", description = "APIs for managing contact form submissions")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping
    @Operation(summary = "Submit a contact form", description = "Creates a new contact submission")
    public ResponseEntity<Contact> submitContact(@RequestBody Contact contact) {
        try {
            Contact savedContact = contactService.submitContact(contact);
            return ResponseEntity.ok(savedContact);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit contact form with individual fields", description = "Creates a new contact submission from form fields")
    public ResponseEntity<Contact> submitContactForm(@RequestBody ContactRequest request) {
        try {
            Contact contact = contactService.createContact(
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage()
            );
            return ResponseEntity.ok(contact);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    @Operation(summary = "Get all contacts", description = "Retrieves all contact submissions ordered by creation date")
    public ResponseEntity<List<Contact>> getAllContacts() {
        List<Contact> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get contacts by status", description = "Retrieves contacts filtered by status")
    public ResponseEntity<List<Contact>> getContactsByStatus(@PathVariable String status) {
        List<Contact> contacts = contactService.getContactsByStatus(status);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contact by ID", description = "Retrieves a specific contact submission")
    public ResponseEntity<Contact> getContactById(@PathVariable Long id) {
        Optional<Contact> contact = contactService.getContactById(id);
        return contact.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark contact as read", description = "Updates contact status to READ")
    public ResponseEntity<Contact> markAsRead(@PathVariable Long id) {
        Contact contact = contactService.markAsRead(id);
        return contact != null ? ResponseEntity.ok(contact) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/responded")
    @Operation(summary = "Mark contact as responded", description = "Updates contact status to RESPONDED")
    public ResponseEntity<Contact> markAsResponded(@PathVariable Long id) {
        Contact contact = contactService.markAsResponded(id);
        return contact != null ? ResponseEntity.ok(contact) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update contact status", description = "Updates contact status to specified value")
    public ResponseEntity<Contact> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        Contact contact = contactService.updateStatus(id, request.getStatus());
        return contact != null ? ResponseEntity.ok(contact) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete contact", description = "Deletes a contact submission")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/new-count")
    @Operation(summary = "Get new contacts count", description = "Returns the count of contacts with NEW status")
    public ResponseEntity<Long> getNewContactsCount() {
        long count = contactService.getNewContactsCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/recent/{days}")
    @Operation(summary = "Get recent contacts", description = "Returns contacts from the last N days")
    public ResponseEntity<List<Contact>> getRecentContacts(@PathVariable int days) {
        List<Contact> contacts = contactService.getRecentContacts(days);
        return ResponseEntity.ok(contacts);
    }

    // DTO classes for request bodies
    public static class ContactRequest {
        private String name;
        private String email;
        private String subject;
        private String message;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
