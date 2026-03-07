package com.makerspace.service;

import com.makerspace.entity.Contact;
import com.makerspace.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public Contact submitContact(Contact contact) {
        return contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {
        return contactRepository.findAllOrderByCreatedAtDesc();
    }

    public List<Contact> getContactsByStatus(String status) {
        return contactRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Optional<Contact> getContactById(Long id) {
        return contactRepository.findById(id);
    }

    public Contact markAsRead(Long id) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setStatus("READ");
            contact.setReadAt(LocalDateTime.now());
            return contactRepository.save(contact);
        }
        return null;
    }

    public Contact markAsResponded(Long id) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setStatus("RESPONDED");
            return contactRepository.save(contact);
        }
        return null;
    }

    public Contact updateStatus(Long id, String status) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setStatus(status);
            if ("READ".equals(status) && contact.getReadAt() == null) {
                contact.setReadAt(LocalDateTime.now());
            }
            return contactRepository.save(contact);
        }
        return null;
    }

    public void deleteContact(Long id) {
        contactRepository.deleteById(id);
    }

    public long getNewContactsCount() {
        return contactRepository.countByStatus("NEW");
    }

    public List<Contact> getRecentContacts(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return contactRepository.findRecentContacts(since);
    }

    public Contact createContact(String name, String email, String subject, String message) {
        Contact contact = new Contact(name, email, subject, message);
        return contactRepository.save(contact);
    }
}
