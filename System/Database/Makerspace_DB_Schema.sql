-- MAKERSPACE MANAGEMENT SYSTEM DATABASE SCHEMA (UPDATED)
-- PostgreSQL Schema Script
-- ---------------------------------------------------------

-- USERS TABLE
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) CHECK (role IN ('Admin', 'Staff', 'Member')) NOT NULL,
    staff_type VARCHAR(50) CHECK (staff_type IN ('Intern', 'Full_time')),
    notify_booking_updates BOOLEAN DEFAULT TRUE,
    notify_workshop_reminders BOOLEAN DEFAULT TRUE,
    notify_approval_updates BOOLEAN DEFAULT TRUE,
    notify_project_updates BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ARTICLES TABLE
CREATE TABLE articles (
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

-- WORKSHOPS TABLE
CREATE TABLE workshops (
    workshop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    instructor VARCHAR(100),
    date TIMESTAMP,
    capacity INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WORKSHOP_REGISTRATIONS TABLE
CREATE TABLE workshop_registrations (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(workshop_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workshop_id, user_id) -- One registration per user per workshop
);

-- INVENTORY ITEMS TABLE
CREATE TABLE inventory_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    unit VARCHAR(20),
    quantity NUMERIC(10,2) DEFAULT 0,
    threshold NUMERIC(10,2) DEFAULT 0,
    location VARCHAR(100),
    supplier VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ATTACHMENTS TABLE
CREATE TABLE attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_table TEXT NOT NULL,
    owner_id UUID NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    tools TEXT NOT NULL,
    materials TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15),
    appointment_time TIMESTAMP NULL,
    notes TEXT,
    appointment_type VARCHAR(50),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED','OVERDUE')) DEFAULT 'PENDING',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    project_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- End of Schema
