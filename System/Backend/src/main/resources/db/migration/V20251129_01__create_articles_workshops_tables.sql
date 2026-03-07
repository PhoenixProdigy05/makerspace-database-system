-- Create articles table for Article entity
CREATE TABLE IF NOT EXISTS articles (
    article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    image_url TEXT,
    content TEXT,
    tags TEXT, -- comma-separated tags
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED')) DEFAULT 'DRAFT',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workshops table for Workshop entity
CREATE TABLE IF NOT EXISTS workshops (
    workshop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    instructor VARCHAR(100),
    date TIMESTAMP,
    capacity INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workshop_registrations table for WorkshopRegistration entity
CREATE TABLE IF NOT EXISTS workshop_registrations (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(workshop_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workshop_id, user_id) -- One registration per user per workshop
);

-- Fix staff_type enum constraint to match backend StaffTypeConverter
ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_staff_type_check,
    ADD CONSTRAINT users_staff_type_check 
    CHECK (staff_type IN ('Intern', 'Full_time'));
