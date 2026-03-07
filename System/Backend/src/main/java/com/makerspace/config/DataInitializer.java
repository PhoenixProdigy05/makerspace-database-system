package com.makerspace.config;

import com.makerspace.entity.User;
import com.makerspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String email = "ivanboye@gmail.com";
        if (!userRepository.existsByEmail(email)) {
            User admin = new User();
            admin.setFullName("Ivan Boye");
            admin.setEmail(email);
            admin.setPasswordHash(passwordEncoder.encode("12345"));
            admin.setPhoneNumber(null);
            admin.setRole(User.Role.Admin);
            admin.setStaffType(null);
            admin.setCreatedBy(null);
            userRepository.save(admin);
        }
    }
}
