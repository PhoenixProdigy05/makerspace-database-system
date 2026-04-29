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
        // Execute all database migrations manually
        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            
            // User table migrations
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_area VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED'))");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_booking_updates BOOLEAN NOT NULL DEFAULT true");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_workshop_reminders BOOLEAN NOT NULL DEFAULT true");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_approval_updates BOOLEAN NOT NULL DEFAULT true");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_project_updates BOOLEAN NOT NULL DEFAULT true");
            
            // Fix staff_type constraint
            try {
                jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_staff_type_check");
                jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_staff_type_check CHECK (staff_type IN ('Intern', 'Full_time'))");
            } catch (Exception e) {
                System.out.println("Staff type constraint already exists or not needed: " + e.getMessage());
            }
            
            // Booking table migrations
            jdbcTemplate.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_item_id UUID");
            jdbcTemplate.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_quantity NUMERIC(10,2)");
            
            // Add foreign key for bookings
            try {
                jdbcTemplate.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.table_constraints tc
                            WHERE tc.table_name = 'bookings'
                              AND tc.constraint_type = 'FOREIGN KEY'
                              AND tc.constraint_name = 'fk_bookings_equipment_item'
                        ) THEN
                            ALTER TABLE bookings
                                ADD CONSTRAINT fk_bookings_equipment_item
                                FOREIGN KEY (equipment_item_id)
                                REFERENCES inventory_items(item_id);
                        END IF;
                    END $$
                """);
            } catch (Exception e) {
                System.out.println("Foreign key already exists or inventory_items table not ready: " + e.getMessage());
            }
            
            // Create articles table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS articles (
                    article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    title VARCHAR(255) NOT NULL,
                    author VARCHAR(100),
                    image_url TEXT,
                    content TEXT,
                    tags TEXT,
                    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED')) DEFAULT 'DRAFT',
                    published_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);
            
            // Create workshops table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS workshops (
                    workshop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    title VARCHAR(255) NOT NULL,
                    instructor VARCHAR(100),
                    date TIMESTAMP,
                    capacity INTEGER,
                    status VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')) DEFAULT 'SCHEDULED',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);
            
            // Create workshop_registrations table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS workshop_registrations (
                    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    workshop_id UUID NOT NULL REFERENCES workshops(workshop_id) ON DELETE CASCADE,
                    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(workshop_id, user_id)
                )
            """);
            
            // Create activities table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS activities (
                    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    type VARCHAR(20) NOT NULL CHECK (type IN ('BOOKING', 'INVENTORY', 'ARTICLE', 'WORKSHOP', 'USER')),
                    message TEXT NOT NULL,
                    actor_id UUID REFERENCES users(user_id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);
            
            // Create indexes for activities
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_activities_actor_id ON activities(actor_id)");
            
            // Create project_tasks table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS project_tasks (
                    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    description VARCHAR(255) NOT NULL,
                    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
                    order_index INTEGER,
                    booking_id UUID NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_project_tasks_booking_id 
                        FOREIGN KEY (booking_id) 
                        REFERENCES bookings (booking_id) 
                        ON DELETE CASCADE
                )
            """);
            
            // Create indexes for project_tasks
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_project_tasks_booking_id ON project_tasks(booking_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_project_tasks_order_index ON project_tasks(booking_id, order_index)");
            
            // Create gallery table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS gallery (
                    gallery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    image_url VARCHAR(500) NOT NULL,
                    display_order INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);
            
            // Convert gallery to base64 (add image_data column)
            jdbcTemplate.execute("ALTER TABLE gallery ADD COLUMN IF NOT EXISTS image_data TEXT");
            
            // Create index for gallery
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order)");
            
            // Create contacts table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    subject VARCHAR(500) NOT NULL,
                    message TEXT,
                    status VARCHAR(50) DEFAULT 'NEW',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    read_at TIMESTAMP NULL
                )
            """);
            
            // Create indexes for contacts
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_status ON contacts(status)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON contacts(created_at)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_email ON contacts(email)");
            
            System.out.println("All database migrations executed successfully");
            
        } catch (Exception e) {
            System.err.println("Error during migrations: " + e.getMessage());
            e.printStackTrace();
        }

        // Create admin user
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
            admin.setStatus(User.Status.ACTIVE);
            userRepository.save(admin);
            System.out.println("Admin user created successfully");
        }
    }
}
