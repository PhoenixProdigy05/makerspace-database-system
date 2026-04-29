package com.makerspace.config;

import com.makerspace.entity.User;
import com.makerspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) {
        // Add missing assigned_area column if it doesn't exist
        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_area VARCHAR(50)");
            System.out.println("assigned_area column added/verified successfully");
        } catch (Exception e) {
            System.err.println("Error adding assigned_area column: " + e.getMessage());
        }

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
            admin.setAssignedArea(null);
            userRepository.save(admin);
            System.out.println("Admin user created successfully");
        }
    }
}
